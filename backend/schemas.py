from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, validator


class ScanCreate(BaseModel):
    target: str = Field(..., min_length=1)
    port_range: str = Field(default="1-1024")
    threads: int = Field(default=8, ge=1, le=64)
    aggressive_mode: bool = Field(default=False)
    ping_discovery: bool = Field(default=True)

    @validator("port_range")
    def validate_port_range(cls, value: str) -> str:
        value = value.strip()
        if value.lower() in {"common", "1-1024", "1-65535"}:
            return value
        raise ValueError("Invalid port range; choose common, 1-1024, or 1-65535")


class ScanResultResponse(BaseModel):
    id: int
    target: str
    status: str
    created_at: datetime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    results: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True
        orm_mode = True


class ThreatIntelResponse(BaseModel):
    id: int
    query: str
    intelligence_type: str
    summary: str
    raw_response: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True
