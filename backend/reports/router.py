import os
import tempfile
import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from reports.service import build_pdf_report
from schemas import ScanResultResponse
from scanner.router import active_scans

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/generate/{scan_id}")
def generate_pdf_report(scan_id: str):
    """
    Generates a secure PDF download of a specific scan's report using ReportLab.
    """
    if scan_id not in active_scans:
        return HTMLResponse(
            content="""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Report Error</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d1117; color: #f1f5f9; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .card { background-color: #161b27; border: 1px solid #21293a; padding: 2rem; border-radius: 0.5rem; text-align: center; max-width: 500px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
                    h2 { color: #ef4444; margin-top: 0; }
                    a { display: inline-block; margin-top: 1.5rem; padding: 0.5rem 1rem; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 0.375rem; font-weight: bold; }
                    a:hover { background-color: #2563eb; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Report Not Found</h2>
                    <p>The scan result was not found or has expired. Please run a new scan from the Recon Console to generate a report.</p>
                    <a href="javascript:window.close()">Close Window</a>
                </div>
            </body>
            </html>
            """,
            status_code=404
        )

    scan_data = active_scans[scan_id]
    scan_response = ScanResultResponse(**scan_data)

    temp_dir = tempfile.gettempdir()
    # Use a UUID to avoid conflicts
    report_id = str(uuid.uuid4())
    pdf_path = os.path.join(temp_dir, f"ReconSentinel_Report_{report_id}.pdf")

    build_pdf_report(scan_response, pdf_path)

    # Use the current date in the filename
    from datetime import datetime
    date_str = datetime.now().strftime("%Y-%m-%d")
    download_filename = f"ReconSentinel_Report_{date_str}.pdf"

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=download_filename,
        headers={"Content-Disposition": f'attachment; filename="{download_filename}"'}
    )
