from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import database
import models
from scanner import router as scanner_router
from intel import router as intel_router
from reports import router as reports_router

# Load environment variables
load_dotenv()

# Initialize database schemas
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="NetReconX API",
    description="Cybersecurity Web Application Backend Services API",
    version="1.0.0",
    redirect_slashes=False,
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router registry
app.include_router(scanner_router.router, prefix="/api")
app.include_router(intel_router.router, prefix="/api")
app.include_router(reports_router.router, prefix="/api")

@app.get("/")
def read_root():
    return {"app": "NetReconX Security Dashboard API", "status": "operational"}
