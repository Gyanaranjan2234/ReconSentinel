import shutil
import logging
import subprocess
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from api import router as scanner_router
from intelligence import router as intel_router
from reports import router as reports_router
from ai_assistant import router as ai_router

# Configure basic logging for startup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Startup checks
def check_nmap():
    if not shutil.which("nmap"):
        logger.error("CRITICAL: Nmap is not installed or not in PATH!")
    else:
        try:
            result = subprocess.run(["nmap", "-V"], capture_output=True, text=True, check=True)
            version_line = result.stdout.split('\n')[0]
            logger.info(f"Nmap found: {version_line}")
        except Exception as e:
            logger.error(f"Error checking Nmap version: {e}")

from database import engine, Base

app = FastAPI(
    title="ReconSentinel API",
    description="Cybersecurity Web Application Backend Services API",
    version="1.0.0",
    redirect_slashes=False,
)

@app.on_event("startup")
def startup_event():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created.")
    check_nmap()

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router registry
app.include_router(scanner_router.router, prefix="/api")
app.include_router(intel_router.router, prefix="/api")
app.include_router(reports_router.router, prefix="/api")
app.include_router(ai_router.router, prefix="/api")

@app.get("/api/health", status_code=status.HTTP_200_OK)
def health_check():
    """
    Backend health check endpoint.
    """
    return {
        "status": "online",
        "version": "1.0",
        "services": {
            "nmap": "installed"
        }
    }

@app.get("/")
def read_root():
    return {"app": "ReconSentinel Security Dashboard API", "status": "operational"}
