import asyncio
import sys
import logging
from datetime import datetime
import socket
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
import models
from scanner.service import authorize_target, normalize_port_range, run_nmap_scan, ping_target
from schemas import ScanCreate, ScanResultResponse

router = APIRouter(prefix="/scan", tags=["Scanner"])


def clear_all_scans(db: Session = Depends(get_db)):
    """
    Clear all scan results history.
    """
    try:
        deleted = db.query(models.ScanResult).delete()
        db.commit()
        logging.info(f"Cleared {deleted} scan record(s) from history.")
        return {"message": f"All scan history cleared successfully ({deleted} records deleted)"}
    except Exception as exc:
        db.rollback()
        logging.error(f"Failed to clear scan history: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database error: {str(exc)}")

# Register DELETE on both /scan/ and /scan (no trailing slash)
router.add_api_route("/", clear_all_scans, methods=["DELETE"], status_code=status.HTTP_200_OK)
router.add_api_route("", clear_all_scans, methods=["DELETE"], status_code=status.HTTP_200_OK)


def update_scan_record(
    scan_id: int, 
    status_text: str, 
    results: dict, 
    start_time: datetime = None, 
    end_time: datetime = None, 
    duration: float = None
) -> None:
    db = SessionLocal()
    try:
        scan = db.query(models.ScanResult).filter(models.ScanResult.id == scan_id).first()
        if scan:
            progress_val = results.get("progress", "?") if isinstance(results, dict) else "?"
            stage_val = results.get("stage", "?") if isinstance(results, dict) else "?"
            msg = f"[SCAN {scan_id}] Updating: status={status_text}, progress={progress_val}%, stage={stage_val}\n"
            sys.stdout.write(msg)
            sys.stdout.flush()
            scan.status = status_text
            scan.results = dict(results)
            if start_time:
                scan.start_time = start_time
            if end_time:
                scan.end_time = end_time
            if duration is not None:
                scan.duration = duration
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(scan, "results")
            db.commit()
            # ensure the session reflects the committed state
            db.refresh(scan)
    finally:
        db.close()


def run_scan_job(scan_id: int, scan_data: dict) -> None:
    start_time = datetime.utcnow()
    try:
        progress = {
            "stage": "initializing",
            "progress": 0,
            "target": scan_data["target"],
        }
        update_scan_record(scan_id, "scanning", progress, start_time=start_time)

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
        progress.update({"stage": "host_discovery", "progress": 10, "ping": ping_summary})
        update_scan_record(scan_id, "scanning", progress)
        progress.update({"stage": "port_scanning", "progress": 25})
        update_scan_record(scan_id, "scanning", progress)

        port_range = normalize_port_range(scan_data.get("port_range", "1-1024"))
        scan_result = run_nmap_scan(
            scan_data["target"],
            port_range,
            scan_data.get("threads", 8),
            scan_data.get("ping_discovery", True),
            scan_data.get("aggressive_mode", False),
        )
        progress.update({"stage": "service_detection", "progress": 50})
        update_scan_record(scan_id, "scanning", progress)
        progress.update({"stage": "banner_grabbing", "progress": 70})
        update_scan_record(scan_id, "scanning", progress)
        progress.update({"stage": "version_detection", "progress": 85})
        update_scan_record(scan_id, "scanning", progress)
        progress.update({"stage": "finalizing", "progress": 95})
        update_scan_record(scan_id, "scanning", progress)

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

        update_scan_record(scan_id, "completed", scan_result, end_time=end_time, duration=duration_val)
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
async def trigger_scan(scan_request: ScanCreate, db: Session = Depends(get_db)):
    """
    Trigger a network/host scanner task for authorized targets.
    """
    try:
        authorize_target(scan_request.target)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        db_scan = models.ScanResult(
            target=scan_request.target,
            status="scanning",
            results={"stage": "queued", "progress": 0, "target": scan_request.target},
        )
        db.add(db_scan)
        db.commit()
        db.refresh(db_scan)
    except Exception as exc:
        logging.error(f"Database error while creating scan: {exc}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while creating scan")

    try:
        # Use model_dump for Pydantic V2 compatibility, fallback to dict for V1
        scan_data = scan_request.model_dump() if hasattr(scan_request, "model_dump") else scan_request.dict()
        asyncio.create_task(asyncio.to_thread(run_scan_job, db_scan.id, scan_data))
    except Exception as exc:
        logging.error(f"Error starting background scan task: {exc}", exc_info=True)
        
    return db_scan


@router.get("/", response_model=list[ScanResultResponse])
def list_scans(db: Session = Depends(get_db)):
    """
    List all scan histories.
    """
    try:
        return db.query(models.ScanResult).order_by(models.ScanResult.id.desc()).all()
    except Exception as exc:
        logging.error(f"Error fetching scans: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error while fetching scans")


@router.get("/{scan_id}", response_model=ScanResultResponse)
def get_scan(scan_id: int, db: Session = Depends(get_db)):
    """
    Get detailed results of a specific scan.
    """
    try:
        scan = db.query(models.ScanResult).filter(models.ScanResult.id == scan_id).first()
        if not scan:
            raise HTTPException(status_code=404, detail="Scan result not found")
        return scan
    except HTTPException:
        raise
    except Exception as exc:
        logging.error(f"Error fetching scan {scan_id}: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error while fetching scan {scan_id}")


@router.get("/progress/{scan_id}")
def get_scan_progress(scan_id: int, db: Session = Depends(get_db)):
    """
    Retrieve the current progress state for an active scan.
    """
    try:
        scan = db.query(models.ScanResult).filter(models.ScanResult.id == scan_id).first()
        if not scan:
            raise HTTPException(status_code=404, detail="Scan result not found")
        return {
            "id": scan.id,
            "target": scan.target,
            "status": scan.status,
            "results": scan.results,
            "created_at": scan.created_at,
        }
    except HTTPException:
        raise
    except Exception as exc:
        logging.error(f"Error fetching scan progress {scan_id}: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error while fetching scan progress {scan_id}")
