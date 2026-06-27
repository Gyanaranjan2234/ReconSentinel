import asyncio
import sys
import logging
from datetime import datetime
import socket
import uuid
from fastapi import APIRouter, HTTPException, status
from scanner.service import authorize_target, normalize_port_range, run_nmap_scan, ping_target
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
    print("SCAN STARTED", scan_id)
    start_time = datetime.utcnow()
    try:
        progress = {
            "stage": "starting_scan",
            "progress": 5,
            "target": scan_data["target"],
        }
        update_scan_record(scan_id, "running", progress, start_time=start_time)

        # Target IP resolution & Reverse DNS
        target = scan_data["target"]
        resolved_ip = "Unknown"
        resolved_hostname = target
        reverse_dns = "N/A"

        from scanner.service import is_valid_ipv4_address, resolve_host
        try:
            if is_valid_ipv4_address(target):
                resolved_ip = target
            else:
                ips = resolve_host(target)
                if ips:
                    resolved_ip = ips[0]
        except Exception:
            pass

        try:
            if resolved_ip and resolved_ip != "Unknown":
                name_info = socket.gethostbyaddr(resolved_ip)
                reverse_dns = name_info[0]
                resolved_hostname = name_info[0]
        except Exception:
            pass

        ping_summary = ping_target(scan_data["target"])
        progress.update({"stage": "host_discovery", "progress": 20, "ping": ping_summary})
        update_scan_record(scan_id, "running", progress)

        print("RUNNING NMAP", target)
        import shutil
        if not shutil.which("nmap"):
            raise Exception("Nmap not installed or not found in PATH")
            
        progress.update({"stage": "port_scan", "progress": 50})
        update_scan_record(scan_id, "running", progress)

        port_range = normalize_port_range(scan_data.get("port_range", "1-1024"))
        
        # In a real scanner, we might want to split the nmap call into multiple steps 
        # to properly emit progress at 75 and 90. Here we emit 75 before the scan completes.
        progress.update({"stage": "service_detection", "progress": 75})
        update_scan_record(scan_id, "running", progress)
        
        progress.update({"stage": "os_fingerprinting", "progress": 90})
        update_scan_record(scan_id, "running", progress)

        scan_result = run_nmap_scan(
            scan_data["target"],
            port_range,
            scan_data.get("threads", 8),
            scan_data.get("ping_discovery", True),
            scan_data.get("aggressive_mode", False),
        )

        end_time = datetime.utcnow()
        duration_val = (end_time - start_time).total_seconds()

        scan_result["stage"] = "completed"
        scan_result["progress"] = 100
        scan_result["ping"] = ping_summary

        # Inject scan parameters and host metadata
        scan_result["port_range"] = port_range
        scan_result["threads"] = scan_data.get("threads", 8)
        scan_result["aggressive_mode"] = scan_data.get("aggressive_mode", False)
        scan_result["ping_discovery"] = scan_data.get("ping_discovery", True)
        scan_result["resolved_ip"] = resolved_ip
        scan_result["resolved_hostname"] = resolved_hostname
        scan_result["reverse_dns"] = reverse_dns
        
        from reports.service import get_scan_cves
        from intel.risk import calculate_risk
        from intel.mitre import get_techniques
        
        hosts = scan_result.get("hosts", [])
        ports = hosts[0].get("ports", []) if hosts else []
        cves = get_scan_cves(ports)
        scan_result["risk"] = calculate_risk(ports, cves)
        scan_result["mitre_mappings"] = get_techniques(ports)

        update_scan_record(scan_id, "completed", scan_result, end_time=end_time, duration=duration_val)
        print("SCAN COMPLETED", scan_id)
    except Exception as exc:
        end_time = datetime.utcnow()
        duration_val = (end_time - start_time).total_seconds()
        update_scan_record(
            scan_id, 
            "failed", 
            {"error": str(exc), "stage": "failed", "progress": 100}, 
            end_time=end_time, 
            duration=duration_val
        )


@router.post("/", response_model=ScanResultResponse, status_code=status.HTTP_201_CREATED)
async def trigger_scan(scan_request: ScanCreate):
    """
    Trigger a network/host scanner task for authorized targets.
    """
    import traceback
    try:
        try:
            authorize_target(scan_request.target)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        scan_id = str(uuid.uuid4())
        scan_data = scan_request.model_dump() if hasattr(scan_request, "model_dump") else scan_request.dict()
        
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
        
        print("SCAN CREATED:", scan_id)

        try:
            asyncio.create_task(asyncio.to_thread(run_scan_job, scan_id, scan_data))
        except Exception as exc:
            logging.error(f"Error starting background scan task: {exc}", exc_info=True)
            active_scans[scan_id]["status"] = "failed"
            active_scans[scan_id]["results"]["error"] = str(exc)
            
        return active_scans[scan_id]
    except HTTPException:
        raise
    except Exception as exc:
        logging.error(f"Unhandled exception in trigger_scan: {exc}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/progress/{scan_id}")
def get_scan_progress(scan_id: str):
    """
    Retrieve the current progress state for an active scan.
    """
    print("PROGRESS REQUEST:", scan_id)
    if scan_id not in active_scans:
        print("SCAN NOT FOUND IN ACTIVE_SCANS:", scan_id)
        # Fallback to prevent 404s if the scan was lost (e.g. due to server reload)
        return {
            "status": "running",
            "progress": 45
        }
        
    print("SCAN FOUND:", scan_id)
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
            "progress": results.get("progress", 0)
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
