import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  ShieldAlert, 
  RotateCw, 
  FileText, 
  Globe, 
  ArrowRight, 
  Search, 
  Download, 
  AlertTriangle, 
  Send, 
  Network, 
  Bot, 
  Server,
  WifiOff,
  XCircle,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';
import axios from 'axios';
import { useScan } from '../hooks/useScan';
import { ScanResult, ThreatIntel } from '../types';
import { Tab } from './DashboardLayout';

// Port details mapper interfaces
interface EnrichedPort {
  port: string;
  service: string;
  version: string;
  risk: 'dangerous' | 'medium' | 'safe';
  riskText: string;
  riskColor: string;
  cves: string[];
  banner: string;
}

interface EnrichedCVE {
  id: string;
  cvss: number;
  description: string;
  publishedDate: string;
  references: string[];
  mitreTechnique: string;
}

interface EnrichedScan {
  target: string;
  riskLevel: 'High' | 'Medium' | 'Low' | 'Unknown' | 'Not Assessed';
  riskColor: string;
  openPortsCount: number;
  duration: string;
  startTimeFormatted: string;
  endTimeFormatted: string;
  durationFormatted: string;
  ports: EnrichedPort[];
  cves: EnrichedCVE[];
  hostReachable: boolean;
  hostStatus: 'reachable' | 'unreachable' | 'unknown';
  pingInfo: { reachable: boolean; packet_loss?: number; avg_latency_ms?: number } | null;
  resolvedIp: string;
  resolvedHostname: string;
  reverseDns: string;
  portsScannedCount: number;
  closedPortsCount: number;
  filteredPortsCount: number;
  highestCvss: number;
  executiveSummary: string;
  recommendations: string[];
}

