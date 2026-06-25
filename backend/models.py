from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float
from datetime import datetime
from database import Base

class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    target = Column(String, index=True, nullable=False)
    status = Column(String, default="completed")  # completed, failed, scanning
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Store raw ports, services, OS data, etc. as JSON
    results = Column(JSON, nullable=True)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=True)


class ThreatIntel(Base):
    __tablename__ = "threat_intel"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, index=True, nullable=False)
    intelligence_type = Column(String, index=True, nullable=False) # e.g., "CVE", "Domain", "IP"
    summary = Column(Text, nullable=False)
    raw_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
