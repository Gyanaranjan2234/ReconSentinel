# NetReconX

NetReconX is a dual-use, educational cybersecurity web application dashboard facilitating secure network scanning demonstration simulations and mock threat intelligence lookups.

## Features
- **Reconnaissance Hub:** Safe simulation of vulnerability scans and open port mapping.
- **Threat Intelligence Lookup:** Aggregated lookups of vulnerabilities, domains, and security parameters.
- **Reporting Engine:** Generate professional-grade security review artifacts in PDF layout.
- **Modern UI:** Vibrant, high-end dark dashboard built with React + Vite + TypeScript + Tailwind CSS.

---

## Directory Structure
```
NetReconX/
├── backend/
│   ├── scanner/
│   │   └── router.py
│   ├── intel/
│   │   └── router.py
│   ├── reports/
│   │   └── router.py
│   ├── database.py
│   ├── models.py
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   ├── components/
│   │   │   └── Navbar.tsx
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── useScan.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── index.html
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- *Alternatively*: Python 3.11+ and Node.js 18+ for manual setup.

### Option 1: Running with Docker (Recommended)
1. Set your threat intelligence parameters inside backend configuration:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Build and spin up the multi-container stack:
   ```bash
   docker-compose up --build
   ```
3. Open the services:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

### Option 2: Running Locally (Manual Development)

#### Backend Configuration
1. Change directory and create a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development proxy server:
   ```bash
   npm run dev
   ```
4. Access the web app at [http://localhost:3000](http://localhost:3000).
