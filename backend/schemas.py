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
    id: str
    target: str
    status: str
    created_at: datetime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    results: Optional[Dict[str, Any]]


class ThreatIntelResponse(BaseModel):
    id: str
    query: str
    intelligence_type: str
    summary: str
    raw_response: Dict[str, Any]
    created_at: datetime


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    reply: str
    error: Optional[str] = None
