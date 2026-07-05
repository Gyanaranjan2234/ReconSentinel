import asyncio
import sys
import logging
from datetime import datetime
import socket
import uuid
from fastapi import APIRouter, HTTPException, status
from scanners.service import authorize_target, normalize_port_range, run_nmap_scan, ping_target
from schemas import ScanCreate, ScanResultResponse

router = APIRouter(prefix="/scan", tags=["Scanner"])

# In-memory store for stateless scans
active_scans = {}

def update_scan_record(
    scan_id: str, 
    status_text: str, 
    results: dict, 
    start_time: datetime = None, 
    end_time: datetime = None, 
    duration: float = None
) -> None:
    if scan_id in active_scans:
        scan = active_scans[scan_id]
        
        progress_val = results.get("progress", "?") if isinstance(results, dict) else "?"
        stage_val = results.get("stage", "?") if isinstance(results, dict) else "?"
        msg = f"[SCAN {scan_id}] Updating: status={status_text}, progress={progress_val}%, stage={stage_val}\n"
        sys.stdout.write(msg)
        sys.stdout.flush()
        
        scan["status"] = status_text
        scan["results"] = dict(results)
        if start_time:
            scan["start_time"] = start_time
        if end_time:
            scan["end_time"] = end_time
        if duration is not None:
            scan["duration"] = duration


