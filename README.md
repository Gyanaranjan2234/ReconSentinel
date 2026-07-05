# ReconSentinel

ReconSentinel is an Intelligent Network Reconnaissance & Threat Intelligence Platform designed for authorized security assessments, network scanning demonstrations, and threat intelligence lookups.

## Features

- **Recon Console:** Live network scanning powered by Nmap. Includes Host Discovery (ICMP), Port Scanning, Service Version Detection, Banner Grabbing, and advanced OS Fingerprinting.
- **Vulnerability Intelligence:** Automated real-time CVE correlations against discovered service versions using the National Vulnerability Database (NVD).
- **MITRE ATT&CK Mapping:** Maps discovered vulnerable services and open ports to specific MITRE ATT&CK techniques and tactics for actionable remediation.
- **Threat Intelligence Lookup:** IP and domain reputation analysis powered by VirusTotal.
- **Network Map:** Interactive topology visualization of active scan targets.
- **AI Security Assistant:** Integrated AI chat assistant providing immediate security guidance and mitigation strategies.
- **Report Engine:** Generates comprehensive PDF security assessment reports summarizing findings and threat intelligence.

---

## Tech Stack

**Frontend (Web Dashboard)**
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion & Recharts

**Backend (API & Scanning Engine)**
- Python 3.11+
- FastAPI
- Python-Nmap & ICMPLib
- SQLAlchemy & SQLite
- ReportLab (PDF Generation)

---

## Screenshots
> *(Screenshots coming soon)*

---

## Directory Structure
```text
ReconSentinel/
├── backend/
│   ├── ai_assistant/        # AI integrations
│   ├── api/                 # Core API endpoints & scan routing
│   ├── intelligence/        # Threat intel (NVD, VirusTotal, OS fingerprinting)
│   ├── reports/             # PDF report generator engine
│   ├── scanners/            # Nmap orchestration & execution
│   ├── database.py          # SQLAlchemy SQLite connection
│   ├── main.py              # FastAPI application entry point
│   ├── schemas.py           # Pydantic validation models
│   ├── requirements.txt     
│   └── .env
├── frontend/
│   ├── src/                 # React components, layouts, hooks, and API clients
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Docker & Docker Compose (Recommended)
- *Alternatively*: Python 3.11+ and Node.js 18+ for local development.
- **Nmap**: Must be installed on the host system if running locally outside of Docker.

### Option 1: Running with Docker (Recommended)
1. Configure backend environment variables:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and add your API keys
   ```
2. Build and spin up the full stack:
   ```bash
   docker-compose up --build
   ```
3. Open in your browser:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Running Locally (Manual Development)

#### Backend Setup
1. Create and activate a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate        # macOS/Linux
   venv\Scripts\activate           # Windows
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env and add your NVD_API_KEY, VIRUSTOTAL_API_KEY, GEMINI_API_KEY, etc.
   ```
4. Start the development server:
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Keys Required
| Service | Purpose | Get Key |
|---------|---------|---------|
| [NVD API](https://nvd.nist.gov/developers/request-an-api-key) | CVE threat intelligence lookups | Free |
| [VirusTotal API](https://www.virustotal.com/gui/my-apikey) | IP & domain reputation checks | Free (public tier) |
| [Google Gemini API](https://aistudio.google.com/) | AI Security Assistant | Free/Paid |
| [Anthropic API](https://console.anthropic.com/) | AI Security Assistant (Alternate) | Paid |


---

## Legal / Disclaimer
> **For authorized security testing only.**
> ReconSentinel is intended strictly for authorized security assessment and educational use.
> Scanning systems without explicit permission is illegal. Always ensure you have written authorization before scanning any target.
