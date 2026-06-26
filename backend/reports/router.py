import os
import tempfile
import uuid
from fastapi import APIRouter
from fastapi.responses import FileResponse
from reports.service import build_pdf_report
from schemas import ScanResultResponse

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate")
def generate_pdf_report(scan: ScanResultResponse):
    """
    Generates a secure PDF download of a specific scan's report using ReportLab.
    """
    temp_dir = tempfile.gettempdir()
    # Use a UUID to avoid conflicts
    report_id = str(uuid.uuid4())
    pdf_path = os.path.join(temp_dir, f"ReconSentinel_Report_{report_id}.pdf")

    build_pdf_report(scan, pdf_path)

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"ReconSentinel_Report.pdf"
    )