def run_scan_job(scan_id: str, scan_data: dict) -> None:
    import traceback
    import os
    try:
        start_time = datetime.utcnow()
        
        # Immediately indicate that the job has started to unblock the frontend's 0% queued state
        progress = {
            "stage": "starting_scan",
            "progress": 5,
            "target": scan_data["target"],
        }
        update_scan_record(scan_id, "running", progress, start_time=start_time)

        # Step: Target IP resolution & Reverse DNS
        target = scan_data["target"]
        resolved_ip = "Unknown"
        resolved_hostname = target
        reverse_dns = "N/A"

        try:
            from scanners.service import is_valid_ipv4_address, resolve_host
            if is_valid_ipv4_address(target):
                resolved_ip = target
            else:
                ips = resolve_host(target)
                if ips:
                    resolved_ip = ips[0]
                    
            if resolved_ip and resolved_ip != "Unknown":
                name_info = socket.gethostbyaddr(resolved_ip)
                reverse_dns = name_info[0]
                resolved_hostname = name_info[0]
        except Exception as exc:
            logging.warning(f"[SCAN {scan_id}] Host resolution failed: {exc}")

        port_range = normalize_port_range(scan_data.get("port_range", "1-1024"))
        aggressive = scan_data.get("aggressive_detection", False)
        ping_disc = scan_data.get("ping_discovery", True)

        # Step: Ping Discovery
        try:
            if ping_disc:
                ping_summary = ping_target(target)
                progress.update({"stage": "host_discovery", "progress": 20, "ping": ping_summary})
                update_scan_record(scan_id, "running", progress)
            else:
                ping_summary = None
        except Exception as exc:
            logging.error(f"[SCAN {scan_id}] Ping discovery failed: {exc}\n{traceback.format_exc()}")
            raise Exception(f"Ping discovery step failed: {exc}")

        # Step: Nmap Port Scan
        logging.info(f"RUNNING NMAP {target}")
        import shutil
        if not shutil.which("nmap"):
            raise Exception("Nmap not installed or not found in PATH")
            
        progress.update({"stage": "port_scan", "progress": 50})
        update_scan_record(scan_id, "running", progress)

        logging.info(f"Selected Scan Options:\nPing Discovery = {ping_disc}\nAggressive Detection = {aggressive}")

        if aggressive:
            progress.update({"stage": "service_detection", "progress": 75})
            update_scan_record(scan_id, "running", progress)
            
            progress.update({"stage": "os_fingerprinting", "progress": 90})
            update_scan_record(scan_id, "running", progress)

        try:
            scan_result = run_nmap_scan(
                target,
                port_range,
                scan_data.get("threads", 8),
                ping_disc,
                aggressive,
            )
        except Exception as exc:
            logging.error(f"[SCAN {scan_id}] Nmap execution/parsing failed: {exc}\n{traceback.format_exc()}")
            raise Exception(f"Nmap execution or XML parsing failed: {exc}")

        end_time = datetime.utcnow()
        duration_val = (end_time - start_time).total_seconds()

        scan_result["stage"] = "completed"
        scan_result["progress"] = 100
        scan_result["ping"] = ping_summary

        # Inject scan parameters and host metadata
        scan_result["port_range"] = port_range
        scan_result["threads"] = scan_data.get("threads", 8)
        scan_result["aggressive_detection"] = aggressive
        scan_result["ping_discovery"] = ping_disc
        
        scan_type = "host_discovery" if (ping_disc and not aggressive) else "advanced"
        scan_result["scan_type"] = scan_type
        
        scan_result["resolved_ip"] = resolved_ip
        scan_result["resolved_hostname"] = resolved_hostname
        scan_result["reverse_dns"] = reverse_dns
        
        # Step: OS Intelligence (Nmap OS)
        if aggressive:
            from scanners.service import is_private_host
            
            if is_private_host(resolved_ip) or resolved_ip == "Unknown" or resolved_ip == "127.0.0.1" or resolved_ip == "localhost":
                scan_result["osIntelligence"] = {"status": "private_ip", "message": "OS intelligence is only available for public internet hosts."}
                logging.info(f"[SCAN {scan_id}] OS Intelligence skipped for private/unknown IP: {resolved_ip}")
            else:
                try:
                    from intelligence.os_intelligence import get_host_os_intelligence
                    open_ports = scan_result.get("open_ports", [])
                    os_response = get_host_os_intelligence(resolved_ip, open_ports)
                    scan_result["osIntelligence"] = os_response
                    logging.info(f"[SCAN {scan_id}] OS lookup completed with status: {os_response.get('status')}")
                except Exception as exc:
                    logging.warning(f"[SCAN {scan_id}] OS integration failed, skipping gracefully: {exc}")
                    scan_result["osIntelligence"] = {"status": "error", "message": "Unexpected error during OS lookup."}
        else:
            scan_result["osIntelligence"] = {"status": "disabled", "message": "Aggressive detection not selected."}


        # Step: Vulnerability Analysis
        try:
            progress.update({"stage": "vulnerability_analysis", "progress": 95})
            update_scan_record(scan_id, "running", progress)

            from reports.service import get_scan_cves
            from intelligence.risk import calculate_risk
            from intelligence.mitre import get_techniques
            
            hosts = scan_result.get("hosts", [])
            ports = hosts[0].get("ports", []) if hosts else []
            cves = get_scan_cves(ports)
            scan_result["cves"] = cves
            scan_result["risk"] = calculate_risk(ports, cves)
            scan_result["mitre_mappings"] = get_techniques(ports)
        except Exception as exc:
            logging.warning(f"[SCAN {scan_id}] Vulnerability analysis failed, continuing: {exc}")
            scan_result["cves"] = []
            scan_result["risk"] = {"score": 0.0, "level": "Not Assessed"}
            scan_result["mitre_mappings"] = []
            
        end_time = datetime.utcnow()
        update_scan_record(scan_id, "completed", scan_result, end_time=end_time, duration=duration_val)
        logging.info(f"SCAN COMPLETED {scan_id}")
        
    except Exception as exc:
        logging.error(f"[SCAN {scan_id}] Background scan failed: {exc}\n{traceback.format_exc()}")
        end_time = datetime.utcnow()
        duration_val = (end_time - start_time).total_seconds() if 'start_time' in locals() else 0
        update_scan_record(
            scan_id, 
            "failed", 
            {"error": str(exc), "stage": "failed", "progress": 100}, 
            end_time=end_time, 
            duration=duration_val
        )


