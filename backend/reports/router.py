from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
import models
import os
import tempfile
from reports.service import build_pdf_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/generate/{scan_id}")
def generate_pdf_report(scan_id: int, db: Session = Depends(get_db)):
    """
    Generates a secure PDF download of a specific scan's report using ReportLab.
    """
    scan = db.query(models.ScanResult).filter(models.ScanResult.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan result not found")

    temp_dir = tempfile.gettempdir()
    pdf_path = os.path.join(temp_dir, f"NetReconX_Report_{scan_id}.pdf")

    build_pdf_report(scan, pdf_path)

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"NetReconX_Report_{scan_id}.pdf"
    )