const ScanLoadingUI = ({ target }: { target: string }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing Scan');

  useEffect(() => {
    const stages = [
      { p: 0, text: 'Initializing Scan' },
      { p: 10, text: 'Resolving Target' },
      { p: 25, text: 'Host Discovery' },
      { p: 50, text: 'Port Scanning' },
      { p: 70, text: 'Service Detection' },
      { p: 85, text: 'Banner Grabbing' },
      { p: 95, text: 'Risk Analysis' }
    ];

    let currentStageIndex = 0;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (currentStageIndex < stages.length - 1 && prev >= stages[currentStageIndex + 1].p) {
          currentStageIndex++;
          setStage(stages[currentStageIndex].text);
        }
        
        const currentTarget = stages[currentStageIndex + 1]?.p ?? 95;
        if (prev < currentTarget) {
          return prev + 1;
        } else if (prev === currentTarget && currentStageIndex < stages.length - 1) {
          currentStageIndex++;
          setStage(stages[currentStageIndex].text);
          return prev;
        }
        return prev;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-16 flex flex-col items-center justify-center min-h-[400px] w-full bg-[#161b27]">
      <div className="relative flex items-center justify-center mb-10 mt-8">
        <div className="absolute w-32 h-32 rounded-full border border-[#3b82f6]/20 animate-ping"></div>
        <div className="absolute w-24 h-24 rounded-full border-t-2 border-[#3b82f6] animate-spin"></div>
        <div className="absolute w-20 h-20 rounded-full border-b-2 border-[#a855f7] animate-[spin_1.5s_linear_reverse_infinite]"></div>
        <div className="absolute w-16 h-16 rounded-full border-l-2 border-[#6366f1] animate-[spin_2s_linear_infinite]"></div>
        <Network size={28} className="text-[#3b82f6] animate-pulse" />
      </div>

      <div className="text-center space-y-4 w-full max-w-sm">
        <p className="text-sm text-[#f1f5f9] font-mono animate-pulse tracking-widest uppercase shadow-[#3b82f6] drop-shadow-md">
          {stage}...
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#94a3b8] font-mono px-1">
            <span>TARGET: {target}</span>
            <span className="text-[#3b82f6]">{progress}%</span>
          </div>
          
          <div className="w-full bg-[#0b1220] rounded-full h-2 overflow-hidden border border-[#21293a] relative shadow-[0_0_10px_rgba(59,130,246,0.15)]">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#a855f7] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-center gap-1.5 mt-6">
           <div className={`h-1 w-8 ${progress > 20 ? 'bg-[#3b82f6] shadow-[0_0_5px_#3b82f6]' : 'bg-[#21293a]'} rounded-full transition-all duration-500`}></div>
           <div className={`h-1 w-8 ${progress > 40 ? 'bg-[#3b82f6] shadow-[0_0_5px_#3b82f6]' : 'bg-[#21293a]'} rounded-full transition-all duration-500`}></div>
           <div className={`h-1 w-8 ${progress > 60 ? 'bg-[#6366f1] shadow-[0_0_5px_#6366f1]' : 'bg-[#21293a]'} rounded-full transition-all duration-500`}></div>
           <div className={`h-1 w-8 ${progress > 80 ? 'bg-[#a855f7] shadow-[0_0_5px_#a855f7]' : 'bg-[#21293a]'} rounded-full transition-all duration-500`}></div>
        </div>
      </div>
    </div>
  );
};

interface DashboardProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function Dashboard({ activeTab, setActiveTab }: DashboardProps) {
  const { scans, loading, scanError, triggerScan, refreshScans, clearHistory } = useScan();
  const [target, setTarget] = useState('');
  const [portRange, setPortRange] = useState('1-1024');
  const [threads, setThreads] = useState('8');
  
  const [intelQuery, setIntelQuery] = useState('');
  const [intelType, setIntelType] = useState('CVE');
  const [intelResult, setIntelResult] = useState<ThreatIntel | null>(null);
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelValidationError, setIntelValidationError] = useState('');
  
  const [activeScan, setActiveScan] = useState<ScanResult | null>(null);
  
  // Custom Scan Profiles states
  const [pingDiscovery, setPingDiscovery] = useState(true);
  const [aggressiveMode, setAggressiveMode] = useState(false);

  // Network Map Interactive States
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Expanded history row state
  const [expandedScanId, setExpandedScanId] = useState<number | null>(null);
  const handleAnalyzeClick = (scanId: number) => {
    setExpandedScanId(prev => prev === scanId ? null : scanId);
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to permanently delete all scan history? This action cannot be undone.")) {
      const success = await clearHistory();
      if (success) {
        showToast("All scan history cleared successfully.", "success");
        setExpandedScanId(null);
      } else {
        showToast("Failed to clear scan history.", "error");
      }
    }
  };

  // AI Assistant States
  const [aiInput, setAiInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant', text: string, time: string }>>([
    { 
      sender: 'assistant', 
      text: 'Hello! I am your ReconSentinel Copilot. I can analyze your network scans, explain CVEs, or suggest remediation configurations. Try asking about a CVE or target host.', 
      time: '09:00 AM' 
    }
  ]);
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, aiTyping]);

  // Normalize service name by port number — fixes stale DB records that stored "http" for port 443
  const normalizeService = (portNum: number, rawService: string): string => {
    const PORT_SERVICE_MAP: Record<number, string> = {
      21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp', 53: 'dns',
      80: 'http', 110: 'pop3', 143: 'imap', 443: 'https',
      465: 'smtps', 587: 'smtp', 993: 'imaps', 995: 'pop3s',
      3306: 'mysql', 3389: 'rdp', 5432: 'postgresql',
      6379: 'redis', 8080: 'http-proxy', 8443: 'https',
      27017: 'mongodb',
    };
    if (PORT_SERVICE_MAP[portNum]) return PORT_SERVICE_MAP[portNum];
    return rawService || 'unknown';
  };

  // Helper to format dates to pattern: 25 Jun 2026, 2:59:57 PM
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    const day = date.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  // Helper to format duration to pattern: 10.82 sec
  const formatDuration = (sec?: number) => {
    if (sec === undefined || sec === null || sec < 0) return 'N/A';
    return `${sec.toFixed(2)} sec`;
  };

  // Parse scan data helper
  const parseScan = (scan: ScanResult | null): EnrichedScan | null => {
    if (!scan || !scan.results) return null;
    const results = scan.results;
    
    const duration = results.scan_duration_seconds ? `${results.scan_duration_seconds}s` : '4.8s';
    
    // Parse times
    const startTimeFormatted = formatDate(scan.start_time || scan.created_at);
    const endTimeFormatted = formatDate(scan.end_time || scan.created_at);
    const durationFormatted = formatDuration(scan.duration ?? results.scan_duration_seconds ?? 4.8);

    const ports: EnrichedPort[] = [];
    const scanCves: EnrichedCVE[] = [];

    if (results.hosts && Array.isArray(results.hosts)) {
      results.hosts.forEach((host: any) => {
        if (host.ports && Array.isArray(host.ports)) {
          host.ports.forEach((p: any) => {
            const portNum = Number(p.port);
            const serviceName = (p.service || '').toLowerCase();
            const versionStr = (p.version || '').toLowerCase();

            let portRisk: 'dangerous' | 'medium' | 'safe' = 'safe';
            let portRiskText = 'Safe';
            let portRiskColor = '#22c55e';
            const portCves: string[] = [];

            if (serviceName.includes('squid') || versionStr.includes('squid') || portNum === 8080) {
              portRisk = 'dangerous';
              portRiskText = 'Dangerous';
              portRiskColor = '#ef4444';
              portCves.push('CVE-2023-45897');
              if (!scanCves.some(c => c.id === 'CVE-2023-45897')) {
                scanCves.push({
                  id: 'CVE-2023-45897',
                  cvss: 9.8,
                  description: 'The Squid proxy RCE flaw allows remote attackers to execute arbitrary code via unverified HTTP requests.',
                  publishedDate: '2023-10-15',
                  references: [
                    'https://nvd.nist.gov/vuln/detail/CVE-2023-45897',
                    'https://github.com/squid-cache/squid/security/advisories'
                  ],
                  mitreTechnique: 'Exploit Public-Facing Application (T1190), Remote Access Software (T1219)'
                });
              }
            } else if (serviceName.includes('apache') || versionStr.includes('apache') || portNum === 80) {
              portRisk = 'medium';
              portRiskText = 'Medium';
              portRiskColor = '#eab308';
              portCves.push('CVE-2021-40438');
              if (!scanCves.some(c => c.id === 'CVE-2021-40438')) {
                scanCves.push({
                  id: 'CVE-2021-40438',
                  cvss: 7.5,
                  description: 'Apache HTTP Server mod_proxy SSRF vulnerability allows remote attackers to coerce the server into routing requests to arbitrary endpoints.',
                  publishedDate: '2021-09-16',
                  references: [
                    'https://nvd.nist.gov/vuln/detail/CVE-2021-40438',
                    'https://httpd.apache.org/security/vulnerabilities_24.html'
                  ],
                  mitreTechnique: 'Exploit Public-Facing Application (T1190)'
                });
              }
            } else if (serviceName.includes('ssh') || versionStr.includes('ssh') || portNum === 22) {
              portRisk = 'medium';
              portRiskText = 'Medium';
              portRiskColor = '#eab308';
              portCves.push('CVE-2024-6387');
              if (!scanCves.some(c => c.id === 'CVE-2024-6387')) {
                scanCves.push({
                  id: 'CVE-2024-6387',
                  cvss: 8.1,
                  description: 'A signal handler race condition vulnerability was found in OpenSSH\'s server (sshd), allowing unauthenticated remote code execution as root.',
                  publishedDate: '2024-07-01',
                  references: [
                    'https://nvd.nist.gov/vuln/detail/CVE-2024-6387',
                    'https://www.qualys.com/2024/07/01/regresshion/regresshion.txt'
                  ],
                  mitreTechnique: 'Exploit Public-Facing Application (T1190)'
                });
              }
            }

            ports.push({
              port: `${p.port}/${p.protocol || 'tcp'}`,
              service: normalizeService(portNum, p.service || ''),
              version: p.version || 'unknown',
              risk: portRisk,
              riskText: portRiskText,
              riskColor: portRiskColor,
              cves: portCves,
              banner: p.banner || `${p.service || 'unknown'} ${p.version || '1.0'} handshake banner`
            });
          });
        }
      });
    }

    // Determine host reachability
    const pingInfo = results.ping || null;
    const hostReachable = pingInfo ? pingInfo.reachable : (ports.length > 0);
    const hasAnyOpenPort = ports.length > 0;
    let hostStatus: 'reachable' | 'unreachable' | 'unknown' = 'unknown';
    if (pingInfo) {
      hostStatus = pingInfo.reachable ? 'reachable' : 'unreachable';
    } else if (hasAnyOpenPort) {
      hostStatus = 'reachable';
    }

    let riskLevel: 'High' | 'Medium' | 'Low' | 'Unknown' | 'Not Assessed' = 'Low';
    if (!hostReachable && ports.length === 0) {
      riskLevel = 'Not Assessed';
    } else if (ports.some(p => p.risk === 'dangerous')) {
      riskLevel = 'High';
    } else if (ports.some(p => p.risk === 'medium')) {
      riskLevel = 'Medium';
    }

    let riskColor = 'text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10';
    if (riskLevel === 'High') {
      riskColor = 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10';
    } else if (riskLevel === 'Medium') {
      riskColor = 'text-[#eab308] border-[#eab308]/30 bg-[#eab308]/10';
    } else if (riskLevel === 'Not Assessed') {
      riskColor = 'text-[#64748b] border-[#64748b]/30 bg-[#64748b]/10';
    }

    // Ports Scanned Metrics
    const portRange = results.port_range || '1-1024';
    let portsScannedCount = 0;
    if (portRange.toLowerCase() === 'common') {
      portsScannedCount = 5;
    } else {
      const parts = portRange.split('-');
      if (parts.length === 2) {
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);
        if (!isNaN(start) && !isNaN(end)) {
          portsScannedCount = end - start + 1;
        }
      } else {
        portsScannedCount = portRange.split(',').length;
      }
    }

    let closedPortsCount = 0;
    let filteredPortsCount = 0;
    if (hostStatus === 'unreachable') {
      filteredPortsCount = portsScannedCount;
      closedPortsCount = 0;
    } else {
      filteredPortsCount = 0;
      closedPortsCount = portsScannedCount - ports.length;
    }

    const resolvedIp = results.resolved_ip || scan.target || 'Unknown';
    const resolvedHostname = results.resolved_hostname || scan.target || 'Unknown';
    const reverseDns = results.reverse_dns || 'N/A';
    const highestCvss = scanCves.length > 0 ? Math.max(...scanCves.map(c => c.cvss)) : 0;

    // Dynamic Executive Summary
    let executiveSummary = '';
    if (riskLevel === 'Not Assessed') {
      executiveSummary = `Security reconnaissance of target host ${scan.target} was initiated. Host discovery failed as the target did not respond to ICMP ping or TCP port probes. No active ports or exposed services could be identified. It is highly recommended to verify target availability, check network routing, or confirm firewall policy configuration before conducting further assessments.`;
    } else if (ports.length === 0) {
      executiveSummary = `Security reconnaissance of target host ${scan.target} completed successfully. The host is online (resolved to IP: ${resolvedIp}), but no open TCP/UDP ports were discovered within the scanned range (${portRange}). This indicates a hardened network profile with no publicly exposed entry points. Regular audits are recommended to ensure no unauthorized services are opened in the future.`;
    } else if (scanCves.length > 0) {
      const servicesList = Array.from(new Set(ports.map(p => p.service))).join(', ');
      executiveSummary = `Security reconnaissance of target host ${scan.target} (resolved to IP: ${resolvedIp}) completed successfully. The host is active and exposing ${ports.length} open network port(s) running ${servicesList}. Risk assessment identified a ${riskLevel} risk posture due to ${scanCves.length} detected vulnerability signatures, including critical remote exploit pathways mapped to CVSS ${highestCvss} criteria. Remediation of these findings should be prioritized immediately.`;
    } else {
      const servicesList = Array.from(new Set(ports.map(p => p.service))).join(', ');
      executiveSummary = `Security reconnaissance of target host ${scan.target} (resolved to IP: ${resolvedIp}) completed successfully. The host is active and exposing ${ports.length} open network port(s) running ${servicesList}. No known vulnerabilities or exploit mappings were identified for the detected service versions. The host currently presents a Low risk profile, but exposed services should be reviewed to confirm they align with standard authorization policies.`;
    }

    // Dynamic Security Recommendations
    const recommendations: string[] = [];
    if (ports.length === 0) {
      recommendations.push("No open services discovered. Maintain periodic audits and firewall egress policies to block unauthorized traffic.");
    } else {
      if (ports.some(p => p.service.toLowerCase().includes('ftp'))) {
        recommendations.push("FTP Service Detected: FTP transmits credentials and data in cleartext. Upgrade FTP endpoints to secure SSH File Transfer Protocol (SFTP) or FTP over SSL/TLS (FTPS) to prevent credential sniffing.");
      }
      if (ports.some(p => p.service.toLowerCase().includes('http') && !p.service.toLowerCase().includes('https'))) {
        recommendations.push("Unencrypted HTTP Protocol: Web interface detected on port 80/8080. Migrate administrative or public web nodes to HTTPS using TLS 1.3 to ensure transport-layer encryption.");
      }
      if (scanCves.some(c => c.id === 'CVE-2023-45897')) {
        recommendations.push("Upgrade Squid proxy service: Apply latest patches to Squid proxy daemon to secure internal loopback interfaces against unauthenticated RCE.");
      }
      if (scanCves.some(c => c.id === 'CVE-2021-40438')) {
        recommendations.push("Patch Apache Server: Upgrade Apache httpd modules past 2.4.51 to resolve mod_proxy SSRF vulnerability.");
      }
      if (scanCves.some(c => c.id === 'CVE-2024-6387')) {
        recommendations.push("Mitigate OpenSSH RegreSSHion vulnerability: Upgrade OpenSSH to version 9.8p1 or set LoginGraceTime to 0 in sshd_config to mitigate remote execution risks.");
      }
      if (ports.some(p => p.port.startsWith('3389/'))) {
        recommendations.push("Exposed RDP Port: Restrict access to Remote Desktop Protocol (RDP) on port 3389 by placing it behind a VPN and enabling Multi-Factor Authentication (MFA).");
      }
      if (ports.some(p => p.port.startsWith('3306/'))) {
        recommendations.push("Database Port Exposure: MySQL database listener (port 3306) detected. Bind the database daemon to local loopback interface (127.0.0.1) and disable public remote access.");
      }
      recommendations.push("Enforce egress filtering: Implement firewall ACL policies restricting target nodes from initiating outbound connections except to authorized repositories.");
      recommendations.push("Regular audit configuration: Conduct continuous authenticated port scans to identify unexpected services and versions.");
    }

    return {
      target: scan.target || 'Unknown',
      riskLevel,
      riskColor,
      openPortsCount: ports.length,
      duration,
      startTimeFormatted,
      endTimeFormatted,
      durationFormatted,
      ports,
      cves: scanCves,
      hostReachable,
      hostStatus,
      pingInfo,
      resolvedIp,
      resolvedHostname,
      reverseDns,
      portsScannedCount,
      closedPortsCount,
      filteredPortsCount,
      highestCvss,
      executiveSummary,
      recommendations,
    };
  };


  // Sync active scan with latest poll data
  useEffect(() => {
    if (scans.length > 0) {
      // Prioritize displaying any active scanning scan
      const scanningScan = scans.find(s => s.status === 'scanning');
      if (scanningScan) {
        if (!activeScan || activeScan.id !== scanningScan.id || activeScan.status !== 'scanning') {
          setActiveScan(scanningScan);
        }
        return;
      }

      if (!activeScan) {
        const completed = scans.find(s => s.status === 'completed');
        setActiveScan(completed || scans[0]);
      } else {
        const updated = scans.find(s => s.id === activeScan.id);
        if (updated) {
          if (updated.status !== activeScan.status || updated.results !== activeScan.results) {
            setActiveScan(updated);
          }
        }
      }
    }
  }, [scans, activeScan]);

  // Statistics Computations
  const totalScans = scans.length;
  let totalOpenPorts = 0;
  let totalCVEs = 0;

  scans.forEach(s => {
    if (s.status === 'completed') {
      const parsed = parseScan(s);
      if (parsed) {
        totalOpenPorts += parsed.openPortsCount;
        totalCVEs += parsed.cves.length;
      }
    }
  });

  const latestCompleted = scans.find(s => s.status === 'completed');
  const latestParsed = parseScan(latestCompleted || null);
  const lastRiskScore = latestParsed 
    ? (latestParsed.riskLevel === 'High' ? '9.8' : latestParsed.riskLevel === 'Medium' ? '7.5' : '1.5') 
    : '0.0';
  const lastRiskLevel = latestParsed ? latestParsed.riskLevel : 'Low';

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    if (portRange === '1-65535') {
      const confirmed = window.confirm(
        'Full-range scans (1-65535) can take significantly longer and may generate heavy traffic. Do you want to continue?'
      );
      if (!confirmed) {
        return;
      }
    }

    // Clear stale threat intelligence search results
    setIntelResult(null);

    const createdScan = await triggerScan({
      target,
      port_range: portRange,
      threads: Number(threads),
      aggressive_mode: aggressiveMode,
      ping_discovery: pingDiscovery,
    });

    if (createdScan) {
      // Do NOT clear the target input automatically; keep it visible
      setActiveScan(createdScan);
      setActiveTab('dashboard'); // Redirect to dashboard to monitor status
    }
  };

  const handleIntelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intelQuery) return;
    
    setIntelValidationError('');
    
    if (intelType === 'CVE') {
      const cveRegex = /^CVE-\d{4}-\d{4,7}$/i;
      if (!cveRegex.test(intelQuery)) {
        setIntelValidationError('Please enter a valid CVE format (e.g. CVE-2021-40438).');
        return;
      }
    } else if (intelType === 'IP') {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/;
      if (!ipRegex.test(intelQuery)) {
        setIntelValidationError('Please enter a valid IP address.');
        return;
      }
    } else if (intelType === 'Domain') {
      const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
      if (!domainRegex.test(intelQuery)) {
        setIntelValidationError('Please enter a valid domain name.');
        return;
      }
    }

    setIntelLoading(true);
    try {
      const response = await axios.get(`/api/intel/lookup?query=${encodeURIComponent(intelQuery)}&type=${intelType}`);
      setIntelResult(response.data);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setIntelValidationError(err.response.data.detail);
      } else {
        setIntelValidationError('Failed to fetch threat intel.');
      }
    } finally {
      setIntelLoading(false);
    }
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setAiInput('');
    setAiTyping(true);

    setTimeout(() => {
      let responseText = `I have analyzed the current environment records. `;
      const queryLower = userMsg.toLowerCase();

      if (queryLower.includes('cve-2023-45897') || queryLower.includes('squid')) {
        responseText += `The Squid proxy RCE flaw (CVE-2023-45897) is rated Critical (CVSS 9.8). Recommendation: Add authentication validators, patch squid, or configure proxy acl rules to drop unverified payloads.`;
      } else if (queryLower.includes('cve-2021-40438') || queryLower.includes('apache')) {
        responseText += `Apache HTTP mod_proxy SSRF (CVE-2021-40438) has a CVSS of 7.5. Recommendation: Disable unneeded proxy paths, configure 'ProxyRequests Off' in httpd.conf, and upgrade httpd.`;
      } else if (queryLower.includes('port') || queryLower.includes('scan') || queryLower.includes('risk')) {
        responseText += `Your last target host returned risk level: ${lastRiskLevel}. Discovered ports indicate exposed ${totalOpenPorts} open nodes. Secure unnecessary SSH interfaces and ensure HTTPS modules are patched.`;
      } else {
        responseText += `Ensure your sandbox target IP address matches safe ranges. Keep service ports closed when not running active mock tests.`;
      }

      setChatMessages(prev => [...prev, { sender: 'assistant', text: responseText, time: timeStr }]);
      setAiTyping(false);
    }, 1200);
  };

  // Enriched active scan state
  const enrichedActiveScan = parseScan(activeScan);

  // Render Stats Card Helper
  const renderStatCard = (title: string, value: string | number, subtext: string, colorClass: string) => (
    <div className="bg-[#161b27] border border-[#21293a] rounded-lg p-4 flex flex-col justify-between">
      <span className="text-[10px] font-semibold tracking-[0.08em] text-[#475569] uppercase">{title}</span>
      <div className="mt-2 flex items-baseline justify-between">
        <span className={`text-[20px] font-bold ${colorClass}`}>{value}</span>
        <span className="text-[10px] text-[#94a3b8]">{subtext}</span>
      </div>
    </div>
  );

  const renderDetailedReport = (scan: ScanResult, parsed: EnrichedScan) => (
    <div className="space-y-6 text-[#94a3b8] font-sans">
      {/* Executive Summary */}
      <div className="bg-[#161b27] border border-[#21293a] rounded p-4 text-left">
        <h5 className="text-[10px] font-bold text-white uppercase tracking-wider mb-1.5 font-mono">Executive Summary</h5>
        <p className="text-xs leading-relaxed text-[#f1f5f9]">
          {parsed.executiveSummary}
        </p>
      </div>

      {/* Grid of Info and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Host Information */}
        <div className="bg-[#161b27] border border-[#21293a] rounded overflow-hidden">
          <div className="bg-[#0d1117] border-b border-[#21293a] p-3">
            <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Server size={14} className="text-[#3b82f6]" /> Host Information
            </h5>
          </div>
          <div className="p-3 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[#475569]">Target:</span> <span className="font-mono text-white">{parsed.target}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Resolved IP:</span> <span className="font-mono text-white">{parsed.resolvedIp}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Hostname:</span> <span className="font-mono text-white">{parsed.resolvedHostname}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Host Status:</span> <span className={`font-mono font-semibold ${parsed.hostStatus === 'reachable' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{parsed.hostStatus === 'reachable' ? 'Online' : 'Offline'}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Reverse DNS:</span> <span className="font-mono text-white">{parsed.reverseDns}</span></div>
          </div>
        </div>

        {/* Scan Information */}
        <div className="bg-[#161b27] border border-[#21293a] rounded overflow-hidden">
          <div className="bg-[#0d1117] border-b border-[#21293a] p-3">
            <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Network size={14} className="text-[#a855f7]" /> Scan Information
            </h5>
          </div>
          <div className="p-3 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[#475569]">Scan Type:</span> <span className="font-mono text-white">TCP Connect Scan</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Port Range:</span> <span className="font-mono text-white">{(scan as any).port_range || '1-1024'}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Threads Used:</span> <span className="font-mono text-white">{(scan as any).threads || '8'}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Scan Started:</span> <span className="font-mono text-white">{parsed.startTimeFormatted}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Scan Completed:</span> <span className="font-mono text-white">{parsed.endTimeFormatted}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Total Duration:</span> <span className="font-mono text-[#3b82f6] font-bold">{parsed.durationFormatted}</span></div>
          </div>
        </div>
      </div>

      {/* Scan Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Ports Scanned', value: parsed.portsScannedCount, color: '#3b82f6' },
          { label: 'Open Ports', value: parsed.openPortsCount, color: parsed.openPortsCount > 0 ? '#eab308' : '#22c55e' },
          { label: 'Closed Ports', value: parsed.closedPortsCount, color: '#64748b' },
          { label: 'Filtered Ports', value: parsed.filteredPortsCount, color: '#64748b' },
          { label: 'Services Detected', value: new Set(parsed.ports.map(p => p.service)).size, color: '#a855f7' },
          { label: 'CVEs Found', value: parsed.cves.length, color: parsed.cves.length > 0 ? '#ef4444' : '#22c55e' },
          { label: 'Highest CVSS', value: parsed.highestCvss.toFixed(1), color: parsed.highestCvss >= 7 ? '#ef4444' : parsed.highestCvss >= 4 ? '#eab308' : '#22c55e' },
          { label: 'Risk Rating', value: parsed.riskLevel, color: parsed.riskLevel === 'High' ? '#ef4444' : parsed.riskLevel === 'Medium' ? '#eab308' : '#22c55e' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#161b27] border border-[#21293a] rounded p-3 text-center">
            <div className="text-[10px] font-semibold tracking-wider text-[#475569] uppercase">{stat.label}</div>
            <div className="text-xl font-bold font-mono mt-1" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Port Details Table */}
      <div className="space-y-3">
        <h5 className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-[#21293a] pb-1 font-mono flex items-center gap-2">
          <Network size={14} className="text-[#3b82f6]" /> Port & Handshake Details
        </h5>
        {parsed.ports.length > 0 ? (
          <div className="overflow-x-auto border border-[#21293a] rounded">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-[#0d1117] border-b border-[#21293a] text-[#475569] uppercase font-bold tracking-[0.08em] text-[9px]">
                  <th className="py-2 px-3">Port</th>
                  <th className="py-2 px-3">Service</th>
                  <th className="py-2 px-3">Version</th>
                  <th className="py-2 px-3">Banner Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21293a] font-mono">
                {parsed.ports.map((port, idx) => (
                  <tr key={idx} className="hover:bg-[#21293a]/10">
                    <td className="py-2 px-3 font-semibold text-white">{port.port}</td>
                    <td className="py-2 px-3 text-[#cbd5e1]">{port.service}</td>
                    <td className="py-2 px-3">{port.version}</td>
                    <td className="py-2 px-3 text-[#64748b] text-[10px] break-all truncate max-w-[200px]" title={port.banner}>{port.banner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#161b27] border border-[#21293a] rounded p-4 text-center text-xs text-[#475569] font-mono">
            No open ports were detected on the target.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 text-left">
        {/* Vulnerability Intelligence */}
        <div className="space-y-3">
          <h5 className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-[#21293a] pb-1 font-mono flex items-center gap-2">
            <ShieldAlert size={14} className="text-[#ef4444]" /> Vulnerability Intelligence
          </h5>
          {parsed.cves.length > 0 ? (
            <div className="space-y-3">
              {parsed.cves.map((cve) => (
                <div key={cve.id} className="bg-[#161b27] border border-[#21293a] rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#ef4444] hover:underline cursor-pointer" onClick={() => {
                        setIntelQuery(cve.id);
                        setIntelType('CVE');
                        setActiveTab('dashboard');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>{cve.id}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#ef4444]/10 border border-[#ef4444]/20 font-mono text-[9px] text-[#ef4444] font-bold">
                      CVSS {cve.cvss}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                    {cve.description}
                  </p>
                  <div className="pt-2 border-t border-[#21293a] flex flex-col gap-1.5 text-[10px] font-mono">
                    <div className="flex justify-between items-center text-[#64748b]">
                      <span>Published: {cve.publishedDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#475569]">MITRE ATT&CK:</span>
                      <span className="text-[#3b82f6] font-semibold text-right max-w-[200px] break-words leading-tight">{cve.mitreTechnique}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {cve.references.slice(0, 2).map((ref, idx) => (
                        <a key={idx} href={ref} target="_blank" rel="noreferrer" className="text-[#3b82f6] hover:underline truncate max-w-[150px]">Ref {idx + 1}</a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#161b27] border border-[#21293a] rounded p-4 text-center text-xs text-[#475569] font-mono">
              No vulnerabilities (CVEs) or active threat intelligence signatures mapped.
            </div>
          )}
        </div>

        {/* Security Recommendations */}
        <div className="space-y-3">
          <h5 className="text-[10px] font-bold text-white uppercase tracking-wider border-b border-[#21293a] pb-1 font-mono flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#22c55e]" /> Actionable Recommendations
          </h5>
          <div className="bg-[#161b27] border border-[#21293a] rounded p-4">
            {parsed.recommendations.length > 0 ? (
              <ul className="list-none space-y-3">
                {parsed.recommendations.map((rec, i) => {
                  const parts = rec.split(':');
                  const isTitle = parts.length > 1 && !rec.startsWith('Enforce') && !rec.startsWith('Regular');
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#cbd5e1]">
                      <div className="mt-0.5 text-[#3b82f6]">
                        <ArrowRight size={12} />
                      </div>
                      <div>
                        {isTitle ? (
                          <>
                            <strong className="text-white block mb-0.5">{parts[0]}:</strong>
                            <span className="text-[#94a3b8]">{parts.slice(1).join(':')}</span>
                          </>
                        ) : (
                          <span className="text-[#94a3b8]">{rec}</span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-center text-xs text-[#475569] font-mono">
                No immediate actionable recommendations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border text-xs font-semibold shadow-lg transition-all duration-300 animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]' 
            : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
        }`}>
          <ShieldAlert size={14} className={toast.type === 'success' ? 'text-[#22c55e]' : 'text-[#ef4444]'} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 4 Stats Cards in Row (Always visible in general header view or dashboard) */}
      {(activeTab === 'dashboard' || activeTab === 'history') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderStatCard(
            'Total Scans', 
            totalScans, 
            'Initiated logs', 
            totalScans > 0 ? 'text-[#22c55e]' : 'text-[#eab308]'
          )}
          {renderStatCard(
            'Open Ports Found', 
            totalOpenPorts, 
            'Active listening nodes', 
            totalOpenPorts > 5 ? 'text-[#ef4444]' : totalOpenPorts > 0 ? 'text-[#eab308]' : 'text-[#22c55e]'
          )}
          {renderStatCard(
            'CVEs Detected', 
            totalCVEs, 
            'Known vulnerabilities', 
            totalCVEs > 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'
          )}
          {renderStatCard(
            'Last Risk Score', 
            `${lastRiskScore}/10.0`, 
            `${lastRiskLevel} Risk`, 
            lastRiskLevel === 'High' ? 'text-[#ef4444]' : lastRiskLevel === 'Medium' ? 'text-[#eab308]' : 'text-[#22c55e]'
          )}
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <>
          {/* Dual Forms - Network Scanner & Threat Intel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Network Scanner Form */}
            <div className="bg-[#161b27] border border-[#21293a] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4 border-b border-[#21293a] pb-2">
                <h3 className="text-xs font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                  <Play className="text-[#3b82f6]" size={14} /> Safe Network Scanner
                </h3>
                <span className="text-[10px] text-[#94a3b8] flex items-center gap-1">
                  <Server size={10} /> Simulator mode
                </span>
              </div>
              <form onSubmit={handleScanSubmit} className="space-y-4">
                {scanError && (
                  <div className="rounded border border-[#dc2626] bg-[#7f1d1d]/10 p-3 text-[11px] text-[#fecaca]">
                    {scanError}
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-1">Target Address / IP</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 192.168.1.105 or safehost.local"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="flex-1 bg-[#0d1117] border border-[#21293a] rounded px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] placeholder-[#475569] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setTarget('')}
                      className="text-[10px] px-2 py-1 bg-[#0b1220] border border-[#21293a] rounded text-[#94a3b8] hover:bg-[#111827]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-1">Port Range</label>
                    <select
                      value={portRange}
                      onChange={(e) => setPortRange(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#21293a] rounded px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] transition-all"
                    >
                      <option value="1-1024">Default (1-1024)</option>
                      <option value="1-65535">All Ports (1-65535)</option>
                      <option value="common">Common Ports (21,22,80,443,8080)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-1">Scan Threads</label>
                    <select
                      value={threads}
                      onChange={(e) => setThreads(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#21293a] rounded px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] transition-all"
                    >
                      <option value="4">4 Threads</option>
                      <option value="8">8 Threads (Rec.)</option>
                      <option value="16">16 Threads</option>
                      <option value="32">32 Threads</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#21293a] space-y-3">
                  <span className="block text-[10px] font-semibold text-[#475569] uppercase tracking-wider">Advanced Profile Rules</span>
                  
                  <label className="flex items-center gap-2 text-xs text-[#94a3b8] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pingDiscovery}
                      onChange={(e) => setPingDiscovery(e.target.checked)}
                      className="rounded bg-[#0d1117] border-[#21293a] text-[#3b82f6] focus:ring-0"
                    />
                    <span>Ping Host Discovery (ICMP Echo request) before scanning</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-[#94a3b8] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aggressiveMode}
                      onChange={(e) => setAggressiveMode(e.target.checked)}
                      className="rounded bg-[#0d1117] border-[#21293a] text-[#3b82f6] focus:ring-0"
                    />
                    <span>Aggressive Version Detection (-sV -O OS fingerprinting)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || (activeScan?.status === 'scanning')}
                  className="w-full bg-[#d97706] hover:bg-[#d97706]/90 disabled:opacity-80 text-white font-semibold py-2 rounded text-xs transition duration-150 flex items-center justify-center gap-1.5"
                >
                  {(loading || (activeScan?.status === 'scanning')) ? (
                    <>
                      <RotateCw size={12} className="animate-spin" /> Scanning...
                    </>
                  ) : (
                    <>
                      <Play size={12} /> Start Recon Scan
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Card: Threat Intel Form */}
            <div className="bg-[#161b27] border border-[#21293a] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4 border-b border-[#21293a] pb-2">
                <h3 className="text-xs font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-2">
                  <ShieldAlert className="text-[#eab308]" size={14} /> Threat Intel Analyzer
                </h3>
                <span className="text-[10px] text-[#94a3b8] flex items-center gap-1">
                  <Globe size={10} /> Global Feed Stub
                </span>
              </div>
              <form onSubmit={handleIntelSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-1">Lookup Query</label>
                    <input
                      type="text"
                      required
                      placeholder={intelType === 'CVE' ? 'e.g. CVE-2021-40438' : intelType === 'IP' ? 'e.g. 8.8.8.8 or 1.1.1.1' : 'e.g. google.com or example.org'}
                      value={intelQuery}
                      onChange={(e) => setIntelQuery(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#21293a] rounded px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] placeholder-[#475569] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-1">Type</label>
                    <select
                      value={intelType}
                      onChange={(e) => {
                        setIntelType(e.target.value);
                        setIntelValidationError('');
                      }}
                      className="w-full bg-[#0d1117] border border-[#21293a] rounded px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] transition-all"
                    >
                      <option value="CVE">CVE</option>
                      <option value="Domain">Domain</option>
                      <option value="IP">IP</option>
                    </select>
                  </div>
                </div>
                {intelValidationError && (
                  <div className="text-[10px] text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded p-2">
                    {intelValidationError}
                  </div>
                )}
                <div className="text-[10px] text-[#94a3b8] bg-[#0d1117] border border-[#21293a] rounded p-2 font-mono h-[34px] overflow-hidden flex items-center justify-between">
                  <span>
                    Data Source:{' '}
                    {intelType === 'CVE' && 'National Vulnerability Database (NVD)'}
                    {intelType === 'IP' && 'AbuseIPDB + IPInfo'}
                    {intelType === 'Domain' && 'WHOIS + DNS Lookup + VirusTotal'}
                  </span>
                  <span className="text-[#3b82f6]">Connection: Secure HTTPS</span>
                </div>
                <button
                  type="submit"
                  disabled={intelLoading}
                  className="w-full bg-[#d97706] hover:bg-[#d97706]/90 disabled:bg-[#21293a] text-white font-semibold py-2 rounded text-xs transition duration-150 flex items-center justify-center gap-1.5"
                >
                  {intelLoading ? (
                    <>
                      <RotateCw size={12} className="animate-spin" /> Querying Feeds...
                    </>
                  ) : (
                    <>
                      <Search size={12} /> Analyze Threat Intel
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Threat Intel Result Panel */}
          {intelResult && (
            <div className="bg-[#161b27] border border-[#21293a] rounded-lg p-5 animate-fadeIn">
              <div className="flex items-center justify-between mb-3 border-b border-[#21293a] pb-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                  <Globe className="text-[#3b82f6]" size={14} /> Intel Analysis for {intelResult.query} ({intelResult.intelligence_type})
                </h4>
                <button 
                  onClick={() => setIntelResult(null)}
                  className="text-[10px] text-[#94a3b8] hover:text-[#f1f5f9]"
                >
                  Clear Results
                </button>
              </div>
              <div className="bg-[#0d1117] p-4 rounded border border-[#21293a] font-mono text-[11px] text-[#94a3b8] whitespace-pre-line leading-relaxed">
                {intelResult.summary}
              </div>
            </div>
          )}

          {/* Active Scan Results Output (Structured layout) */}
          {activeScan ? (
            <div className="bg-[#161b27] border border-[#21293a] rounded-lg overflow-hidden">
              {/* Header section */}
              <div className="p-4 bg-[#161b27] border-b border-[#21293a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold tracking-wider text-[#475569] uppercase">Active Scan Results:</span>
                  <span className="text-xs font-bold text-[#f1f5f9] font-mono">{activeScan.target}</span>
                  {activeScan.status === 'scanning' ? (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] animate-pulse">
                      SCANNING HOST...
                    </span>
                  ) : activeScan.status === 'completed' && enrichedActiveScan ? (
                    enrichedActiveScan.riskLevel === 'Unknown' ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#64748b]/10 border border-[#64748b]/30 text-[#64748b]">
                        NOT ASSESSED
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${enrichedActiveScan?.riskColor}`}>
                        {enrichedActiveScan?.riskLevel} RISK TARGET
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444]">
                      FAILED
                    </span>
                  )}
                </div>

                {activeScan.status === 'completed' && enrichedActiveScan && (
                  <div className="flex items-center gap-3 text-[11px] text-[#94a3b8]">
                    <span>Open Ports: <strong className="text-white">{enrichedActiveScan.openPortsCount}</strong></span>
                    <span className="text-[#21293a]">|</span>
                    <span>Duration: <strong className="text-white">{enrichedActiveScan.durationFormatted}</strong></span>
                    <span className="text-[#21293a]">|</span>
                    <a
                      href={`/api/reports/generate/${activeScan.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#3b82f6] hover:underline flex items-center gap-1"
                    >
                      <FileText size={12} /> PDF Report
                    </a>
                  </div>
                )}
              </div>

              {/* Body Section */}
              <div className="p-4 space-y-5">
                {activeScan.status === 'scanning' ? (
                  <ScanLoadingUI target={activeScan.target} />
                ) : activeScan.status === 'completed' && enrichedActiveScan ? (
                  <>
                    {/* HOST UNREACHABLE PANEL — shown when no open ports and host is offline */}
                    {!enrichedActiveScan.hostReachable && enrichedActiveScan.openPortsCount === 0 ? (
                      <div className="rounded-lg border border-[#334155]/60 bg-[#0d1117] overflow-hidden">
                        {/* Panel header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e293b] bg-[#0f172a]">
                          <div className="w-9 h-9 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                            <WifiOff size={16} className="text-[#ef4444]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#f1f5f9] tracking-wide">Host Unreachable / Offline</p>
                            <p className="text-[11px] text-[#64748b] mt-0.5">No active services or open ports detected on this target</p>
                          </div>
                          <span className="ml-auto px-2.5 py-1 rounded text-[10px] font-bold tracking-widest bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] uppercase">Unreachable</span>
                        </div>

                        {/* Status grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[#1e293b]">
                          {[
                            { label: 'Target', value: enrichedActiveScan.target, icon: <Server size={11} />, color: '#94a3b8' },
                            { label: 'Host Discovery', value: 'Failed', icon: <XCircle size={11} />, color: '#ef4444' },
                            { label: 'Open Ports', value: '0', icon: <Network size={11} />, color: '#64748b' },
                            { label: 'Services', value: '0', icon: <Globe size={11} />, color: '#64748b' },
                            { label: 'Vulnerabilities', value: '0', icon: <ShieldAlert size={11} />, color: '#22c55e' },
                            { label: 'Risk Score', value: 'N/A', icon: <Info size={11} />, color: '#64748b' },
                          ].map(({ label, value, icon, color }) => (
                            <div key={label} className="bg-[#0d1117] px-4 py-3 flex flex-col gap-1">
                              <div className="flex items-center gap-1.5" style={{ color }}>
                                {icon}
                                <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#475569' }}>{label}</span>
                              </div>
                              <span className="text-[13px] font-bold font-mono" style={{ color }}>{value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Ping details row */}
                        <div className="px-5 py-3 border-t border-[#1e293b] flex flex-wrap items-center gap-4 text-[11px] text-[#475569] bg-[#0a0f1a]">
                          <span className="flex items-center gap-1.5">
                            <Clock size={11} className="text-[#334155]" />
                            <span>Scan Duration:</span>
                            <strong className="text-[#94a3b8]">{enrichedActiveScan.duration}</strong>
                          </span>
                          {enrichedActiveScan.pingInfo && (
                            <>
                              <span className="text-[#1e293b]">|</span>
                              <span className="flex items-center gap-1.5">
                                <span>ICMP Probe:</span>
                                <strong className="text-[#ef4444]">No Response</strong>
                              </span>
                              <span className="text-[#1e293b]">|</span>
                              <span className="flex items-center gap-1.5">
                                <span>Packet Loss:</span>
                                <strong className="text-[#ef4444]">{enrichedActiveScan.pingInfo.packet_loss !== undefined ? `${(enrichedActiveScan.pingInfo.packet_loss * 100).toFixed(0)}%` : '100%'}</strong>
                              </span>
                            </>
                          )}
                        </div>

                        {/* Warning message */}
                        <div className="mx-5 my-4 flex items-start gap-3 rounded border border-[#eab308]/20 bg-[#eab308]/5 px-4 py-3">
                          <AlertTriangle size={14} className="text-[#eab308] flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-[#eab308]">No active host or open services were detected on the target.</p>
                            <p className="text-[11px] text-[#64748b] leading-relaxed">
                              The target did not respond to ICMP/TCP probes or all scanned ports are filtered/closed.
                            </p>
                          </div>
                        </div>

                        {/* Suggestions */}
                        <div className="px-5 pb-5">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#475569] mb-2">Troubleshooting Suggestions</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                              'Verify the IP address or hostname is correct.',
                              'Check your internet or local network connectivity.',
                              'Ensure the target host is powered on and online.',
                              'Try scanning a different port range (e.g. Common Ports).',
                              'ICMP (ping) may be blocked by a host-based firewall.',
                              'The host may be behind a NAT or strict firewall policy.',
                            ].map((tip, i) => (
                              <div key={i} className="flex items-start gap-2 text-[11px] text-[#64748b]">
                                <CheckCircle2 size={11} className="text-[#334155] flex-shrink-0 mt-0.5" />
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {renderDetailedReport(activeScan, enrichedActiveScan)}
                      </>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center text-xs text-[#475569]">
                    Select a completed scan from history or run a new scan to view the structural findings log.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#161b27] border border-[#21293a] rounded-lg p-8 text-center">
              <AlertTriangle className="text-[#eab308] mx-auto mb-2" size={24} />
              <p className="text-xs text-[#94a3b8]">No active scan loaded. Input a target above to start scanning.</p>
            </div>
          )}
        </>
      )}

      {/* SCAN TAB REMOVED (Migrated to Dashboard) */}

      {/* HISTORY LOGS TAB */}
      {activeTab === 'history' && (
        <div className="bg-[#161b27] border border-[#21293a] rounded-lg overflow-hidden">
          <div className="p-4 border-b border-[#21293a] flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Reconnaissance History Log</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClearHistory}
                disabled={scans.length === 0}
                className="px-2.5 py-1 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded text-[11px] font-semibold text-[#ef4444] hover:bg-[#ef4444]/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1"
              >
                Clear History
              </button>
              <button 
                onClick={refreshScans}
                className="p-1 border border-[#21293a] hover:bg-[#21293a] rounded text-[#94a3b8] hover:text-white transition-all"
              >
                <RotateCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {scans.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#475569]">
                No scans executed yet. Use the scan portal to start reconnaissance.
              </div>
            ) : (
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[#0d1117] border-b border-[#21293a] text-[#475569] uppercase font-bold tracking-[0.08em] text-[10px]">
                    <th className="py-2.5 px-4">ID</th>
                    <th className="py-2.5 px-4">Target Host</th>
                    <th className="py-2.5 px-4">Scan Date</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21293a]">
                  {scans.map((scan) => {
                    const parsed = parseScan(scan);
                    const riskBadge = parsed ? (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${parsed.riskColor}`}>
                        {parsed.riskLevel}
                      </span>
                    ) : null;

                    return (
                      <React.Fragment key={scan.id}>
                        <tr className="hover:bg-[#21293a]/10 transition-colors">
                          <td className="py-3 px-4 font-mono text-[#475569]">#{scan.id}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white font-mono">{scan.target}</span>
                              {riskBadge}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#94a3b8] font-mono">
                            {parsed?.startTimeFormatted || new Date(scan.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              scan.status === 'completed' ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20' :
                              scan.status === 'scanning' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20 animate-pulse' :
                              'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20'
                            }`}>
                              {scan.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleAnalyzeClick(scan.id)}
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-all ${
                                  expandedScanId === scan.id 
                                    ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/20' 
                                    : 'bg-[#21293a] border-[#21293a] hover:border-[#3b82f6]/30 text-[#f1f5f9] hover:text-[#3b82f6]'
                                }`}
                              >
                                {expandedScanId === scan.id ? 'Close Panel' : 'Analyze Findings'}
                              </button>
                              {scan.status === 'completed' && (
                                <a
                                  href={`/api/reports/generate/${scan.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 border border-[#21293a] hover:border-[#3b82f6]/30 hover:bg-[#3b82f6]/5 text-[#94a3b8] hover:text-[#3b82f6] rounded transition-all"
                                  title="Download PDF Report"
                                >
                                  <FileText size={14} />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                        {/* Collapsible Accordion Row */}
                        <tr className="border-none">
                          <td colSpan={5} className="p-0 border-none">
                            <div 
                              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                expandedScanId === scan.id 
                                  ? 'max-h-[1500px] border-b border-[#21293a] p-5 bg-[#0e1320] opacity-100' 
                                  : 'max-h-0 p-0 opacity-0 pointer-events-none'
                              }`}
                            >
                              {/* Expanded panel details */}
                              {scan.status === 'completed' && parsed ? (
                                <div className="space-y-4">
                                  <div className="border-b border-[#21293a] pb-3 flex flex-wrap items-center justify-between gap-3 text-left">
                                    <div>
                                      <span className="text-[9px] font-semibold tracking-wider text-[#475569] uppercase font-mono">SOC ASSESSMENT REPORT</span>
                                      <h4 className="text-sm font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                                        Target Node: {scan.target}
                                      </h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={`/api/reports/generate/${scan.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#3b82f6] hover:underline flex items-center gap-1 text-[11px]"
                                      >
                                        <FileText size={12} /> Download PDF
                                      </a>
                                    </div>
                                  </div>
                                  {renderDetailedReport(scan, parsed)}
                                </div>
                              ) : scan.status === 'scanning' ? (
                                <div className="py-6 flex flex-col items-center justify-center gap-3">
                                  <RotateCw className="text-[#3b82f6] animate-spin" size={24} />
                                  <div className="text-center font-mono">
                                    <p className="text-xs text-white">Target host is currently scanning...</p>
                                    <p className="text-[10px] text-[#475569] mt-1">Stage: {scan.results?.stage || 'initializing'} ({scan.results?.progress ?? 0}%)</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="py-6 text-center text-xs text-[#ef4444] font-mono">
                                  Threat assessment failed. Scan was aborted or target address did not respond to discover scripts.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CVE LOOKUP TAB REMOVED (Migrated to Dashboard) */}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-[#161b27] border border-[#21293a] rounded-lg p-5 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="text-[#3b82f6]" size={14} /> Security Reports Repository
              </h3>
              <p className="text-[11px] text-[#94a3b8] mt-1">Compile and export network reconnaissance audits in PDF layout.</p>
            </div>
            <button 
              onClick={refreshScans}
              className="bg-[#21293a] hover:bg-[#21293a]/80 text-white font-semibold py-1.5 px-3 rounded text-[11px] border border-[#21293a]"
            >
              Re-scan Files
            </button>
          </div>

          <div className="bg-[#161b27] border border-[#21293a] rounded-lg overflow-hidden">
            <div className="p-4 bg-[#0d1117] border-b border-[#21293a] text-[10px] font-semibold text-[#475569] uppercase tracking-wider">
              Available Audits
            </div>
            {scans.filter(s => s.status === 'completed').length === 0 ? (
              <div className="p-12 text-center text-xs text-[#475569]">
                No completed scans available to generate PDF reports.
              </div>
            ) : (
              <div className="divide-y divide-[#21293a]">
                {scans.filter(s => s.status === 'completed').map((scan) => {
                  const parsed = parseScan(scan);
                  return (
                    <div key={scan.id} className="p-4 flex items-center justify-between hover:bg-[#21293a]/10 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white font-mono">{scan.target}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${parsed?.riskColor}`}>
                            {parsed?.riskLevel} RISK
                          </span>
                        </div>
                        <p className="text-[10px] text-[#475569] font-mono">
                          Generated: {new Date(scan.created_at).toLocaleString()} | Open Ports: {parsed?.openPortsCount}
                        </p>
                      </div>
                      <a
                        href={`/api/reports/generate/${scan.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white font-semibold py-1.5 px-3 rounded text-[11px] flex items-center gap-1.5 transition duration-150"
                      >
                        <Download size={12} /> Export PDF Report
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NETWORK MAP TAB */}
      {activeTab === 'map' && (
        <div className="bg-[#161b27] border border-[#21293a] rounded-lg p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-[#21293a] pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Network className="text-[#3b82f6]" size={14} /> Network Host Topology Map
              </h3>
              <p className="text-[11px] text-[#94a3b8] mt-1">Visual node clustering of scanning interfaces and subnets.</p>
            </div>
            <span className="text-[10px] text-[#475569] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" /> Real-time Nodes
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Interactive SVG Canvas */}
            <div className="lg:col-span-3 bg-[#0d1117] border border-[#21293a] rounded-lg h-[400px] relative overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 600 400">
                {/* Connection lines */}
                <line x1="300" y1="200" x2="150" y2="120" stroke="#21293a" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                <line x1="300" y1="200" x2="150" y2="280" stroke="#21293a" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                <line x1="300" y1="200" x2="450" y2="120" stroke="#21293a" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                <line x1="300" y1="200" x2="450" y2="280" stroke="#21293a" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />

                {/* Central Server Node */}
                <g 
                  className="cursor-pointer group"
                  onClick={() => setSelectedMapNode('scanner')}
                >
                  <circle cx="300" cy="200" r="28" fill="#161b27" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="300" cy="200" r="32" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" className="animate-spin" style={{ transformOrigin: '300px 200px', animationDuration: '10s' }} />
                  <text x="300" y="238" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="bold" fontFamily="monospace">RECON CONSOLE</text>
                  <text x="300" y="248" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">192.168.1.50</text>
                  <circle cx="300" cy="200" r="4" fill="#22c55e" />
                </g>

                {/* Target Nodes */}
                {/* Node 1: Router/Firewall */}
                <g 
                  className="cursor-pointer"
                  onClick={() => setSelectedMapNode('192.168.1.1')}
                >
                  <circle cx="150" cy="120" r="20" fill="#161b27" stroke={selectedMapNode === '192.168.1.1' ? '#3b82f6' : '#21293a'} strokeWidth="2" />
                  <circle cx="150" cy="120" r="4" fill="#eab308" />
                  <text x="150" y="152" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="bold" fontFamily="monospace">192.168.1.1</text>
                  <text x="150" y="161" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">Gate/Router</text>
                </g>

                {/* Node 2: Dev Server */}
                <g 
                  className="cursor-pointer"
                  onClick={() => setSelectedMapNode('192.168.1.105')}
                >
                  <circle cx="150" cy="280" r="20" fill="#161b27" stroke={selectedMapNode === '192.168.1.105' ? '#3b82f6' : '#21293a'} strokeWidth="2" />
                  <circle cx="150" cy="280" r="4" fill="#ef4444" />
                  <text x="150" y="312" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="bold" fontFamily="monospace">192.168.1.105</text>
                  <text x="150" y="321" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">Dev-Proxy</text>
                </g>

                {/* Node 3: External Domain Web */}
                <g 
                  className="cursor-pointer"
                  onClick={() => setSelectedMapNode('example.com')}
                >
                  <circle cx="450" cy="120" r="20" fill="#161b27" stroke={selectedMapNode === 'example.com' ? '#3b82f6' : '#21293a'} strokeWidth="2" />
                  <circle cx="450" cy="120" r="4" fill="#22c55e" />
                  <text x="450" y="152" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="bold" fontFamily="monospace">example.com</text>
                  <text x="450" y="161" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">Web Target</text>
                </g>

                {/* Node 4: Isolated Subnet Node */}
                <g 
                  className="cursor-pointer"
                  onClick={() => setSelectedMapNode('192.168.1.200')}
                >
                  <circle cx="450" cy="280" r="20" fill="#161b27" stroke={selectedMapNode === '192.168.1.200' ? '#3b82f6' : '#21293a'} strokeWidth="2" />
                  <circle cx="450" cy="280" r="4" fill="#22c55e" />
                  <text x="450" y="312" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="bold" fontFamily="monospace">192.168.1.200</text>
                  <text x="450" y="321" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">Workstation</text>
                </g>
              </svg>

              <div className="absolute bottom-3 left-3 bg-[#161b27]/85 border border-[#21293a] rounded p-2 text-[9px] font-mono text-[#94a3b8] space-y-1">
                <span className="block font-bold text-white">LEGEND</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> High Risk Node</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" /> Med Risk Node</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /> Clean Node</span>
              </div>
            </div>

            {/* Sidebar Details Drawer */}
            <div className="bg-[#0d1117] border border-[#21293a] rounded-lg p-4 flex flex-col justify-between">
              {selectedMapNode ? (
                <div className="space-y-4">
                  <div className="border-b border-[#21293a] pb-2">
                    <span className="text-[9px] font-semibold text-[#475569] uppercase">Node Details</span>
                    <h4 className="text-xs font-bold text-white font-mono mt-0.5">{selectedMapNode}</h4>
                  </div>

                  {selectedMapNode === 'scanner' ? (
                    <div className="space-y-2 text-[11px] text-[#94a3b8]">
                      <p>Running scanning agent local interface.</p>
                      <p><strong>Subnet scope:</strong> 192.168.1.0/24</p>
                      <p><strong>Status:</strong> Listening</p>
                    </div>
                  ) : selectedMapNode === '192.168.1.1' ? (
                    <div className="space-y-3 text-[11px] text-[#94a3b8]">
                      <p>Subnet default gateway interface.</p>
                      <div className="space-y-1 font-mono text-[10px] bg-[#161b27] border border-[#21293a] p-2 rounded">
                        <div className="text-white font-bold">Open Ports:</div>
                        <div>- 80/tcp (HTTP) <span className="text-[#eab308]">[Med]</span></div>
                        <div>- 443/tcp (HTTPS) <span className="text-[#22c55e]">[Safe]</span></div>
                      </div>
                      <p className="text-[10px] text-[#eab308]">Vulnerability alert: Apache SSRF threat detected.</p>
                    </div>
                  ) : selectedMapNode === '192.168.1.105' ? (
                    <div className="space-y-3 text-[11px] text-[#94a3b8]">
                      <p>Development proxy client.</p>
                      <div className="space-y-1 font-mono text-[10px] bg-[#161b27] border border-[#21293a] p-2 rounded">
                        <div className="text-white font-bold">Open Ports:</div>
                        <div>- 22/tcp (SSH) <span className="text-[#22c55e]">[Safe]</span></div>
                        <div>- 8080/tcp (HTTP-alt) <span className="text-[#ef4444]">[Critical]</span></div>
                      </div>
                      <p className="text-[10px] text-[#ef4444] font-semibold">Critical Threat: Squid vulnerability allows complete takeover.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-[11px] text-[#94a3b8]">
                      <p>Workstation node detected in passive ARP scanning.</p>
                      <p><strong>Open Ports:</strong> None detected</p>
                      <p className="text-[#22c55e]">Risk Level: Clean</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-4">
                  <span className="text-[11px] text-[#475569]">Click any topological node in the canvas grid to inspect threat logs.</span>
                </div>
              )}

              {selectedMapNode && selectedMapNode !== 'scanner' && (
                <button
                  onClick={() => {
                    setTarget(selectedMapNode);
                    setActiveTab('dashboard');
                  }}
                  className="w-full mt-4 bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white font-semibold py-1.5 rounded text-[11px] transition duration-150"
                >
                  Configure Target Scan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI ASSISTANT TAB */}
      {activeTab === 'assistant' && (
        <div className="bg-[#161b27] border border-[#21293a] rounded-lg max-w-4xl mx-auto h-[480px] flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-[#21293a] bg-[#161b27] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6]">
                <Bot size={13} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Copilot Threat Assistant</h3>
                <span className="text-[9px] text-[#22c55e] flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-[#22c55e] inline-block" /> Active scanning context loaded</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setChatMessages([
                  { 
                    sender: 'assistant', 
                    text: 'Chat history cleared. How can I help you secure your hosts?', 
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  }
                ]);
              }}
              className="text-[9px] text-[#475569] hover:text-[#94a3b8] transition-all font-mono"
            >
              Clear Chat
            </button>
          </div>

          {/* Chat Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1117]">
            {chatMessages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={index} className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : ''}`}>
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] flex-shrink-0 mt-0.5">
                      <Bot size={12} />
                    </div>
                  )}
                  <div className={`
                    max-w-[75%] rounded-lg p-3 text-[11px] leading-relaxed
                    ${isUser 
                      ? 'bg-[#3b82f6] text-white rounded-tr-none' 
                      : 'bg-[#161b27] border border-[#21293a] text-[#94a3b8] rounded-tl-none'}
                  `}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[8px] text-[#475569] mt-1.5 text-right font-mono">{msg.time}</span>
                  </div>
                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-[#21293a] border border-[#21293a] flex items-center justify-center text-[#f1f5f9] flex-shrink-0 mt-0.5 font-bold text-[9px] uppercase font-mono">
                      US
                    </div>
                  )}
                </div>
              );
            })}

            {aiTyping && (
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] flex-shrink-0 mt-0.5">
                  <Bot size={12} />
                </div>
                <div className="bg-[#161b27] border border-[#21293a] rounded-lg rounded-tl-none p-3 text-[11px] text-[#475569] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#94a3b8] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Tag List */}
          <div className="p-2 border-t border-[#21293a] bg-[#161b27] flex gap-1.5 overflow-x-auto flex-shrink-0 scrollbar-none">
            <button 
              onClick={() => setAiInput('Explain Apache CVE-2021-40438 risk')}
              className="px-2 py-0.5 rounded-full bg-[#0d1117] border border-[#21293a] hover:border-[#3b82f6]/40 text-[#94a3b8] hover:text-white text-[9px] font-mono whitespace-nowrap transition-all"
            >
              Analyze Apache CVE
            </button>
            <button 
              onClick={() => setAiInput('Explain Squid CVE-2023-45897 risk')}
              className="px-2 py-0.5 rounded-full bg-[#0d1117] border border-[#21293a] hover:border-[#3b82f6]/40 text-[#94a3b8] hover:text-white text-[9px] font-mono whitespace-nowrap transition-all"
            >
              Analyze Squid RCE
            </button>
            <button 
              onClick={() => setAiInput('Suggest general mitigation configurations')}
              className="px-2 py-0.5 rounded-full bg-[#0d1117] border border-[#21293a] hover:border-[#3b82f6]/40 text-[#94a3b8] hover:text-white text-[9px] font-mono whitespace-nowrap transition-all"
            >
              General Mitigations
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleAiSubmit} className="p-3 border-t border-[#21293a] bg-[#161b27] flex gap-2 flex-shrink-0">
            <input
              type="text"
              required
              placeholder="Ask for vulnerability patch instructions..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="flex-1 bg-[#0d1117] border border-[#21293a] rounded px-3 py-2 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] placeholder-[#475569]"
            />
            <button
              type="submit"
              disabled={aiTyping}
              className="bg-[#3b82f6] hover:bg-[#3b82f6]/90 disabled:bg-[#21293a] text-white p-2 rounded transition duration-150 flex items-center justify-center"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
