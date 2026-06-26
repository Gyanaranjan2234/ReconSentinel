# ReconSentinel

ReconSentinel is an Intelligent Network Reconnaissance & Threat Intelligence Platform for authorized security assessment, network scanning demonstrations, and threat intelligence lookups.

## Features
- **Recon Console:** Real network scanning powered by Nmap — TCP/UDP port discovery, version detection, and OS fingerprinting.
- **Threat Intelligence Lookup:** Live lookups against NVD (CVE data) and VirusTotal (IP & domain reputation).
- **Report Engine:** Generate professional PDF security assessment reports with CVE-to-MITRE ATT&CK mapping.
- **Network Map:** Interactive host topology visualization of active scan targets.
- **AI Security Assistant:** Integrated AI chat assistant for security guidance.
- **Modern UI:** Vibrant, high-end dark cybersecurity dashboard — React 18 + Vite + TypeScript + Tailwind CSS.

---

## Directory Structure
```
ReconSentinel/
├── backend/
│   ├── scanner/
│   │   ├── router.py          # Scan API endpoints
│   │   └── service.py         # Nmap scanning logic
│   ├── intel/
│   │   ├── router.py          # Threat Intel API endpoints
│   │   └── service.py         # NVD + VirusTotal lookups
│   ├── reports/
│   │   ├── router.py          # Report generation endpoints
│   │   └── service.py         # PDF report builder (ReportLab)
│   ├── tests/
│   │   └── test_scan.py       # Integration tests for the scan API
│   ├── main.py                # FastAPI app entry point
│   ├── schemas.py             # Pydantic request/response models
│   ├── requirements.txt
│   ├── .env.example           # Environment variable template
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── ReconConsole.tsx
│   │   │   ├── ThreatIntelligence.tsx
│   │   │   ├── NetworkMap.tsx
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── Documentation.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── PrivacyPolicy.tsx
│   │   │   └── TermsOfUse.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── api/
│   │   │   └── client.ts      # Axios base client
│   │   ├── hooks/
│   │   │   └── useScan.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example           # Frontend environment variable template
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── index.html
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- *Alternatively*: Python 3.11+ and Node.js 18+ for local development.

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
   # Edit .env and add your NVD_API_KEY, VIRUSTOTAL_API_KEY, ANTHROPIC_API_KEY
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
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Keys Required
| Service | Purpose | Get Key |
|---------|---------|---------|
| [NVD API](https://nvd.nist.gov/developers/request-an-api-key) | CVE threat intelligence lookups | Free |
| [VirusTotal API](https://www.virustotal.com/gui/my-apikey) | IP & domain reputation checks | Free (public tier) |
| [Anthropic API](https://console.anthropic.com/) | AI Security Assistant (Claude) | Paid |

---

## Running Tests
Integration tests require the backend server to be running:
```bash
cd backend
python -m pytest tests/test_scan.py -v
```

---

## Security Notice
> ReconSentinel is intended strictly for **authorized** security assessment and educational use.
> Scanning systems without explicit permission is illegal. Always ensure you have written authorization before scanning any target.
