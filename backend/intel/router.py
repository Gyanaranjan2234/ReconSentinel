from fastapi import APIRouter, HTTPException
import uuid
from datetime import datetime
from schemas import ThreatIntelResponse
from intel.service import lookup_intel_summary

router = APIRouter(prefix="/intel", tags=["Threat Intelligence"])

@router.get("/lookup", response_model=ThreatIntelResponse)
async def lookup_intel(query: str, type: str = "CVE"):
    """
    Look up threat intelligence (e.g., CVEs, threat feeds) using secure stub outputs.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query parameter is required")

    try:
        summary, raw_response = await lookup_intel_summary(query, type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "id": str(uuid.uuid4()),
        "query": query,
        "intelligence_type": type,
        "summary": summary,
        "raw_response": raw_response,
        "created_at": datetime.utcnow()
    }
