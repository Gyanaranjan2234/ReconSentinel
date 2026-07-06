import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/reconsentinel-logo.png';
import { 
  Shield, 
  Terminal, 
  Activity, 
  Target, 
  FileText, 
  Server, 
  Bot, 
  CheckCircle2, 
  AlertTriangle,
  Database,
  Globe,
  Network,
  Cpu,
  Lock,
  ChevronDown,
  ArrowDown,
  Github,
  Mail,
  MessageSquare,
  Linkedin,
  Heart,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Documentation() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openTroubleshoot, setOpenTroubleshoot] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Core Features' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'tech-stack', label: 'Technology Stack' },
    { id: 'scan-workflow', label: 'Scanning Workflow' },
    { id: 'intel-workflow', label: 'Intel Workflow' },
    { id: 'reports', label: 'Report Explanation' },
    { id: 'api', label: 'API Reference' },
    { id: 'security', label: 'Security & Ethics' },
    { id: 'troubleshooting', label: 'Troubleshooting' },
    { id: 'versions', label: 'Version History' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] text-[#f1f5f9] font-sans selection:bg-[#3b82f6]/30 flex flex-col">
      
      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#05080f]/90 backdrop-blur-md border-b border-[#21293a] h-16 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-[#94a3b8] hover:text-white">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="ReconSentinel Logo" className="w-[36px] h-[36px] object-contain" />
            <span className="font-extrabold tracking-widest text-[#f1f5f9]">
              <span className="text-[#3b82f6]">RECON</span><span className="text-[#22c55e]">SENTINEL</span>
              <span className="ml-2 text-xs text-[#94a3b8] font-mono border-l border-[#334155] pl-2 hidden sm:inline">DOCS</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-base font-semibold leading-tight tracking-normal text-[#94a3b8] hover:text-white hidden sm:flex items-center justify-center transition-colors">
            Back to Home
          </button>
          <button onClick={() => navigate('/recon-console')} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white h-[48px] px-6 rounded text-base font-semibold leading-tight tracking-normal transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2">
            Launch Console
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 pt-16">
        
        {/* Sidebar */}
        <aside className={`fixed md:sticky top-16 left-0 h-[calc(100vh-64px)] w-64 bg-[#0a0f1a] border-r border-[#21293a] overflow-y-auto transform transition-transform duration-300 z-40 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6 space-y-1">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full text-left px-4 py-2.5 rounded text-sm font-medium transition-colors ${activeSection === s.id ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30' : 'text-[#94a3b8] hover:bg-[#161b27] hover:text-white border border-transparent'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-12 py-12 space-y-32">
          
          {/* 1. Hero */}
          <section id="hero" className="space-y-6 pt-12">
            <div className="inline-block p-2 rounded bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] mb-2 text-xs font-mono font-bold">
              v1.4 Documentation
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              ReconSentinel <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#22c55e]">Documentation</span>
            </h1>
            <p className="text-lg md:text-xl text-[#94a3b8] max-w-2xl leading-relaxed">
              Everything you need to understand, configure, and use ReconSentinel.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button onClick={() => navigate('/recon-console')} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white h-[52px] px-8 rounded text-base font-semibold leading-tight tracking-normal transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2">
                Launch Console <Terminal size={20} />
              </button>
              <a href="https://github.com/gyanaranjan2234/ReconSentinel" target="_blank" rel="noopener noreferrer" className="bg-[#161b27] hover:bg-[#1e293b] border border-[#334155] text-white h-[52px] px-8 rounded text-base font-semibold leading-tight tracking-normal transition-all flex items-center justify-center gap-2">
                GitHub Repository <Github size={20} />
              </a>
            </div>
          </section>

          <hr className="border-[#21293a]" />

          {/* 2. Overview */}
          <section id="overview" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Shield className="text-[#3b82f6]" /> Overview
            </h2>
            <p className="text-[#cbd5e1] leading-relaxed">
              ReconSentinel is an intelligent network reconnaissance and threat intelligence platform. It bridges the gap between raw structural network data (open ports, operating systems via standard Nmap probing) and actionable threat mitigation by correlating findings with global vulnerability databases in real time.
            </p>
            <p className="text-[#cbd5e1] leading-relaxed">
              The platform is built specifically for:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Security Analysts', 'SOC Teams', 'Penetration Testers', 'Students', 'Researchers'].map((t, i) => (
                <div key={i} className="bg-[#161b27] border border-[#21293a] px-4 py-3 rounded text-sm text-[#94a3b8] font-bold flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#22c55e]" /> {t}
                </div>
              ))}
            </div>
          </section>

          {/* 3. Core Features */}
          <section id="features" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Activity className="text-[#22c55e]" /> Core Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Intelligent Port Scanning', desc: 'Fast, multi-threaded SYN scanning.', icon: Activity },
                { title: 'Service Detection', desc: 'Identify software and operating systems.', icon: Server },
                { title: 'Banner Grabbing', desc: 'Extract precise application metadata.', icon: Terminal },
                { title: 'Vulnerability Intelligence', desc: 'Real-time CVE correlation via NVD.', icon: Shield },
                { title: 'Threat Intelligence', desc: 'IP, Domain, and URL reputation checks.', icon: Globe },
                { title: 'Risk Scoring', desc: 'CVSS-based dynamic prioritization.', icon: AlertTriangle },
                { title: 'PDF Report Generation', desc: 'Executive-ready compliance reports.', icon: FileText },
                { title: 'Stateless Architecture', desc: 'In-memory execution with no persistent data storage.', icon: Database },
                { title: 'AI Security Assistant', desc: 'Contextual AI mitigation strategies.', icon: Bot }
              ].map((f, i) => (
                <div key={i} className="bg-[#161b27] border border-[#21293a] p-5 rounded-lg hover:border-[#3b82f6]/50 transition-colors">
                  <f.icon className="text-[#3b82f6] mb-3" size={20} />
                  <h4 className="text-white font-bold text-sm mb-2">{f.title}</h4>
                  <p className="text-xs text-[#94a3b8]">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Architecture */}
          <section id="architecture" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Network className="text-[#eab308]" /> Architecture
            </h2>
            <div className="bg-[#0a0f1a] border border-[#21293a] p-8 rounded-xl flex flex-col items-center">
              {[
                { name: 'User', type: 'Client' },
                { name: 'Frontend (React + TypeScript)', type: 'UI Layer' },
                { name: 'FastAPI Backend', type: 'API Layer' },
                { name: 'Nmap Scanner', type: 'Recon Engine' },
                { name: 'Banner Detection', type: 'Fingerprinting' },
                { name: 'NVD & VirusTotal API', type: 'Threat Intel' },
                { name: 'SQLite Database', type: 'Storage' },
                { name: 'PDF Report Engine', type: 'Export' },
                { name: 'Dashboard', type: 'Visualization' }
              ].map((node, i, arr) => (
                <div key={i} className="flex flex-col items-center w-full max-w-xs">
                  <div className="bg-[#161b27] border border-[#3b82f6]/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] w-full text-center py-3 rounded font-bold text-white relative z-10 flex flex-col items-center">
                    <span className="text-sm">{node.name}</span>
                    <span className="text-[10px] text-[#3b82f6] uppercase tracking-widest mt-1">{node.type}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="h-8 w-px bg-gradient-to-b from-[#3b82f6] to-[#21293a] my-1 flex justify-center items-end">
                      <ArrowDown size={14} className="text-[#3b82f6] translate-y-1.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 5. Technology Stack */}
          <section id="tech-stack" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Cpu className="text-[#8b5cf6]" /> Technology Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { category: 'Frontend', items: ['React', 'TypeScript', 'Vite', 'TailwindCSS'] },
                { category: 'Backend', items: ['Python', 'FastAPI', 'SQLAlchemy'] },
                { category: 'Scanning', items: ['Nmap Engine'] },
                { category: 'Threat Intelligence', items: ['NVD API', 'VirusTotal API', 'WHOIS', 'DNS Lookup'] },
                { category: 'Database', items: ['SQLite'] },
                { category: 'Reports', items: ['ReportLab / PDF'] }
              ].map((stack, i) => (
                <div key={i} className="bg-[#161b27] border border-[#21293a] p-5 rounded-lg">
                  <h4 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-4">{stack.category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {stack.items.map((item, j) => (
                      <span key={j} className="bg-[#05080f] border border-[#334155] text-[#cbd5e1] text-xs px-2.5 py-1 rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Scanning Workflow */}
          <section id="scan-workflow" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Target className="text-[#ef4444]" /> Scanning Workflow
            </h2>
            <div className="bg-[#161b27] border border-[#21293a] rounded-xl p-8">
              <div className="relative border-l-2 border-[#334155] ml-4 space-y-8">
                {[
                  { title: 'Enter Target', desc: 'User inputs IP, Subnet, or Domain.' },
                  { title: 'Validate Target', desc: 'Backend resolves and validates input format.' },
                  { title: 'Host Discovery', desc: 'ICMP/ARP sweeps to identify active nodes.' },
                  { title: 'Port Scan', desc: 'SYN scan identifies open TCP/UDP ports.' },
                  { title: 'Service Detection', desc: 'Determines running software and versions.' },
                  { title: 'OS Fingerprinting', desc: 'Optional TCP/IP probing to identify host OS.' },
                  { title: 'Banner Grab', desc: 'Extracts deeper application metadata.' },
                  { title: 'Vulnerability Lookup', desc: 'Matches CPEs against the NVD.' },
                  { title: 'Risk Analysis', desc: 'Calculates CVSS base scores.' },
                  { title: 'Generate Report', desc: 'Compiles data into a PDF statelessly.' }
                ].map((step, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute w-4 h-4 rounded-full bg-[#ef4444] border-4 border-[#161b27] -left-[9px] top-1"></div>
                    <h4 className="text-white font-bold text-sm mb-1">{step.title}</h4>
                    <p className="text-[#94a3b8] text-xs">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 7. Threat Intelligence Workflow */}
          <section id="intel-workflow" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Globe className="text-[#0ea5e9]" /> Threat Intelligence Workflow
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[#161b27] border border-[#21293a] p-6 rounded-xl text-center">
                <h4 className="text-[#0ea5e9] font-bold mb-6">IP Workflow</h4>
                <div className="space-y-2 flex flex-col items-center text-sm font-medium text-[#cbd5e1]">
                  {['IP', 'WHOIS', 'Reverse DNS', 'Geo Information', 'Threat Reputation', 'Summary'].map((s, i, a) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="bg-[#05080f] border border-[#334155] px-4 py-2 rounded w-full">{s}</span>
                      {i < a.length - 1 && <ArrowDown size={14} className="text-[#334155] my-2" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#161b27] border border-[#21293a] p-6 rounded-xl text-center">
                <h4 className="text-[#22c55e] font-bold mb-6">Domain Workflow</h4>
                <div className="space-y-2 flex flex-col items-center text-sm font-medium text-[#cbd5e1]">
                  {['Domain', 'WHOIS', 'DNS Records', 'SSL Information', 'VirusTotal Reputation', 'Risk Score'].map((s, i, a) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="bg-[#05080f] border border-[#334155] px-4 py-2 rounded w-full">{s}</span>
                      {i < a.length - 1 && <ArrowDown size={14} className="text-[#334155] my-2" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#161b27] border border-[#21293a] p-6 rounded-xl text-center">
                <h4 className="text-[#ef4444] font-bold mb-6">CVE Workflow</h4>
                <div className="space-y-2 flex flex-col items-center text-sm font-medium text-[#cbd5e1]">
                  {['CVE ID', 'NVD API', 'CVSS Score', 'Affected Products', 'Mitigation', 'References'].map((s, i, a) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="bg-[#05080f] border border-[#334155] px-4 py-2 rounded w-full">{s}</span>
                      {i < a.length - 1 && <ArrowDown size={14} className="text-[#334155] my-2" />}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* 8. Report Explanation */}
          <section id="reports" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <FileText className="text-[#f59e0b]" /> Report Explanation
            </h2>
            <div className="bg-[#161b27] border border-[#21293a] rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#21293a]">
                {[
                  { title: 'Target', desc: 'The IP, Subnet, or Domain that was scanned.' },
                  { title: 'Ports', desc: 'List of all discovered open TCP/UDP ports.' },
                  { title: 'Services', desc: 'The specific daemon/software running on the port.' },
                  { title: 'Versions', desc: 'The exact software version extracted via banner grabbing.' },
                  { title: 'Risk', desc: 'Overall threat categorization (Low, Medium, High, Critical).' },
                  { title: 'CVEs', desc: 'Confirmed Common Vulnerabilities and Exposures mapped to the version.' },
                  { title: 'Recommendations', desc: 'AI-driven mitigation steps and patching instructions.' },
                  { title: 'MITRE Mapping', desc: 'Tactic and technique classification for adversary modeling.' },
                  { title: 'Risk Score', desc: 'The calculated CVSS base score out of 10.0.' },
                  { title: 'Scan Duration', desc: 'Total execution time in seconds.' }
                ].map((f, i) => (
                  <div key={i} className="p-4 border-b border-[#21293a]">
                    <h5 className="text-white font-bold text-sm mb-1">{f.title}</h5>
                    <p className="text-[#94a3b8] text-xs">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 9. API Reference */}
          <section id="api" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Terminal className="text-[#10b981]" /> API Reference
            </h2>
            <div className="space-y-8">
              {[
                { 
                  method: 'POST', endpoint: '/api/scan', desc: 'Initiate a new reconnaissance scan on a target.', 
                  req: '{\n  "target": "192.168.1.1",\n  "type": "quick"\n}',
                  res: '{\n  "status": "success",\n  "scan_id": "8f3a-91be"\n}'
                },
                { 
                  method: 'GET', endpoint: '/api/history', desc: 'Retrieve all historical scans from the SQLite database.', 
                  req: null,
                  res: '{\n  "scans": [\n    {\n      "id": "8f3a",\n      "target": "10.0.0.1",\n      "date": "2026-10-12"\n    }\n  ]\n}'
                },
                { 
                  method: 'POST', endpoint: '/api/intel', desc: 'Perform a threat intelligence lookup on an IP, Domain, or CVE.', 
                  req: '{\n  "query": "CVE-2021-44228",\n  "type": "cve"\n}',
                  res: '{\n  "cve_id": "CVE-2021-44228",\n  "cvss": 10.0,\n  "severity": "CRITICAL"\n}'
                }
              ].map((api, i) => (
                <div key={i} className="bg-[#161b27] border border-[#21293a] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-4 bg-[#0f172a] p-4 border-b border-[#21293a]">
                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest ${api.method === 'POST' ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30' : 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30'}`}>
                      {api.method}
                    </span>
                    <span className="font-mono text-white text-sm">{api.endpoint}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-[#94a3b8] mb-4">{api.desc}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {api.req && (
                        <div>
                          <div className="text-[10px] text-[#475569] uppercase font-bold mb-2">Request payload</div>
                          <pre className="bg-[#05080f] p-4 rounded border border-[#334155] text-xs font-mono text-[#cbd5e1] overflow-x-auto">
                            {api.req}
                          </pre>
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] text-[#475569] uppercase font-bold mb-2">Example response</div>
                        <pre className="bg-[#05080f] p-4 rounded border border-[#334155] text-xs font-mono text-[#cbd5e1] overflow-x-auto">
                          {api.res}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 10. Security & Ethics */}
          <section id="security" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Lock className="text-[#ef4444]" /> Security & Ethics
            </h2>
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-6 relative overflow-hidden">
              <AlertTriangle className="absolute -bottom-8 -right-8 w-48 h-48 text-[#ef4444]/5" />
              <div className="relative z-10">
                <h3 className="text-[#ef4444] font-black text-lg mb-4">CRITICAL WARNING</h3>
                <p className="text-[#f1f5f9] leading-relaxed mb-4">
                  ReconSentinel is a powerful network reconnaissance and threat intelligence tool. Unauthorized use of this platform against infrastructure you do not explicitly own or have permission to audit is strictly prohibited and likely illegal.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                  <div className="space-y-2">
                    <h4 className="text-white">Authorized Use Cases:</h4>
                    <ul className="space-y-1 text-[#22c55e]">
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Systems you own</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Authorized penetration tests</li>
                      <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Security research</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white">Prohibited Use Cases:</h4>
                    <ul className="space-y-1 text-[#ef4444]">
                      <li className="flex items-center gap-2"><X size={14} /> Public infrastructure</li>
                      <li className="flex items-center gap-2"><X size={14} /> Unauthorized networks</li>
                      <li className="flex items-center gap-2"><X size={14} /> Malicious exploitation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 11. Troubleshooting */}
          <section id="troubleshooting" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <AlertTriangle className="text-[#f97316]" /> Troubleshooting
            </h2>
            <div className="space-y-2">
              {[
                { q: 'Why is the scan taking so long?', a: 'Intensive scans, such as full 65535 port sweeps with OS fingerprinting, can take significant time depending on network latency and target firewalls. Ensure you are scanning locally if possible, or use the "Fast Scan" option for quicker reconnaissance.' },
                { q: 'Why were no open ports found?', a: 'The target might be offline, dropping ICMP packets, or heavily firewalled. Try skipping host discovery (-Pn equivalent) if you know the target is active.' },
                { q: 'Why did the vulnerability lookup fail?', a: 'Ensure your backend has internet access to query the NVD API. Also verify that you have configured your NVD_API_KEY in the .env file.' },
                { q: 'How do I use API keys?', a: 'Rename the provided .env.example to .env and insert your NVD_API_KEY and VIRUSTOTAL_API_KEY. The backend will automatically inject them into outgoing requests.' },
                { q: 'How do I clear scan history?', a: 'You can delete individual scans from the History tab in the dashboard, or purge the local SQLite database file (database.db) in the backend directory to completely wipe all records.' }
              ].map((item, i) => (
                <div key={i} className="border border-[#21293a] rounded-lg bg-[#161b27] overflow-hidden">
                  <button 
                    onClick={() => setOpenTroubleshoot(openTroubleshoot === i ? null : i)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#1e293b] transition-colors"
                  >
                    <span className="font-bold text-sm text-[#f1f5f9]">{item.q}</span>
                    <ChevronDown size={16} className={`text-[#94a3b8] transition-transform ${openTroubleshoot === i ? 'rotate-180 text-[#3b82f6]' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openTroubleshoot === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 pt-2 text-xs text-[#94a3b8] leading-relaxed border-t border-[#21293a]">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* 12. Version History */}
          <section id="versions" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Server className="text-[#a855f7]" /> Version History
            </h2>
            <div className="relative border-l-2 border-[#334155] ml-4 space-y-8">
              {[
                { v: 'v1.4', t: 'AI Assistant', d: 'Integrated conversational AI for mitigation.' },
                { v: 'v1.3', t: 'PDF Reports', d: 'Added executive-ready PDF generation engine.' },
                { v: 'v1.2', t: 'Risk Engine', d: 'Implemented CVSS risk scoring and metrics.' },
                { v: 'v1.1', t: 'Threat Intelligence', d: 'Added external API integrations (NVD/VT).' },
                { v: 'v1.0', t: 'Basic Port Scanner', d: 'Initial release featuring Nmap host discovery.' }
              ].map((ver, i) => (
                <div key={i} className="relative pl-8">
                  <div className={`absolute w-4 h-4 rounded-full border-4 border-[#161b27] -left-[9px] top-1 ${i === 0 ? 'bg-[#3b82f6]' : 'bg-[#475569]'}`}></div>
                  <h4 className={`font-black text-sm mb-1 ${i === 0 ? 'text-[#3b82f6]' : 'text-white'}`}>{ver.v} - {ver.t}</h4>
                  <p className="text-[#94a3b8] text-xs">{ver.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 13. FAQ */}
          <section id="faq" className="space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <MessageSquare className="text-[#3b82f6]" /> FAQ
            </h2>
            <div className="space-y-2">
              {[
                { q: "Is ReconSentinel free?", a: "Yes, the core platform is open-source. However, some Threat Intelligence APIs require your own API keys." },
                { q: "Can it scan cloud environments?", a: "Yes, as long as you have the appropriate network access and cloud provider authorization." },
                { q: "Do I need Nmap installed?", a: "Yes, the backend relies on a local installation of Nmap to perform the raw structural scanning." },
                { q: "How accurate is the CVE mapping?", a: "Accuracy relies on CPE string matching. It is highly accurate for well-known services but may require manual verification for obscure applications." },
                { q: "Is the AI secure?", a: "Yes, the AI assistant analyzes metadata. No sensitive internal data is sent out, only standard vulnerability queries." },
                { q: "Can I export data as JSON or CSV?", a: "Currently, reports are exported as PDF, but scan history can be accessed in raw JSON via the API." },
                { q: "How do I update the platform?", a: "Pull the latest commits from the GitHub repository and rebuild the Docker containers or restart the local servers." },
                { q: "What OS does it support?", a: "The platform runs on any OS supporting Node.js and Python. Windows, macOS, and Linux are fully supported." },
                { q: "Are scans anonymous?", a: "No. Your scans originate from your IP address. Threat Intelligence lookups may also log your IP at the API provider." },
                { q: "Can I add custom Nmap scripts?", a: "Yes, advanced users can modify the backend scanner configuration to include custom NSE scripts." }
              ].map((item, i) => (
                <div key={i} className="border border-[#21293a] rounded-lg bg-[#161b27] overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#1e293b] transition-colors"
                  >
                    <span className="font-bold text-sm text-[#f1f5f9]">{item.q}</span>
                    <ChevronDown size={16} className={`text-[#94a3b8] transition-transform ${openFaq === i ? 'rotate-180 text-[#3b82f6]' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 pt-2 text-xs text-[#94a3b8] leading-relaxed border-t border-[#21293a]">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* 14. Contact */}
          <section id="contact" className="space-y-6 scroll-mt-24 pb-12">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Mail className="text-[#ec4899]" /> Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="https://github.com/gyanaranjan2234/ReconSentinel" target="_blank" rel="noopener noreferrer" className="bg-[#161b27] border border-[#21293a] hover:border-[#22c55e]/50 p-4 rounded text-center flex flex-col items-center group transition-colors">
                <Github size={20} className="text-[#22c55e] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/gyana-ranjan-behera-7047222a1/" target="_blank" rel="noopener noreferrer" className="bg-[#161b27] border border-[#21293a] hover:border-[#0a66c2]/50 p-4 rounded text-center flex flex-col items-center group transition-colors">
                <Linkedin size={20} className="text-[#0a66c2] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">LinkedIn</span>
              </a>
              <a href="mailto:gyana.tcr20@gmail.com" className="bg-[#161b27] border border-[#21293a] hover:border-[#3b82f6]/50 p-4 rounded text-center flex flex-col items-center group transition-colors">
                <Mail size={20} className="text-[#3b82f6] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Email Support</span>
              </a>
              <a href="https://github.com/gyanaranjan2234/ReconSentinel/issues" target="_blank" rel="noopener noreferrer" className="bg-[#161b27] border border-[#21293a] hover:border-[#ef4444]/50 p-4 rounded text-center flex flex-col items-center group transition-colors">
                <AlertTriangle size={20} className="text-[#ef4444] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Report Issue</span>
              </a>
            </div>
          </section>

        </main>
      </div>

      {/* 15. Footer */}
      <footer className="border-t border-[#21293a] bg-[#0a0f1a] py-8 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ReconSentinel Logo" className="w-[16px] h-[16px] object-contain" />
            <span className="font-extrabold text-xs tracking-widest text-[#f1f5f9]">
              <span className="text-[#3b82f6]">RECON</span><span className="text-[#22c55e]">SENTINEL</span>
            </span>
          </div>
          <div className="flex gap-4 text-xs font-bold text-[#94a3b8] uppercase tracking-widest">
            <a href="https://github.com/gyanaranjan2234/ReconSentinel" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/gyana-ranjan-behera-7047222a1/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="/documentation" className="hover:text-white transition-colors">Docs</a>
            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms-of-use" className="hover:text-white transition-colors">Terms</a>
          </div>
          <div className="text-[10px] text-[#475569] font-mono text-center md:text-right">
            &copy; {new Date().getFullYear()} All rights reserved.<br/>
            Version: 1.4.0 | Made with <Heart size={8} className="inline text-[#ef4444]" /> for Security Pros
          </div>
        </div>
      </footer>

    </div>
  );
}
