from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from schemas import ThreatIntelResponse
from intel.service import lookup_intel_summary

router = APIRouter(prefix="/intel", tags=["Threat Intelligence"])

@router.get("/lookup", response_model=ThreatIntelResponse)
async def lookup_intel(query: str, type: str = "CVE", db: Session = Depends(get_db)):
    """
    Look up threat intelligence (e.g., CVEs, threat feeds) using secure stub outputs.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter is required")

    summary, raw_response = await lookup_intel_summary(query, type)

    intel_record = models.ThreatIntel(
        query=query,
        intelligence_type=type,
        summary=summary,
        raw_response=raw_response,
    )
    db.add(intel_record)
    db.commit()
    db.refresh(intel_record)

    return intel_record

@router.get("/history", response_model=list[ThreatIntelResponse])
def get_intel_history(db: Session = Depends(get_db)):
    """
    Retrieves the logs of past threat intelligence lookups.
    """
    return db.query(models.ThreatIntel).order_by(models.ThreatIntel.id.desc()).all()