@router.post("/", status_code=status.HTTP_201_CREATED)
async def trigger_scan(scan_request: ScanCreate):
    """
    Trigger a network/host scanner task for authorized targets.
    """
    import traceback
    import os
    import shutil
    from fastapi.responses import JSONResponse
    from scanners.service import build_nmap_arguments

    try:
        # Wrap everything in try/catch to identify exact step failure
        scan_data = scan_request.model_dump() if hasattr(scan_request, "model_dump") else scan_request.dict()
        
        logging.info("--- SCAN INITIATED ---")
        logging.info(f"Request payload: {scan_data}")
        logging.info(f"Target host: {scan_request.target}")
        
        port_range = scan_data.get("port_range", "1-1024")
        threads = scan_data.get("threads", 8)
        aggressive = scan_data.get("aggressive_detection", False)
        ping_disc = scan_data.get("ping_discovery", True)
        
        logging.info(f"Port range: {port_range}")
        logging.info(f"Scan options: Threads={threads}, Aggressive={aggressive}, Ping={ping_disc}")
        
        # Step: Nmap command generation check
        try:
            nmap_cmd = build_nmap_arguments(port_range, threads, aggressive, ping_disc)
            logging.info(f"Generated Nmap arguments: {nmap_cmd}")
        except Exception as exc:
            error_msg = f"Failed to generate Nmap command: {exc}"
            logging.error(f"Step failed: Nmap command generation - {error_msg}\n{traceback.format_exc()}")
            return JSONResponse(status_code=500, content={"success": False, "error": error_msg})

        # Verify Nmap exists
        if not shutil.which("nmap"):
            error_msg = "Nmap not installed or not found in PATH"
            logging.error(f"Step failed: Nmap execution environment - {error_msg}")
            return JSONResponse(status_code=500, content={"success": False, "error": error_msg})

        # Step: Input validation & Host resolution
        try:
            authorize_target(scan_request.target)
        except ValueError as exc:
            error_msg = str(exc)
            logging.error(f"Step failed: Input validation - {error_msg}")
            return JSONResponse(status_code=400, content={"success": False, "error": error_msg})
        except Exception as exc:
            error_msg = str(exc)
            logging.error(f"Step failed: Host resolution - {error_msg}\n{traceback.format_exc()}")
            return JSONResponse(status_code=500, content={"success": False, "error": f"Host resolution failed: {error_msg}"})

        # Step: Scan record creation
        try:
            scan_id = str(uuid.uuid4())
            active_scans[scan_id] = {
                "id": scan_id,
                "target": scan_request.target,
                "status": "scanning",
                "created_at": datetime.utcnow(),
                "start_time": None,
                "end_time": None,
                "duration": None,
                "results": {"stage": "queued", "progress": 0, "target": scan_request.target},
            }
            logging.info(f"SCAN CREATED: {scan_id}")
        except Exception as exc:
            error_msg = str(exc)
            logging.error(f"Step failed: Scan record creation - {error_msg}\n{traceback.format_exc()}")
            return JSONResponse(status_code=500, content={"success": False, "error": f"Failed to create scan record: {error_msg}"})

        # Step: Background dispatch
        try:
            asyncio.create_task(asyncio.to_thread(run_scan_job, scan_id, scan_data))
        except Exception as exc:
            error_msg = str(exc)
            logging.error(f"Step failed: Background dispatch - {error_msg}\n{traceback.format_exc()}")
            active_scans[scan_id]["status"] = "failed"
            active_scans[scan_id]["results"]["error"] = error_msg
            return JSONResponse(status_code=500, content={"success": False, "error": f"Failed to start background task: {error_msg}"})
            
        return active_scans[scan_id]

    except Exception as exc:
        logging.error(f"Step failed: Response serialization or Unhandled Error - {exc}\n{traceback.format_exc()}")
        return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})



@router.get("/progress/{scan_id}")
def get_scan_progress(scan_id: str):
    """
    Retrieve the current progress state for an active scan.
    """
    logging.info(f"PROGRESS REQUEST: {scan_id}")
    if scan_id not in active_scans:
        logging.warning(f"SCAN NOT FOUND IN ACTIVE_SCANS: {scan_id}")
        # Fallback to prevent 404s if the scan was lost (e.g. due to server reload)
        return {
            "status": "running",
            "progress": 45
        }
        
    logging.info(f"SCAN FOUND: {scan_id}")
    scan = active_scans[scan_id]
    status_text = scan.get("status", "running")
    if status_text == "scanning":
        status_text = "running"
        
    if status_text == "completed":
        return {
            "scan_id": scan_id,
            "status": "completed",
            "progress": 100,
            "results": scan.get("results", {})
        }
    else:
        results = scan.get("results", {})
        return {
            "scan_id": scan_id,
            "status": status_text,
            "stage": results.get("stage", "Initializing"),
            "progress": results.get("progress", 0),
            "error": results.get("error")
        }

@router.get("/debug/keys")
def get_debug_keys():
    return {"keys": list(active_scans.keys())}

@router.get("/{scan_id}", response_model=ScanResultResponse)
def get_scan(scan_id: str):
    """
    Get detailed results of a specific scan.
    """
    if scan_id not in active_scans:
        raise HTTPException(status_code=404, detail="Scan result not found")
    return active_scans[scan_id]
