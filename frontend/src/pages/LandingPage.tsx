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

  const Counter = ({ target, label, suffix = '', subtitle }: { target: number, label: string, suffix?: string, subtitle?: string }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let start = 0;
      const end = target;
      if (start === end) return;
      
      const totalMilSecDur = 2000;
      const steps = 60;
      const incrementTime = totalMilSecDur / steps;
      const increment = Math.max(1, Math.ceil(end / steps));
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }, [target]);

    return (
      <div className="flex flex-col items-center justify-start h-full text-center">
        <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#22c55e] mb-2 font-mono leading-tight">
          {count.toLocaleString()}{suffix}
        </span>
        <span className="text-sm md:text-base text-[#94a3b8] uppercase tracking-widest font-bold leading-snug">{label}</span>
        {subtitle && <span className="text-xs text-[#475569] font-mono mt-1.5 tracking-wider">{subtitle}</span>}
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
            onClick={() => navigate('/recon-console')}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white h-[48px] px-6 rounded text-base font-semibold leading-tight tracking-normal transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2"
          >
            Launch Console <ArrowRight size={20} />
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
              onClick={() => navigate('/recon-console')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white h-[52px] px-8 rounded text-base font-semibold leading-tight tracking-normal transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              Launch Console <Terminal size={20} />
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto bg-[#161b27] hover:bg-[#1e293b] border border-[#21293a] text-white h-[52px] px-8 rounded text-base font-semibold leading-tight tracking-normal transition-all flex items-center justify-center gap-2"
            >
              View Features <ChevronRight size={20} />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-start">
            <Counter target={65535} label="TCP Ports Supported" />
            <Counter target={215000} label="CVEs Indexed" suffix="+" />
            <Counter target={2} label="Threat Intelligence Sources" />
            <Counter target={3} label="Supported Lookup Types" subtitle="IP • Domain • CVE" />
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
      <section id="deep-dive" className="relative z-10 py-32 bg-[#05080f] border-y border-[#21293a] overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#3b82f6]/5 rounded-full blur-3xl mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#22c55e]/5 rounded-full blur-3xl mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-40 relative z-10">
          
          {/* Feature 1: Intelligent Network Discovery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="w-12 h-12 rounded bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] mb-6">
                <Network size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">Intelligent Network <br/><span className="text-[#3b82f6]">Discovery</span></h3>
              <p className="text-[#94a3b8] mb-8 leading-relaxed text-lg">
                Experience unparalleled visibility into your infrastructure. Our multi-threaded scanning engine rapidly identifies live hosts and open entry points, while stealthy fingerprinting techniques extract precise service metadata without raising alarms.
              </p>
              <ul className="space-y-4">
                {["Host Discovery via ICMP/ARP", "TCP SYN Port Scanning", "Multi-threaded Execution", "Service & Banner Grabbing"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#cbd5e1] font-bold">
                    <div className="bg-[#3b82f6]/20 p-1 rounded-full"><CheckCircle2 className="text-[#3b82f6]" size={16} /></div> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2 group perspective-1000">
              <div className="relative h-[450px] bg-[#0a0f1a]/80 backdrop-blur-xl border border-[#21293a] rounded-2xl p-6 flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:border-[#3b82f6]/50 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] group-hover:-translate-y-2">
                {/* Grid Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#3b82f615_0%,_transparent_70%)]" />
                
                {/* Node Topology Animation */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg className="absolute w-full h-full" viewBox="0 0 400 400">
                    {/* Radar Pulse */}
                    <motion.circle cx="200" cy="200" r="0" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5"
                      initial={{ r: 0, cx: 200, cy: 200 }} animate={{ r: [0, 200], opacity: [0.5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                    <motion.circle cx="200" cy="200" r="0" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5"
                      initial={{ r: 0, cx: 200, cy: 200 }} animate={{ r: [0, 200], opacity: [0.5, 0] }} transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "linear" }} />
                      
                    {/* Connecting Lines */}
                    {[
                      {x2: 120, y2: 100}, {x2: 280, y2: 120}, {x2: 100, y2: 260}, {x2: 280, y2: 280}, {x2: 200, y2: 80}
                    ].map((pos, i) => (
                      <motion.line key={i} x1="200" y1="200" x2={pos?.x2 ?? 200} y2={pos?.y2 ?? 200} stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.3"
                        initial={{ pathLength: 0, x1: 200, y1: 200, x2: pos?.x2 ?? 200, y2: pos?.y2 ?? 200 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }} />
                    ))}
                    
                    {/* Particles flowing */}
                    {[
                      {x1: 200, y1: 200, x2: 120, y2: 100}, {x1: 200, y1: 200, x2: 280, y2: 120}, {x1: 200, y1: 200, x2: 100, y2: 260}
                    ].map((p, i) => (
                      <motion.circle key={`p-${i}`} r="3" fill="#22c55e"
                        initial={{ cx: p?.x1 ?? 200, cy: p?.y1 ?? 200, r: 3 }}
                        animate={{ cx: [p?.x1 ?? 200, p?.x2 ?? 200], cy: [p?.y1 ?? 200, p?.y2 ?? 200], opacity: [0, 1, 0] }} transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }} />
                    ))}
                    
                    {/* Center Node */}
                    <circle cx="200" cy="200" r="16" fill="#161b27" stroke="#3b82f6" strokeWidth="3" />
                    <circle cx="200" cy="200" r="6" fill="#3b82f6" />
                    
                    {/* Outer Nodes */}
                    <circle cx="120" cy="100" r="12" fill="#161b27" stroke="#22c55e" strokeWidth="2" />
                    <circle cx="280" cy="120" r="14" fill="#161b27" stroke="#22c55e" strokeWidth="2" />
                    <circle cx="100" cy="260" r="10" fill="#161b27" stroke="#22c55e" strokeWidth="2" />
                    <circle cx="280" cy="280" r="12" fill="#161b27" stroke="#22c55e" strokeWidth="2" />
                    <circle cx="200" cy="80" r="10" fill="#161b27" stroke="#ef4444" strokeWidth="2" />
                  </svg>
                  
                  {/* Floating Tooltips */}
                  <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-10 right-10 bg-[#161b27] border border-[#334155] px-3 py-1.5 rounded-md text-xs font-mono text-[#22c55e] flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"/> 192.168.1.45
                  </motion.div>
                  <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 3.5, repeat: Infinity }} className="absolute bottom-16 left-8 bg-[#161b27] border border-[#ef4444]/50 px-3 py-1.5 rounded-md text-xs font-mono text-[#ef4444] flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"/> Firewall Blocked
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 2: Advanced Port & Service Enumeration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="group perspective-1000">
              <div className="relative h-[450px] bg-[#0a0f1a]/80 backdrop-blur-xl border border-[#21293a] rounded-2xl p-6 flex flex-col overflow-hidden transition-all duration-700 group-hover:border-[#8b5cf6]/50 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] group-hover:-translate-y-2">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 mb-4 border-b border-[#21293a] pb-4">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                  <span className="ml-2 text-xs font-mono text-[#64748b]">scanner@reconsentinel:~</span>
                </div>
                
                {/* Terminal Content */}
                <div className="flex-1 font-mono text-sm space-y-4 relative z-10">
                  <div className="text-[#3b82f6]">$ nmap -sS -sV 10.0.0.50</div>
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <div className="text-[#94a3b8]">Starting Nmap 7.93 at 2026-10-14 10:00</div>
                  </motion.div>
                  
                  <div className="space-y-3 pt-2">
                    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="flex justify-between items-center bg-[#161b27] border border-[#334155] p-3 rounded shadow">
                      <div className="flex items-center gap-3">
                        <span className="text-[#22c55e] font-bold">22/tcp</span>
                        <span className="text-white">open</span>
                        <span className="text-[#8b5cf6]">ssh</span>
                      </div>
                      <span className="text-xs text-[#94a3b8]">OpenSSH 8.9p1 Ubuntu</span>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }} className="flex justify-between items-center bg-[#161b27] border border-[#334155] p-3 rounded shadow">
                      <div className="flex items-center gap-3">
                        <span className="text-[#22c55e] font-bold">80/tcp</span>
                        <span className="text-white">open</span>
                        <span className="text-[#3b82f6]">http</span>
                      </div>
                      <span className="text-xs text-[#94a3b8]">nginx 1.18.0</span>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 2 }} className="flex justify-between items-center bg-[#161b27] border border-[#ef4444]/50 p-3 rounded shadow">
                      <div className="flex items-center gap-3">
                        <span className="text-[#ef4444] font-bold">3306/tcp</span>
                        <span className="text-white">open</span>
                        <span className="text-[#f59e0b]">mysql</span>
                      </div>
                      <span className="text-xs text-[#94a3b8]">MySQL 5.7.40</span>
                    </motion.div>
                  </div>
                  
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2.5 }} className="pt-2">
                    <div className="text-[#22c55e] flex items-center gap-2">
                      <CheckCircle2 size={14} /> Scan completed: 1 host up
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="w-12 h-12 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 flex items-center justify-center text-[#8b5cf6] mb-6">
                <Terminal size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">Advanced Port & <br/><span className="text-[#8b5cf6]">Service Enumeration</span></h3>
              <p className="text-[#94a3b8] mb-8 leading-relaxed text-lg">
                Go beyond basic port scanning. Our engine intelligently interacts with discovered services to grab banners, negotiate protocols, and fingerprint the exact software versions running on your target infrastructure.
              </p>
              <ul className="space-y-4">
                {["Accurate Version Fingerprinting", "Protocol Identification (HTTP, SSH, FTP, etc.)", "Fast Asynchronous I/O", "Evasion & Stealth Configurations"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#cbd5e1] font-bold">
                    <div className="bg-[#8b5cf6]/20 p-1 rounded-full"><CheckCircle2 className="text-[#8b5cf6]" size={16} /></div> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Feature 3: Vulnerability Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="w-12 h-12 rounded bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">Vulnerability <br/><span className="text-[#ef4444]">Intelligence</span></h3>
              <p className="text-[#94a3b8] mb-8 leading-relaxed text-lg">
                Instantly map discovered services against the National Vulnerability Database (NVD). Our engine automatically correlates CPE matches to identify known flaws, score them using CVSS, and present prioritized remediation data.
              </p>
              <ul className="space-y-4">
                {["Automated CVE Enrichment", "NVD Database Integration", "Accurate CVSS Risk Scoring", "Actionable Security Recommendations"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#cbd5e1] font-bold">
                    <div className="bg-[#ef4444]/20 p-1 rounded-full"><CheckCircle2 className="text-[#ef4444]" size={16} /></div> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2 group perspective-1000">
              <div className="relative h-[450px] bg-[#0a0f1a]/80 backdrop-blur-xl border border-[#21293a] rounded-2xl p-6 flex flex-col justify-center items-center overflow-hidden transition-all duration-700 group-hover:border-[#ef4444]/50 group-hover:shadow-[0_0_40px_rgba(239,68,68,0.15)] group-hover:-translate-y-2">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ef4444]/10 via-[#0a0f1a] to-[#0a0f1a]" />
                
                {/* CVSS Score Gauge */}
                <div className="relative w-40 h-40 mb-8 z-10">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                    <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" strokeDasharray="283"
                      initial={{ strokeDashoffset: 283, cx: 50, cy: 50, r: 45 }} whileInView={{ strokeDashoffset: 283 - (283 * 0.98) }} transition={{ duration: 2, ease: "easeOut" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">9.8</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#ef4444]">Critical</span>
                  </div>
                </div>
                
                {/* Floating CVE Cards */}
                <div className="w-full space-y-4 z-10 relative">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full bg-[#161b27] border border-[#ef4444]/50 rounded-lg p-4 shadow-lg flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold mb-1">CVE-2023-44487</div>
                      <div className="text-xs text-[#94a3b8]">HTTP/2 Rapid Reset Attack</div>
                    </div>
                    <div className="bg-[#ef4444]/20 text-[#ef4444] px-3 py-1 rounded text-xs font-bold">CVSS 7.5</div>
                  </motion.div>
                  
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="w-full bg-[#161b27] border border-[#f59e0b]/50 rounded-lg p-4 shadow-lg flex justify-between items-center ml-4">
                    <div>
                      <div className="text-white font-bold mb-1">CVE-2022-21907</div>
                      <div className="text-xs text-[#94a3b8]">HTTP Protocol Stack RCE</div>
                    </div>
                    <div className="bg-[#f59e0b]/20 text-[#f59e0b] px-3 py-1 rounded text-xs font-bold">CVSS 9.8</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 4: Risk Assessment Engine */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="group perspective-1000">
              <div className="relative h-[450px] bg-[#0a0f1a]/80 backdrop-blur-xl border border-[#21293a] rounded-2xl p-6 flex flex-col justify-center items-center overflow-hidden transition-all duration-700 group-hover:border-[#eab308]/50 group-hover:shadow-[0_0_40px_rgba(234,179,8,0.15)] group-hover:-translate-y-2">
                
                {/* Risk Heatmap Matrix */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <div className="grid grid-cols-8 gap-2">
                    {Array.from({ length: 64 }).map((_, i) => {
                      const isHigh = i % 7 === 0;
                      const isMed = i % 5 === 0;
                      const color = isHigh ? 'bg-[#ef4444]' : isMed ? 'bg-[#f59e0b]' : 'bg-[#22c55e]';
                      return (
                        <motion.div key={i} className={`w-8 h-8 rounded-sm ${color}`}
                          initial={{ opacity: 0.1 }}
                          animate={{ opacity: [0.1, 0.6, 0.1] }}
                          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Dashboard Elements */}
                <div className="relative z-10 w-full space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#161b27]/90 backdrop-blur border border-[#334155] p-5 rounded-xl text-center shadow-lg">
                      <div className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Total Assets</div>
                      <div className="text-3xl font-black text-white">1,204</div>
                    </motion.div>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-[#161b27]/90 backdrop-blur border border-[#ef4444]/50 p-5 rounded-xl text-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                      <div className="text-[10px] text-[#ef4444] uppercase font-bold tracking-widest mb-1">High Risk</div>
                      <div className="text-3xl font-black text-white">42</div>
                    </motion.div>
                  </div>
                  
                  <div className="bg-[#161b27]/90 backdrop-blur border border-[#334155] p-6 rounded-xl space-y-5 shadow-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-white"><span className="text-[#ef4444]">Critical</span><span>12%</span></div>
                      <div className="w-full h-2 bg-[#05080f] rounded-full overflow-hidden">
                        <motion.div className="h-full bg-[#ef4444]" initial={{ width: 0 }} whileInView={{ width: "12%" }} transition={{ duration: 1 }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-white"><span className="text-[#f59e0b]">High</span><span>28%</span></div>
                      <div className="w-full h-2 bg-[#05080f] rounded-full overflow-hidden">
                        <motion.div className="h-full bg-[#f59e0b]" initial={{ width: 0 }} whileInView={{ width: "28%" }} transition={{ duration: 1, delay: 0.2 }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-white"><span className="text-[#22c55e]">Low</span><span>60%</span></div>
                      <div className="w-full h-2 bg-[#05080f] rounded-full overflow-hidden">
                        <motion.div className="h-full bg-[#22c55e]" initial={{ width: 0 }} whileInView={{ width: "60%" }} transition={{ duration: 1, delay: 0.4 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="w-12 h-12 rounded bg-[#eab308]/10 border border-[#eab308]/30 flex items-center justify-center text-[#eab308] mb-6">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">Risk Assessment <br/><span className="text-[#eab308]">Engine</span></h3>
              <p className="text-[#94a3b8] mb-8 leading-relaxed text-lg">
                Translate raw scanning data into executive-level insights. Our proprietary risk engine aggregates CVSS scores, calculates organizational impact, and visualizes security posture across your entire attack surface.
              </p>
              <ul className="space-y-4">
                {["Centralized Risk Dashboard", "Organizational Impact Scoring", "Interactive Threat Heatmaps", "Trend & Posture Analysis"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#cbd5e1] font-bold">
                    <div className="bg-[#eab308]/20 p-1 rounded-full"><CheckCircle2 className="text-[#eab308]" size={16} /></div> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Feature 5: Professional Report Generation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
              <div className="w-12 h-12 rounded bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">Professional Report <br/><span className="text-[#22c55e]">Generation</span></h3>
              <p className="text-[#94a3b8] mb-8 leading-relaxed text-lg">
                Generate compliant, executive-ready PDF assessments in seconds. Automatically export detailed vulnerability findings, scan summaries, and AI-driven mitigation steps to share with stakeholders or compliance auditors.
              </p>
              <ul className="space-y-4">
                {["Executive Summaries", "Professional PDF Exports", "Actionable Mitigation Plans", "Compliance-Ready Formatting"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#cbd5e1] font-bold">
                    <div className="bg-[#22c55e]/20 p-1 rounded-full"><CheckCircle2 className="text-[#22c55e]" size={16} /></div> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2 group perspective-1000">
              <div className="relative h-[450px] bg-[#0a0f1a]/80 backdrop-blur-xl border border-[#21293a] rounded-2xl p-6 flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:border-[#22c55e]/50 group-hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] group-hover:-translate-y-2">
                
                {/* Floating PDF Document */}
                <motion.div 
                  initial={{ y: 50, opacity: 0 }} 
                  whileInView={{ y: 0, opacity: 1 }} 
                  transition={{ duration: 0.8 }}
                  className="w-[280px] h-[360px] bg-white rounded-lg shadow-2xl relative overflow-hidden flex flex-col"
                >
                  {/* PDF Header */}
                  <div className="h-16 bg-[#1e293b] flex items-center px-6">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-[#3b82f6]" />
                      <span className="font-extrabold text-[10px] tracking-widest text-[#f1f5f9]">RECONSENTINEL</span>
                    </div>
                  </div>
                  
                  {/* PDF Content */}
                  <div className="p-6 flex-1 bg-[#f8fafc]">
                    <div className="w-3/4 h-6 bg-[#cbd5e1] rounded mb-6" />
                    
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 h-20 bg-[#e2e8f0] rounded-md border-l-4 border-[#ef4444] p-3 flex flex-col justify-center">
                        <div className="w-12 h-3 bg-[#cbd5e1] rounded mb-2" />
                        <div className="w-8 h-6 bg-[#ef4444] rounded" />
                      </div>
                      <div className="flex-1 h-20 bg-[#e2e8f0] rounded-md border-l-4 border-[#f59e0b] p-3 flex flex-col justify-center">
                        <div className="w-12 h-3 bg-[#cbd5e1] rounded mb-2" />
                        <div className="w-8 h-6 bg-[#f59e0b] rounded" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="w-full h-4 bg-[#e2e8f0] rounded" />
                      <div className="w-full h-4 bg-[#e2e8f0] rounded" />
                      <div className="w-5/6 h-4 bg-[#e2e8f0] rounded" />
                      <div className="w-4/6 h-4 bg-[#e2e8f0] rounded" />
                    </div>
                  </div>
                  
                  {/* Scanning overlay effect */}
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-1 bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]"
                    animate={{ y: [0, 360, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
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
              onClick={() => navigate('/recon-console')}
              className="w-full sm:w-auto bg-[#3b82f6] hover:bg-[#2563eb] text-white h-[52px] px-8 rounded text-base font-semibold leading-tight tracking-normal transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              Launch Console <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => navigate('/documentation')}
              className="w-full sm:w-auto bg-transparent hover:bg-[#161b27] border border-[#334155] text-white h-[48px] px-8 rounded text-base font-semibold leading-tight tracking-normal transition-all flex items-center justify-center gap-2"
            >
              View Documentation <FileText size={20} />
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
              href="https://github.com/Gyanaranjan2234/ReconSentinel/issues" target="_blank" rel="noopener noreferrer"
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
                <li><a href="https://github.com/gyanaranjan2234/ReconSentinel/issues" target="_blank" rel="noreferrer" className="hover:text-[#3b82f6] transition-colors">Report a Bug</a></li>
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
