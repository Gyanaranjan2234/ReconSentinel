import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Terminal, 
  Activity, 
  Search, 
  Server, 
  AlertTriangle,
  Bot,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  Network,
  Target,
  Cpu,
  BarChart3,
  Globe,
  Github,
  Mail,
  Linkedin,
  MessageSquare,
  Heart,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeWord, setActiveWord] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const words = [
    "Host Discovery",
    "Port Scanning",
    "Service Detection",
    "Threat Intelligence",
    "CVE Analysis",
    "AI Security Assistant"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { title: "Host Discovery", icon: Server, desc: "Rapidly identify live nodes using advanced ICMP and ARP techniques." },
    { title: "TCP Port Scanning", icon: Activity, desc: "High-speed multi-threaded SYN scanning to uncover open entry points." },
    { title: "Service & Banner Detection", icon: Terminal, desc: "Fingerprint operating systems and extract precise application banners." },
    { title: "Vulnerability Intelligence", icon: Shield, desc: "Correlate services with the latest NVD data for real-time CVE mapping." },
    { title: "MITRE ATT&CK Mapping", icon: Target, desc: "Map vulnerabilities directly to adversary tactics and techniques." },
    { title: "Risk Scoring", icon: AlertTriangle, desc: "Dynamic CVSS-based evaluation to prioritize your remediation efforts." },
    { title: "Network Visualization", icon: Network, desc: "Interactive topology graphs to map out your infrastructure." },
    { title: "AI Security Assistant", icon: Bot, desc: "Query an intelligent copilot for mitigation strategies and threat insights." },
  ];

  const workflowSteps = [
    { title: "Discover", desc: "Map active hosts and network topology.", icon: Search },
    { title: "Analyze", desc: "Identify services, versions, and configurations.", icon: Activity },
    { title: "Assess", desc: "Cross-reference findings with global threat intel.", icon: Shield },
    { title: "Report", desc: "Generate actionable PDF security audits.", icon: FileText },
  ];

  const faqs = [
    { q: "What is ReconSentinel?", a: "ReconSentinel is a comprehensive, intelligent network reconnaissance and threat intelligence platform designed to automate the discovery of network assets and enrich them with real-time vulnerability data." },
    { q: "Who should use ReconSentinel?", a: "It is built for security professionals, penetration testers, network administrators, and red/blue teams who require rapid, reliable insight into their network's security posture." },
    { q: "How does host discovery work?", a: "We utilize multi-layered ICMP echo requests and ARP resolution techniques to accurately and quickly map active hosts within a given subnet or IP range." },
    { q: "What is banner grabbing?", a: "Banner grabbing is the technique of connecting to open ports and reading the metadata broadcasted by the running service, which helps in identifying exact software versions and operating systems." },
    { q: "What is vulnerability intelligence?", a: "It is the process of correlating the discovered service versions on your network against global vulnerability databases (like NVD) to identify known CVEs instantly." },
    { q: "How accurate is CVE detection?", a: "By using precise version strings and CPE (Common Platform Enumeration) matching, ReconSentinel minimizes false positives and delivers highly accurate vulnerability reports." },
    { q: "Does ReconSentinel perform exploitation?", a: "No. ReconSentinel strictly performs reconnaissance and vulnerability assessment. It does not actively exploit vulnerabilities, ensuring it remains safe for production environments." },
    { q: "Is authorization required before scanning?", a: "Yes. You must have explicit, written authorization to scan any network, IP address, or domain. Unauthorized scanning is illegal and violates our terms of service." },
    { q: "Which operating systems are supported?", a: "The platform is cross-platform via Docker, while the scanning engine natively supports Windows, Linux, and macOS environments." },
    { q: "How does the AI Security Assistant help?", a: "The AI Assistant acts as your co-pilot, explaining complex vulnerabilities, providing customized mitigation scripts, and mapping findings to the MITRE ATT&CK framework." },
    { q: "Can reports be exported?", a: "Yes, all scans can be compiled into professional, executive-ready PDF reports highlighting risk scores, topologies, and remediation steps." },
    { q: "Is ReconSentinel suitable for enterprise environments?", a: "Absolutely. With multi-threaded scanning, role-based reporting, and secure sandbox architectures, it is designed to scale across large enterprise infrastructures." }
  ];

  const Counter = ({ target, label }: { target: number, label: string }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let start = 0;
      const end = target;
      if (start === end) return;
      
      let totalMilSecDur = 2000;
      let incrementTime = (totalMilSecDur / end) * 5;
      
      let timer = setInterval(() => {
        start += Math.ceil(end / 100);
        if (start > end) start = end;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }, [target]);

    return (
      <div className="flex flex-col items-center">
        <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#22c55e] mb-2 font-mono">
          {count.toLocaleString()}+
        </span>
        <span className="text-xs md:text-sm text-[#94a3b8] uppercase tracking-widest font-semibold">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#05080f] text-[#f1f5f9] font-sans selection:bg-[#3b82f6]/30">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#3b82f6] opacity-20 blur-[100px]"></div>
        <div className="absolute left-1/4 bottom-1/4 -z-10 m-auto h-[250px] w-[250px] rounded-full bg-[#22c55e] opacity-10 blur-[120px]"></div>
      </div>

      {/* Sticky Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#05080f]/80 backdrop-blur-md border-b border-[#21293a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#3b82f6]/10 p-1.5 rounded border border-[#3b82f6]/30 text-[#3b82f6]">
              <Shield size={20} />
            </div>
            <span className="font-extrabold text-base md:text-lg tracking-widest text-[#f1f5f9]">
              <span className="text-[#3b82f6]">RECON</span><span className="text-[#22c55e]">SENTINEL</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold tracking-widest uppercase text-[#94a3b8]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#deep-dive" className="hover:text-white transition-colors">Deep Dive</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center gap-2"
          >
            Launch Console <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-[90vh] flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] text-[10px] font-bold uppercase tracking-widest mb-4 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
            <Activity size={12} className="animate-pulse" /> Advanced Security Posture Management
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-white">
            Intelligent Network <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]">Reconnaissance</span> & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] to-[#4ade80]">Threat Intelligence</span>
          </h1>
          <p className="text-base md:text-xl text-[#94a3b8] leading-relaxed max-w-3xl mx-auto">
            Discover, fingerprint, analyze, and secure your network infrastructure using advanced reconnaissance, vulnerability intelligence, and AI-powered security insights.
          </p>
          
          <div className="h-10 text-lg md:text-xl font-mono text-[#475569]">
            <span className="text-white mr-2">$</span> 
            Initiating process: <span className="text-[#3b82f6]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeWord}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  {words[activeWord]}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="animate-ping ml-1 text-[#3b82f6]">_</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white px-8 py-3.5 rounded text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              Launch Console <Terminal size={16} />
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto bg-[#161b27] hover:bg-[#1e293b] border border-[#21293a] text-white px-8 py-3.5 rounded text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              View Features <ChevronRight size={16} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="workflow" className="relative z-10 py-24 bg-[#0a0f1a] border-y border-[#21293a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Reconnaissance Workflow</h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto">A systematic approach to identifying and securing attack surfaces.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {workflowSteps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-[#21293a] z-0" />
                )}
                <div className="bg-[#161b27] border border-[#21293a] p-6 rounded-lg relative z-10 hover:border-[#3b82f6]/50 transition-colors group">
                  <div className="w-12 h-12 rounded bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] mb-4 group-hover:scale-110 transition-transform">
                    <step.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">0{i+1}. {step.title}</h3>
                  <p className="text-sm text-[#94a3b8]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section id="features" className="relative z-10 py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Platform Capabilities</h2>
          <p className="text-[#94a3b8] max-w-2xl mx-auto">Comprehensive toolkit designed for modern defensive security operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-[#161b27]/80 backdrop-blur-sm border border-[#21293a] p-6 rounded-lg hover:bg-[#1e293b] hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all"
            >
              <feature.icon className="text-[#22c55e] mb-4" size={28} />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">{feature.title}</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Stats */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-[#05080f] to-[#0a0f1a] border-t border-[#21293a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Counter target={65535} label="Ports Scannable" />
            <Counter target={215000} label="CVEs Tracked" />
            <Counter target={14} label="Intel Sources" />
            <Counter target={24} label="24/7 AI Assistance" />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="relative z-10 py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Why ReconSentinel?</h2>
            <p className="text-[#94a3b8] mb-8 leading-relaxed">
              Standard port scanners only provide you with raw structural data. ReconSentinel bridges the gap between reconnaissance and remediation by automatically enriching structural findings with real-time threat intelligence and AI-driven mitigation advice.
            </p>
            <ul className="space-y-4">
              {[
                "Real-time CVE mapping directly to open ports",
                "Automated MITRE ATT&CK technique extraction",
                "Conversational AI for instant mitigation scripts",
                "High-quality PDF reporting for stakeholders",
                "Visual network topology generation"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#cbd5e1] font-medium">
                  <CheckCircle2 className="text-[#22c55e] flex-shrink-0 mt-0.5" size={18} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#161b27] border border-[#21293a] rounded-xl overflow-hidden shadow-2xl">
            <div className="flex bg-[#0f172a] border-b border-[#21293a]">
              <div className="flex-1 p-4 text-center font-bold text-xs uppercase tracking-widest text-[#475569]">Legacy Scanners</div>
              <div className="flex-1 p-4 text-center font-bold text-xs uppercase tracking-widest text-[#3b82f6] bg-[#3b82f6]/5 border-l border-[#21293a]">ReconSentinel</div>
            </div>
            {[
              { f: "Port Scanning", a: true, b: true },
              { f: "OS Fingerprinting", a: true, b: true },
              { f: "NVD Database Sync", a: false, b: true },
              { f: "Risk Scoring", a: false, b: true },
              { f: "AI Remediation", a: false, b: true },
              { f: "Executive Reports", a: false, b: true },
            ].map((row, i) => (
              <div key={i} className="flex border-b border-[#21293a] last:border-0 text-sm">
                <div className="flex-1 p-4 text-center flex items-center justify-center border-r border-[#21293a] bg-[#161b27]">
                  {row.a ? <CheckCircle2 className="text-[#475569]" size={16} /> : <X className="text-[#ef4444]/50" size={16} />}
                </div>
                <div className="flex-1 p-4 flex items-center justify-between bg-[#3b82f6]/5 pl-6">
                  <span className="text-[#e2e8f0] font-semibold">{row.f}</span>
                  {row.b && <CheckCircle2 className="text-[#3b82f6]" size={16} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep Dive Features */}
      <section id="deep-dive" className="relative z-10 py-24 bg-[#0a0f1a] border-y border-[#21293a] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-32">
          
          {/* Feature 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="w-12 h-12 rounded bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] mb-6">
                <Network size={24} />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Intelligent Network Reconnaissance</h3>
              <p className="text-[#94a3b8] mb-8 leading-relaxed">
                Experience unparalleled visibility into your infrastructure. Our multi-threaded scanning engine rapidly identifies live hosts and open entry points, while stealthy fingerprinting techniques extract precise service metadata without raising alarms.
              </p>
              <ul className="space-y-3">
                {["Host Discovery via ICMP/ARP", "TCP SYN Port Scanning", "Multi-threaded Execution", "Service & Banner Grabbing", "Advanced OS Fingerprinting", "Fast Network Enumeration"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#cbd5e1] font-medium">
                    <CheckCircle2 className="text-[#3b82f6]" size={16} /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2 relative h-[400px] bg-[#161b27] border border-[#21293a] rounded-2xl p-6 flex items-center justify-center overflow-hidden">
              {/* SVG Animation for Topology */}
              <svg className="w-full h-full" viewBox="0 0 400 400">
                <circle cx="200" cy="200" r="80" fill="none" stroke="#21293a" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="200" cy="200" r="140" fill="none" stroke="#21293a" strokeWidth="1" strokeDasharray="4 4" />
                <motion.line x1="200" y1="200" x2="280" y2="120" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.line x1="200" y1="200" x2="120" y2="120" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} />
                <motion.line x1="200" y1="200" x2="200" y2="340" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1, repeat: Infinity }} />
                
                <motion.circle cx="200" cy="200" r="30" fill="#161b27" stroke="#3b82f6" strokeWidth="4" />
                <motion.circle cx="200" cy="200" r="10" fill="#3b82f6" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                
                <circle cx="280" cy="120" r="20" fill="#161b27" stroke="#22c55e" strokeWidth="3" />
                <circle cx="120" cy="120" r="20" fill="#161b27" stroke="#22c55e" strokeWidth="3" />
                <circle cx="200" cy="340" r="20" fill="#161b27" stroke="#ef4444" strokeWidth="3" />
                <motion.circle cx="200" cy="340" r="25" fill="none" stroke="#ef4444" strokeWidth="1" animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.3, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </svg>
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative h-[400px] bg-[#161b27] border border-[#21293a] rounded-2xl p-6 flex items-center justify-center overflow-hidden">
              {/* SVG Animation for Vulnerability */}
              <svg className="w-full h-full" viewBox="0 0 400 400">
                <rect x="50" y="150" width="100" height="100" rx="10" fill="#161b27" stroke="#3b82f6" strokeWidth="2" />
                <text x="100" y="205" fill="#3b82f6" fontSize="14" textAnchor="middle" fontWeight="bold">Service</text>
                
                <motion.path d="M 150 200 C 200 200, 200 100, 250 100" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" animate={{ strokeDashoffset: [20, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                <motion.path d="M 150 200 C 200 200, 200 200, 250 200" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" animate={{ strokeDashoffset: [20, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                <motion.path d="M 150 200 C 200 200, 200 300, 250 300" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" animate={{ strokeDashoffset: [20, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                
                <rect x="250" y="70" width="100" height="60" rx="5" fill="#ef4444" fillOpacity="0.1" stroke="#ef4444" strokeWidth="1" />
                <text x="300" y="105" fill="#ef4444" fontSize="12" textAnchor="middle" fontWeight="bold">CVE-2023-XXXX</text>
                
                <rect x="250" y="170" width="100" height="60" rx="5" fill="#ef4444" fillOpacity="0.1" stroke="#ef4444" strokeWidth="1" />
                <text x="300" y="205" fill="#ef4444" fontSize="12" textAnchor="middle" fontWeight="bold">CVE-2022-YYYY</text>
                
                <rect x="250" y="270" width="100" height="60" rx="5" fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" strokeWidth="1" />
                <text x="300" y="305" fill="#f59e0b" fontSize="12" textAnchor="middle" fontWeight="bold">CVE-2021-ZZZZ</text>
              </svg>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="w-12 h-12 rounded bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Vulnerability Intelligence</h3>
              <p className="text-[#94a3b8] mb-8 leading-relaxed">
                Instantly map discovered services against the National Vulnerability Database (NVD). Our engine automatically correlates CPE matches to identify known flaws, score them using CVSS, and present prioritized remediation data.
              </p>
              <ul className="space-y-3">
                {["Automated CVE Enrichment", "NVD Database Integration", "Intelligent Vulnerability Correlation", "Accurate CVSS Risk Scoring", "Severity Classification", "Actionable Security Recommendations"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#cbd5e1] font-medium">
                    <CheckCircle2 className="text-[#ef4444]" size={16} /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="w-12 h-12 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 flex items-center justify-center text-[#8b5cf6] mb-6">
                <Globe size={24} />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Threat Intelligence</h3>
              <p className="text-[#94a3b8] mb-8 leading-relaxed">
                Gain deep context into external threats. ReconSentinel interrogates global threat feeds, WHOIS databases, and DNS registries to verify domain reputation, analyze IP blacklists, and provide actionable context for identified targets.
              </p>
              <ul className="space-y-3">
                {["Comprehensive IP Intelligence", "Domain Reputation Tracking", "WHOIS Registrar Insights", "Deep DNS Analysis", "Blacklist & Reputation Checks", "Adversary Threat Context"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#cbd5e1] font-medium">
                    <CheckCircle2 className="text-[#8b5cf6]" size={16} /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2 relative h-[400px] bg-[#0f172a] border border-[#21293a] rounded-2xl p-6 overflow-hidden flex flex-col gap-4">
              {/* CSS Dashboard Animation */}
              <div className="flex gap-4 mb-2">
                <div className="h-4 w-1/3 bg-[#1e293b] rounded animate-pulse"></div>
                <div className="h-4 w-1/4 bg-[#1e293b] rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-[#161b27] rounded-lg border border-[#334155] p-4 flex flex-col justify-between">
                  <div className="text-xs text-[#94a3b8] mb-2 uppercase">IP Risk Score</div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-[#ef4444]">92</span>
                    <span className="text-xs text-[#ef4444] mb-1">/100</span>
                  </div>
                  <div className="w-full h-1 bg-[#1e293b] mt-4 rounded overflow-hidden">
                    <motion.div className="h-full bg-[#ef4444]" initial={{ width: "0%" }} whileInView={{ width: "92%" }} transition={{ duration: 1.5, ease: "easeOut" }} />
                  </div>
                </div>
                <div className="bg-[#161b27] rounded-lg border border-[#334155] p-4 relative overflow-hidden flex items-center justify-center">
                  <Globe className="text-[#334155] absolute w-32 h-32 opacity-30" />
                  <div className="z-10 text-center">
                    <div className="text-xs text-[#94a3b8] mb-1 uppercase">Location</div>
                    <div className="font-bold text-white">Anomalous Routing</div>
                    <div className="text-xs text-[#8b5cf6] mt-1 flex items-center justify-center gap-1"><AlertTriangle size={10}/> Detected</div>
                  </div>
                </div>
              </div>
              <div className="h-24 bg-[#161b27] rounded-lg border border-[#334155] p-4 relative">
                <div className="text-xs text-[#94a3b8] mb-2 uppercase">Traffic Flow</div>
                <div className="absolute bottom-0 left-0 w-full h-12 flex items-end gap-1 px-4">
                  {[40, 20, 60, 90, 30, 50, 80, 100, 40, 60, 20].map((h, i) => (
                    <motion.div key={i} className="flex-1 bg-[#8b5cf6]/50 rounded-t-sm" initial={{ height: 0 }} whileInView={{ height: `${h}%` }} transition={{ duration: 0.5, delay: i * 0.1 }} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative h-[400px] bg-[#161b27] border border-[#21293a] rounded-2xl p-6 flex items-center justify-center overflow-hidden">
              {/* SVG Animation for Reporting */}
              <svg className="w-full h-full" viewBox="0 0 400 400">
                <rect x="50" y="100" width="300" height="200" rx="10" fill="#0f172a" stroke="#21293a" strokeWidth="2" />
                <line x1="80" y1="260" x2="320" y2="260" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                <line x1="80" y1="260" x2="80" y2="120" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                
                <motion.rect x="100" y="220" width="30" height="40" fill="#3b82f6" rx="2" initial={{ y: 260, height: 0 }} whileInView={{ y: 220, height: 40 }} transition={{ duration: 1 }} />
                <motion.rect x="150" y="180" width="30" height="80" fill="#22c55e" rx="2" initial={{ y: 260, height: 0 }} whileInView={{ y: 180, height: 80 }} transition={{ duration: 1, delay: 0.2 }} />
                <motion.rect x="200" y="140" width="30" height="120" fill="#eab308" rx="2" initial={{ y: 260, height: 0 }} whileInView={{ y: 140, height: 120 }} transition={{ duration: 1, delay: 0.4 }} />
                <motion.rect x="250" y="100" width="30" height="160" fill="#ef4444" rx="2" initial={{ y: 260, height: 0 }} whileInView={{ y: 100, height: 160 }} transition={{ duration: 1, delay: 0.6 }} />
                
                <motion.path d="M 115 200 L 165 140 L 215 170 L 265 80" fill="none" stroke="#fff" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1 }} />
                <motion.circle cx="265" cy="80" r="5" fill="#fff" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2.5 }} />
              </svg>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="w-12 h-12 rounded bg-[#eab308]/10 border border-[#eab308]/30 flex items-center justify-center text-[#eab308] mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Security Reporting & Analytics</h3>
              <p className="text-[#94a3b8] mb-8 leading-relaxed">
                Translate raw scanning data into executive-level insights. Track remediation efforts over time, analyze security trends, and export compliant, fully-featured PDF assessments for stakeholders.
              </p>
              <ul className="space-y-3">
                {["Historical Scan Timeline", "Centralized Risk Dashboard", "Executive Summaries", "Professional PDF Exports", "Persistent Scan History", "Risk Trend Analysis"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#cbd5e1] font-medium">
                    <CheckCircle2 className="text-[#eab308]" size={16} /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Feature 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="w-12 h-12 rounded bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] mb-6">
                <Cpu size={24} />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">AI Security Assistant</h3>
              <p className="text-[#94a3b8] mb-8 leading-relaxed">
                Don't just discover vulnerabilities—understand them. Our integrated AI co-pilot analyzes your specific scan results, explains attack vectors in plain English, and provides tailored mitigation commands.
              </p>
              <ul className="space-y-3">
                {["Contextual AI-Powered Analysis", "Plain English Scan Explanations", "Tailored Security Recommendations", "Automated MITRE ATT&CK Mapping", "Attack Surface Insights", "Defensive Hardening Guidance"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#cbd5e1] font-medium">
                    <CheckCircle2 className="text-[#22c55e]" size={16} /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2 relative h-[400px] bg-[#161b27] border border-[#21293a] rounded-2xl p-6 flex flex-col justify-end overflow-hidden">
              {/* CSS Animation for AI Chat */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#161b27] via-transparent to-transparent z-10" />
              <div className="space-y-4 relative z-0">
                <motion.div className="flex gap-3 max-w-[80%] ml-auto" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="bg-[#1e293b] border border-[#334155] p-3 rounded-lg rounded-tr-none text-xs text-[#cbd5e1]">
                    Explain CVE-2023-1234 and how I can patch it on Ubuntu.
                  </div>
                </motion.div>
                <motion.div className="flex gap-3 max-w-[90%]" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                  <div className="w-8 h-8 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/50 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-[#22c55e]" />
                  </div>
                  <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/30 p-4 rounded-lg rounded-tl-none text-xs text-[#e2e8f0] leading-relaxed shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <span className="text-[#3b82f6] font-bold mb-1 block">Vulnerability Analysis:</span>
                    This CVE allows remote code execution via unauthenticated API endpoints.
                    <br/><br/>
                    <span className="text-[#22c55e] font-bold mb-1 block">Mitigation (Ubuntu):</span>
                    <code className="bg-[#0f172a] px-2 py-1 rounded text-[#94a3b8] mt-1 block border border-[#21293a]">sudo apt update && sudo apt upgrade nginx</code>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-24 bg-[#05080f]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-[#94a3b8]">Everything you need to know about ReconSentinel and how it secures your infrastructure.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-[#21293a] rounded-lg bg-[#0a0f1a] overflow-hidden"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#161b27] transition-colors"
                >
                  <span className="font-semibold text-[#f1f5f9] pr-8">{faq.q}</span>
                  <ChevronDown size={18} className={`text-[#94a3b8] transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-[#3b82f6]' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 text-sm text-[#94a3b8] leading-relaxed border-t border-[#21293a] pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-[#0a0f1a] to-[#05080f] border-t border-[#21293a]">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-block p-4 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30 mb-8">
            <Shield size={48} className="text-[#3b82f6]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Secure Your Network?</h2>
          <p className="text-lg md:text-xl text-[#94a3b8] mb-10 max-w-2xl mx-auto">
            Launch ReconSentinel and begin intelligent reconnaissance and threat analysis immediately. No deployment friction, just actionable intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-[#3b82f6] hover:bg-[#2563eb] text-white px-10 py-4 rounded font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              Launch Console <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/documentation')}
              className="w-full sm:w-auto bg-transparent hover:bg-[#161b27] border border-[#334155] text-white px-10 py-4 rounded font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              View Documentation <FileText size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-24 bg-[#05080f]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Need Help?</h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto">Our support team and community are here to help you with technical support, bug reports, feature requests, or security issues.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.a 
              href="mailto:gyana.tcr20@gmail.com?subject=ReconSentinel%20Support%20Request"
              whileHover={{ y: -5 }}
              className="bg-[#161b27] border border-[#21293a] p-6 rounded-xl flex flex-col items-center text-center hover:border-[#3b82f6]/50 transition-colors group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50"
            >
              <div className="w-12 h-12 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <h4 className="text-white font-bold mb-2">Email Support</h4>
              <p className="text-xs text-[#94a3b8]">Reach out directly to our security engineers for technical assistance.</p>
            </motion.a>
            <motion.a 
              href="https://github.com/Gyanaranjan2234/NetReconX/issues" target="_blank" rel="noopener noreferrer"
              whileHover={{ y: -5 }}
              className="bg-[#161b27] border border-[#21293a] p-6 rounded-xl flex flex-col items-center text-center hover:border-[#22c55e]/50 transition-colors group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
            >
              <ExternalLink size={14} className="absolute top-4 right-4 text-[#94a3b8] group-hover:text-[#22c55e] transition-colors" />
              <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Github size={24} />
              </div>
              <h4 className="text-white font-bold mb-2">GitHub Issues</h4>
              <p className="text-xs text-[#94a3b8]">Report bugs or request new features directly on our public repository.</p>
            </motion.a>
            <motion.a 
              href="https://www.linkedin.com/in/gyana-ranjan-behera-7047222a1/" target="_blank" rel="noopener noreferrer"
              whileHover={{ y: -5 }}
              className="bg-[#161b27] border border-[#21293a] p-6 rounded-xl flex flex-col items-center text-center hover:border-[#0a66c2]/50 transition-colors group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/50"
            >
              <ExternalLink size={14} className="absolute top-4 right-4 text-[#94a3b8] group-hover:text-[#0a66c2] transition-colors" />
              <div className="w-12 h-12 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Linkedin size={24} />
              </div>
              <h4 className="text-white font-bold mb-2">LinkedIn</h4>
              <p className="text-xs text-[#94a3b8]">Connect with our team and stay updated on the latest platform news.</p>
            </motion.a>
            <motion.a 
              href="/contact"
              whileHover={{ y: -5 }}
              className="bg-[#161b27] border border-[#21293a] p-6 rounded-xl flex flex-col items-center text-center hover:border-[#eab308]/50 transition-colors group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#eab308]/50"
            >
              <div className="w-12 h-12 rounded-full bg-[#eab308]/10 text-[#eab308] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare size={24} />
              </div>
              <h4 className="text-white font-bold mb-2">Contact Form</h4>
              <p className="text-xs text-[#94a3b8]">Fill out a form for enterprise inquiries or general feedback.</p>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#21293a] bg-[#05080f] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#3b82f6]/10 p-1.5 rounded border border-[#3b82f6]/30 text-[#3b82f6]">
                  <Shield size={18} />
                </div>
                <span className="font-extrabold text-sm tracking-widest text-[#f1f5f9]">
                  <span className="text-[#3b82f6]">RECON</span><span className="text-[#22c55e]">SENTINEL</span>
                </span>
              </div>
              <p className="text-[#94a3b8] text-sm leading-relaxed mb-6">
                The ultimate platform for defensive network reconnaissance and automated threat intelligence aggregation.
              </p>
              <div className="flex items-start gap-3 p-4 rounded border border-[#eab308]/20 bg-[#eab308]/5">
                <Lock className="text-[#eab308] flex-shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] text-[#eab308] leading-relaxed font-mono">
                  <strong>SECURITY NOTICE:</strong> ReconSentinel is intended exclusively for authorized security assessments and defensive cybersecurity operations.
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Product</h4>
              <ul className="space-y-3 text-sm text-[#94a3b8]">
                <li><a href="#features" className="hover:text-[#3b82f6] transition-colors">Features</a></li>
                <li><a href="#workflow" className="hover:text-[#3b82f6] transition-colors">How it Works</a></li>
                <li><a href="#faq" className="hover:text-[#3b82f6] transition-colors">FAQ</a></li>
                <li><a href="/documentation" className="hover:text-[#3b82f6] transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Community</h4>
              <ul className="space-y-3 text-sm text-[#94a3b8]">
                <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#3b82f6] transition-colors">GitHub Repository</a></li>
                <li><a href="#" className="hover:text-[#3b82f6] transition-colors">Discord Community</a></li>
                <li><a href="#" className="hover:text-[#3b82f6] transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-[#3b82f6] transition-colors">Security Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Support</h4>
              <ul className="space-y-3 text-sm text-[#94a3b8]">
                <li><a href="#contact" className="hover:text-[#3b82f6] transition-colors">Contact Support</a></li>
                <li><a href="https://github.com/gyanaranjan2234/NetReconX/issues" target="_blank" rel="noreferrer" className="hover:text-[#3b82f6] transition-colors">Report a Bug</a></li>
                <li><a href="/privacy-policy" className="hover:text-[#3b82f6] transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-use" className="hover:text-[#3b82f6] transition-colors">Terms of Use</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#21293a] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#64748b]">&copy; {new Date().getFullYear()} ReconSentinel. All rights reserved.</p>
              <p className="text-[10px] text-[#475569] flex items-center gap-1">Made with <Heart size={10} className="text-[#ef4444]" /> for Cybersecurity Professionals</p>
            </div>
            <div className="text-xs text-[#64748b] font-mono flex items-center gap-4">
              <span>Status: <span className="text-[#22c55e]">Operational</span></span>
              <span>Version: 1.2.0</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
