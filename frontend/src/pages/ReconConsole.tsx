import React, { useState, useEffect, useRef } from 'react';
import { 
  Play,
  RotateCw,
  FileText, 
  Server,
  Network,
  WifiOff,
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Target
} from 'lucide-react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ScanResult } from '../types';
import PageHeader from '../components/PageHeader';

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

interface EnrichedOSDetection {
  detected: boolean;
  osName: string;
  vendor: string;
  deviceType: string;
  accuracy: number;
  cpe: string;
  message?: string;
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
  mitreMappings: any[];
  osDetection: EnrichedOSDetection | null;
}

const ScanLoadingUI = ({ target, currentScan }: { target: string, currentScan: any }) => {
  const backendProgress = currentScan?.results?.progress || 0;
  const stage = currentScan?.results?.stage ? currentScan.results.stage.replace('_', ' ').toUpperCase() : 'INITIALIZING SCAN';

  const [displayProgress, setDisplayProgress] = React.useState(0);

  React.useEffect(() => {
    if (backendProgress >= 100) {
      setDisplayProgress(100);
      return;
    }
    
    // Jump to 1% immediately so it never feels stuck on 0
    if (displayProgress === 0) {
      setDisplayProgress(1);
    }
    
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        // Fast catch up if backend is ahead
        if (prev < backendProgress) {
          return prev + Math.max(1, Math.floor((backendProgress - prev) / 4));
        }
        // Smooth creeping animation up to 99%
        if (prev < 99) {
          // Slow down the creeping as it gets higher
          const chance = prev > 80 ? 0.2 : prev > 50 ? 0.5 : 0.8;
          if (Math.random() < chance) {
            return prev + 1;
          }
        }
        return prev;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [backendProgress]);

  return (
    <div className="py-20 flex flex-col items-center justify-center min-h-[500px] w-full bg-[#161b27] rounded-xl border border-[#21293a]">
      <div className="relative flex items-center justify-center mb-14 mt-8 scale-125">
        <div className="absolute w-40 h-40 rounded-full border border-[#3b82f6]/20 animate-ping"></div>
        <div className="absolute w-32 h-32 rounded-full border-t-2 border-[#3b82f6] animate-spin"></div>
        <div className="absolute w-24 h-24 rounded-full border-b-2 border-[#a855f7] animate-[spin_1.5s_linear_reverse_infinite]"></div>
        <div className="absolute w-16 h-16 rounded-full border-l-2 border-[#6366f1] animate-[spin_2s_linear_infinite]"></div>
        <Network size={36} className="text-[#3b82f6] animate-pulse" />
      </div>

      <div className="text-center space-y-6 w-full max-w-lg px-6">
        <p className="text-lg text-[#f1f5f9] font-mono animate-pulse tracking-widest uppercase shadow-[#3b82f6] drop-shadow-md">
          {stage}...
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-[#94a3b8] font-mono px-2">
            <span>Scanning target: <strong className="text-white">{target}</strong></span>
            <span className="text-[#3b82f6] text-lg font-bold">{displayProgress}%</span>
          </div>
          
          <div className="w-full bg-[#0b1220] rounded-full h-3 overflow-hidden border border-[#21293a] relative shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#a855f7] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.6)]"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ReconConsole() {
  const { currentScan, loading, scanError, triggerScan } = useOutletContext<any>();
  const [searchParams] = useSearchParams();
  const [target, setTarget] = useState(searchParams.get('target') || currentScan?.target || '');
  const [portRange, setPortRange] = useState('1-1024');
  const [threads, setThreads] = useState('8');
  const [activeScan, setActiveScan] = useState<ScanResult | null>(null);
  
  const [pingDiscovery, setPingDiscovery] = useState(false);
  const [aggressiveMode, setAggressiveMode] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pingDiscovery || aggressiveMode) {
      setValidationError(false);
    }
  }, [pingDiscovery, aggressiveMode]);

  useEffect(() => {
    const queryTarget = searchParams.get('target');
    if (queryTarget) {
      setTarget(queryTarget);
    }
  }, [searchParams]);

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

  const formatDuration = (sec?: number) => {
    if (sec === undefined || sec === null || sec < 0) return 'N/A';
    return `${sec.toFixed(2)} sec`;
  };

  const parseScan = (scan: ScanResult | null): EnrichedScan | null => {
    if (!scan || !scan.results) return null;
    const results = scan.results;
    
    const duration = results.scan_duration_seconds ? `${results.scan_duration_seconds}s` : '4.8s';
    
    const startTimeFormatted = formatDate(scan.start_time || scan.created_at);
    const endTimeFormatted = formatDate(scan.end_time || scan.created_at);
    const durationFormatted = formatDuration(scan.duration ?? results.scan_duration_seconds ?? 4.8);

    const ports: EnrichedPort[] = [];
    const scanCves: EnrichedCVE[] = [];
    
    let osDetection: EnrichedOSDetection | null = null;

    if (results.hosts && Array.isArray(results.hosts)) {
      results.hosts.forEach((host: any) => {
        if (!osDetection && host.os_detection) {
          osDetection = {
            detected: host.os_detection.detected || false,
            osName: host.os_detection.os_name || 'Unknown OS',
            vendor: host.os_detection.vendor || 'Unknown Vendor',
            deviceType: host.os_detection.device_type || 'Unknown Type',
            accuracy: host.os_detection.accuracy || 0,
            cpe: host.os_detection.cpe || 'N/A',
            message: host.os_detection.message || 'OS fingerprint unavailable'
          };
        }
        if (host.ports && Array.isArray(host.ports)) {
          host.ports.forEach((p: any) => {
            const portNum = Number(p.port);
            const serviceName = (p.service || '').toLowerCase();
            const versionStr = (p.version || '').toLowerCase();

            let portRisk: 'dangerous' | 'medium' | 'safe' = 'safe';
            let portRiskText = 'Safe';
            let portRiskColor = '#22c55e';
            const portCves: string[] = [];

            if (p.cves && Array.isArray(p.cves) && p.cves.length > 0) {
              portRisk = 'dangerous';
              portRiskText = 'Dangerous';
              portRiskColor = '#ef4444';
              p.cves.forEach((cve: any) => {
                if (typeof cve === 'string') {
                  portCves.push(cve);
                  if (!scanCves.some(c => c.id === cve)) {
                    scanCves.push({
                      id: cve,
                      cvss: 7.0, // Default severity if not provided by backend
                      description: 'Vulnerability detected on port.',
                      publishedDate: 'N/A',
                      references: [],
                      mitreTechnique: 'Unknown'
                    });
                  }
                } else if (cve && cve.id) {
                  portCves.push(cve.id);
                  if (!scanCves.some(c => c.id === cve.id)) {
                    scanCves.push(cve);
                  }
                }
              });
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
      mitreMappings: results.mitre_mappings || [],
      osDetection,
    };
  };

  useEffect(() => {
    if (currentScan) {
      setActiveScan(currentScan);
    }
  }, [currentScan]);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    if (!pingDiscovery && !aggressiveMode) {
      setValidationError(true);
      if (optionsRef.current) {
        optionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (portRange === '1-65535') {
      const confirmed = window.confirm(
        'Full-range scans (1-65535) can take significantly longer and may generate heavy traffic. Do you want to continue?'
      );
      if (!confirmed) {
        return;
      }
    }

    const createdScan = await triggerScan({
      target,
      port_range: portRange,
      threads: parseInt(threads, 10) || 8,
      aggressive_detection: aggressiveMode,
      ping_discovery: pingDiscovery,
    });

    if (createdScan) {
      setActiveScan(createdScan);
    }
  };

  const enrichedActiveScan = parseScan(activeScan);

  const renderDetailedReport = (scan: ScanResult, parsed: EnrichedScan) => (
    <div className="space-y-8 text-[#94a3b8] font-sans">
      <div className="bg-[#161b27] border border-[#21293a] rounded-xl p-6 md:p-8 text-left shadow-lg">
        <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">Executive Summary</h5>
        <p className="text-base leading-relaxed text-[#f1f5f9]">
          {parsed.executiveSummary}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#161b27] border border-[#21293a] rounded-xl overflow-hidden shadow-lg">
          <div className="bg-[#0d1117] border-b border-[#21293a] p-4 md:p-6">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Server size={18} className="text-[#3b82f6]" /> Host Information
            </h5>
          </div>
          <div className="p-4 md:p-6 space-y-4 text-sm md:text-base">
            <div className="flex justify-between"><span className="text-[#475569]">Target:</span> <span className="font-mono text-white">{parsed.target}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Resolved IP:</span> <span className="font-mono text-white">{parsed.resolvedIp}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Hostname:</span> <span className="font-mono text-white">{parsed.resolvedHostname}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Host Status:</span> <span className={`font-mono font-semibold ${parsed.hostStatus === 'reachable' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>{parsed.hostStatus === 'reachable' ? 'Online' : 'Offline'}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Reverse DNS:</span> <span className="font-mono text-white">{parsed.reverseDns}</span></div>
          </div>
        </div>

        <div className="bg-[#161b27] border border-[#21293a] rounded-xl overflow-hidden shadow-lg">
          <div className="bg-[#0d1117] border-b border-[#21293a] p-4 md:p-6">
            <h5 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Network size={18} className="text-[#a855f7]" /> Scan Information
            </h5>
          </div>
          <div className="p-4 md:p-6 space-y-4 text-sm md:text-base">
            <div className="flex justify-between"><span className="text-[#475569]">Scan Type:</span> <span className="font-mono text-white">TCP Connect Scan</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Port Range:</span> <span className="font-mono text-white">{(scan as any).port_range || '1-1024'}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Threads Used:</span> <span className="font-mono text-white">{(scan as any).threads || '8'}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Scan Started:</span> <span className="font-mono text-white">{parsed.startTimeFormatted}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Scan Completed:</span> <span className="font-mono text-white">{parsed.endTimeFormatted}</span></div>
            <div className="flex justify-between"><span className="text-[#475569]">Total Duration:</span> <span className="font-mono text-[#3b82f6] font-bold text-lg">{parsed.durationFormatted}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
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
          <div key={i} className="bg-[#161b27] border border-[#21293a] rounded-xl p-5 md:p-6 text-center shadow-lg">
            <div className="text-sm font-semibold tracking-wider text-[#475569] uppercase">{stat.label}</div>
            <div className="text-3xl md:text-4xl font-bold font-mono mt-3" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-2">
        <h5 className="text-lg font-bold text-white uppercase tracking-wider border-b border-[#21293a] pb-2 font-mono flex items-center gap-2">
          <Server size={20} className="text-[#3b82f6]" /> Operating System Fingerprint
        </h5>
        <div className="bg-[#161b27] border border-[#21293a] rounded-xl overflow-hidden shadow-lg">
          {parsed.osDetection?.detected ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#21293a]">
              <div className="p-4 md:p-6 text-center">
                <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1 font-bold">OS Name</div>
                <div className="text-lg font-bold text-[#f1f5f9] font-mono">{parsed.osDetection.osName}</div>
              </div>
              <div className="p-4 md:p-6 text-center">
                <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1 font-bold">Vendor</div>
                <div className="text-lg font-bold text-[#f1f5f9] font-mono">{parsed.osDetection.vendor}</div>
              </div>
              <div className="p-4 md:p-6 text-center">
                <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1 font-bold">Device Type</div>
                <div className="text-lg font-bold text-[#f1f5f9] font-mono">{parsed.osDetection.deviceType}</div>
              </div>
              <div className="p-4 md:p-6 text-center">
                <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1 font-bold">Accuracy</div>
                <div className="text-lg font-bold text-[#3b82f6] font-mono">{parsed.osDetection.accuracy}%</div>
              </div>
              <div className="p-4 md:p-6 text-center overflow-hidden">
                <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1 font-bold">CPE</div>
                <div className="text-sm font-bold text-[#f1f5f9] font-mono truncate" title={parsed.osDetection.cpe}>{parsed.osDetection.cpe}</div>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8 text-center text-base text-[#475569] font-mono">
              <p>{parsed.osDetection?.message || 'OS fingerprint unavailable'}</p>
              {!parsed.osDetection?.detected && (
                <p className="mt-2 text-sm text-[#64748b]">Try enabling <strong className="text-[#94a3b8]">Aggressive Version Detection</strong>.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h5 className="text-lg font-bold text-white uppercase tracking-wider border-b border-[#21293a] pb-2 font-mono flex items-center gap-2">
          <Network size={20} className="text-[#3b82f6]" /> Port & Handshake Details
        </h5>
        {parsed.ports.length > 0 ? (
          <div className="overflow-x-auto border border-[#21293a] rounded-xl shadow-lg">
            <table className="w-full text-left text-sm md:text-base border-collapse">
              <thead>
                <tr className="bg-[#0d1117] border-b border-[#21293a] text-[#475569] uppercase font-bold tracking-[0.08em] text-xs md:text-sm">
                  <th className="py-4 px-6">Port</th>
                  <th className="py-4 px-6">Service</th>
                  <th className="py-4 px-6">Version</th>
                  <th className="py-4 px-6">Banner Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21293a] font-mono">
                {parsed.ports.map((port, idx) => (
                  <tr key={idx} className="hover:bg-[#21293a]/10">
                    <td className="py-4 px-6 font-semibold text-white">{port.port}</td>
                    <td className="py-4 px-6 text-[#cbd5e1]">{port.service}</td>
                    <td className="py-4 px-6">{port.version}</td>
                    <td className="py-4 px-6 text-[#64748b] text-sm break-all max-w-sm">{port.banner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#161b27] border border-[#21293a] rounded-xl p-8 text-center text-base text-[#475569] font-mono shadow-lg">
            No open ports were detected on the target.
          </div>
        )}
      </div>

      <div className="space-y-10 text-left">
        <div className="space-y-6">
          <h5 className="text-xl font-bold text-white uppercase tracking-wider border-b border-[#21293a] pb-3 font-mono flex items-center gap-3">
            <ShieldAlert size={24} className="text-[#ef4444]" /> Vulnerability Intelligence
          </h5>
          
          {parsed.cves.length > 0 ? (
            <div className="space-y-6">
              {parsed.cves.map((cve) => (
                <div key={cve.id} className="bg-[#161b27] border border-[#21293a] rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-[#0d1117] border-b border-[#21293a] p-4 md:p-5 flex items-center justify-between">
                    <span className="font-mono text-xl font-bold text-[#ef4444]">{cve.id}</span>
                    <div className="flex gap-2">
                      {cve.references.slice(0, 2).map((ref, idx) => (
                        <a key={idx} href={ref} target="_blank" rel="noreferrer" className="text-xs bg-[#1e293b] text-[#3b82f6] px-3 py-1.5 rounded hover:underline hover:bg-[#3b82f6]/10 transition-colors font-mono">Ref {idx + 1}</a>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-5 md:p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-[#0d1117] border border-[#21293a] p-3 rounded-lg text-center flex flex-col justify-center">
                        <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1 font-bold">CVSS Score</div>
                        <div className="text-xl font-bold text-[#ef4444] font-mono">{cve.cvss}</div>
                      </div>
                      <div className="bg-[#0d1117] border border-[#21293a] p-3 rounded-lg text-center flex flex-col justify-center">
                        <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1 font-bold">Severity</div>
                        <div className="text-lg font-bold text-[#ef4444] font-mono uppercase tracking-widest">{cve.cvss >= 9 ? 'Critical' : cve.cvss >= 7 ? 'High' : 'Medium'}</div>
                      </div>
                      <div className="bg-[#0d1117] border border-[#21293a] p-3 rounded-lg text-center flex flex-col justify-center">
                        <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1 font-bold">Published Date</div>
                        <div className="text-sm font-bold text-[#e2e8f0] font-mono mt-1">{cve.publishedDate}</div>
                      </div>
                      <div className="bg-[#0d1117] border border-[#21293a] p-3 rounded-lg text-center flex flex-col justify-center">
                        <div className="text-xs text-[#64748b] uppercase tracking-wider mb-1 font-bold">MITRE Mapped</div>
                        <div className="text-xs font-bold text-[#3b82f6] font-mono mt-1 truncate px-1" title={cve.mitreTechnique}>{cve.mitreTechnique.split(' ')[0] || 'Unknown'}</div>
                      </div>
                    </div>

                    <div>
                      <h6 className="text-sm font-bold text-[#cbd5e1] uppercase tracking-wider mb-3 font-mono">Vulnerability Description</h6>
                      <p className="text-sm md:text-base text-[#94a3b8] leading-relaxed bg-[#0d1117] border border-[#21293a] p-4 rounded-lg">
                        {cve.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#161b27] border border-[#21293a] rounded-xl p-8 text-center text-base text-[#475569] font-mono shadow-lg">
              No vulnerabilities (CVEs) or active threat intelligence signatures mapped.
            </div>
          )}
        </div>

        {/* MITRE ATT&CK Mapping */}
        <div className="space-y-4 pt-2">
          <h5 className="text-lg font-bold text-white uppercase tracking-wider border-b border-[#21293a] pb-2 font-mono flex items-center gap-2">
            <Target size={20} className="text-[#a855f7]" /> MITRE ATT&CK MAPPING
          </h5>
          {parsed.mitreMappings && parsed.mitreMappings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parsed.mitreMappings.map((mitre, idx) => {
                const isHigh = mitre.risk === 'High';
                return (
                  <div key={idx} className="bg-[#161b27] border border-[#21293a] rounded-xl overflow-hidden shadow-lg flex flex-col transition-all hover:border-[#a855f7]/50">
                    <div className="p-4 bg-[#0d1117] border-b border-[#21293a] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#a855f7] bg-[#a855f7]/10 px-2 py-0.5 rounded border border-[#a855f7]/30">{mitre.id}</span>
                        <span className="text-white font-bold text-sm tracking-wide uppercase truncate">{mitre.name}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${isHigh ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20' : 'bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/20'}`}>
                        {mitre.risk}
                      </span>
                    </div>
                    <div className="p-4 space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#64748b] uppercase font-bold tracking-wider">Tactic:</span>
                        <span className="text-sm text-[#e2e8f0] bg-[#1e293b] px-2 py-0.5 rounded font-mono">{mitre.tactic}</span>
                      </div>
                      <p className="text-sm text-[#94a3b8] leading-relaxed flex-1">
                        {mitre.description}
                      </p>
                      <div className="pt-3 border-t border-[#21293a] mt-auto">
                        <span className="text-xs text-[#22c55e] font-bold uppercase tracking-wider block mb-1">Recommendation</span>
                        <p className="text-sm text-[#cbd5e1]">{mitre.recommendation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#161b27] border border-[#21293a] rounded-xl p-8 text-center text-base text-[#475569] font-mono shadow-lg">
              No MITRE ATT&CK techniques were directly mapped to the discovered services.
            </div>
          )}
        </div>

        {/* Actionable Recommendations */}
        <div className="space-y-4 pt-2">
          <h5 className="text-lg font-bold text-white uppercase tracking-wider border-b border-[#21293a] pb-2 font-mono flex items-center gap-2">
            <CheckCircle2 size={20} className="text-[#22c55e]" /> Actionable Recommendations
          </h5>
          <div className="bg-[#161b27] border border-[#21293a] rounded-xl p-6 md:p-8 shadow-lg">
            {parsed.recommendations.length > 0 ? (
              <ul className="list-none space-y-6">
                {parsed.recommendations.map((rec, i) => {
                  const parts = rec.split(':');
                  const isTitle = parts.length > 1 && !rec.startsWith('Enforce') && !rec.startsWith('Regular');
                  return (
                    <li key={i} className="flex items-start gap-3 text-sm md:text-base text-[#cbd5e1]">
                      <div className="mt-1 text-[#3b82f6]">
                        <ArrowRight size={16} />
                      </div>
                      <div>
                        {isTitle ? (
                          <>
                            <strong className="text-white block mb-1 text-base">{parts[0]}:</strong>
                            <span className="text-[#94a3b8] leading-relaxed">{parts.slice(1).join(':')}</span>
                          </>
                        ) : (
                          <span className="text-[#94a3b8] leading-relaxed">{rec}</span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="text-center text-base text-[#475569] font-mono">
                No immediate actionable recommendations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <PageHeader 
        title="Recon Console" 
        subtitle="Deploy scanning agents and perform detailed network reconnaissance." 
      />

      {/* Network Scanner Form */}
      <div className="bg-[#161b27] border border-[#21293a] rounded-xl p-6 md:p-8 shadow-xl max-w-[1050px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-[#21293a] pb-4">
          <h3 className="text-lg font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-3">
            <Play className="text-[#3b82f6]" size={20} /> Configure Scanner Agent
          </h3>
          <span className="text-sm text-[#94a3b8] flex items-center gap-2 mt-2 sm:mt-0">
            <Server size={14} /> Simulator mode
          </span>
        </div>
        
        <form onSubmit={handleScanSubmit} className="space-y-6">
          {scanError && (
            <div className="rounded-lg border border-[#dc2626] bg-[#7f1d1d]/10 p-4 text-sm text-[#fecaca]">
              {scanError}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Target Address / IP</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                required
                placeholder="e.g. 192.168.1.105 or safehost.local"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={loading || (activeScan?.status === 'scanning')}
                className="flex-1 bg-[#0d1117] border border-[#21293a] rounded-lg px-4 py-3 text-base text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] placeholder-[#475569] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setTarget('')}
                className="text-base font-semibold leading-tight tracking-normal h-[52px] px-8 bg-[#0b1220] border border-[#21293a] rounded-lg text-[#94a3b8] hover:bg-[#111827] transition-colors flex items-center justify-center gap-2"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Port Range</label>
              <select
                value={portRange}
                onChange={(e) => setPortRange(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#21293a] rounded-lg px-4 py-3 text-base text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] transition-all"
              >
                <option value="1-1024">Default (1-1024)</option>
                <option value="1-65535">All Ports (1-65535)</option>
                <option value="common">Common Ports (21,22,80,443,8080)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-2">Scan Threads</label>
              <select
                value={threads}
                onChange={(e) => setThreads(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#21293a] rounded-lg px-4 py-3 text-base text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] transition-all"
              >
                <option value="4">4 Threads</option>
                <option value="8">8 Threads (Rec.)</option>
                <option value="16">16 Threads</option>
                <option value="32">32 Threads</option>
              </select>
            </div>
          </div>

          <div 
            ref={optionsRef}
            className={`transition-all duration-300 space-y-4 ${
              validationError 
                ? 'border border-[#eab308] bg-[#eab308]/10 p-4 rounded-lg' 
                : 'pt-4 border-t border-[#21293a]'
            }`}
          >
            <span className="block text-xs font-semibold text-[#475569] uppercase tracking-wider">Advanced Scan Options</span>
            
            {validationError && (
              <div className="flex items-center gap-2 text-sm text-[#eab308] font-bold bg-[#eab308]/10 p-3 rounded border border-[#eab308]/20">
                <AlertTriangle size={16} /> Please select at least one scan option before starting the scan.
              </div>
            )}

            <label className="flex items-center gap-3 text-base text-[#94a3b8] cursor-pointer">
              <input
                type="checkbox"
                checked={pingDiscovery}
                onChange={(e) => setPingDiscovery(e.target.checked)}
                className="rounded w-5 h-5 bg-[#0d1117] border-[#21293a] text-[#3b82f6] focus:ring-0"
              />
              <span>Ping Host Discovery (ICMP Echo request) before scanning</span>
            </label>

            <label className="flex items-center gap-3 text-base text-[#94a3b8] cursor-pointer">
              <input
                type="checkbox"
                checked={aggressiveMode}
                onChange={(e) => setAggressiveMode(e.target.checked)}
                className="rounded w-5 h-5 bg-[#0d1117] border-[#21293a] text-[#3b82f6] focus:ring-0"
              />
              <span>Aggressive Version Detection (-sV -O OS fingerprinting)</span>
            </label>

            <span className="block text-xs text-[#94a3b8] italic mt-2">Select one or more scan profiles to continue.</span>
          </div>

          <button
            type="submit"
            disabled={loading || (activeScan?.status === 'scanning')}
            className={`w-full text-white text-base font-semibold leading-tight tracking-normal h-[52px] px-8 rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-4 ${
              loading || (activeScan?.status === 'scanning')
                ? 'bg-[#21293a] text-[#475569] cursor-not-allowed'
                : (!target.trim() || (!pingDiscovery && !aggressiveMode))
                  ? 'bg-[#3b82f6]/50 cursor-not-allowed text-white/70'
                  : 'bg-[#3b82f6] hover:bg-[#2563eb]'
            }`}
          >
            {(loading || (activeScan?.status === 'scanning')) ? (
              <>
                <RotateCw size={20} className="animate-spin" /> Scanning {target}...
              </>
            ) : (
              <>
                <Play size={20} /> Start Recon Scan
              </>
            )}
          </button>
        </form>
      </div>

      {/* Active Scan Results */}
      {activeScan && (
        <div className="bg-[#161b27] border border-[#21293a] rounded-xl overflow-hidden shadow-2xl mt-12">
          {/* Header */}
          <div className="p-6 bg-[#0f172a] border-b border-[#21293a] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold tracking-wider text-[#475569] uppercase">Active Scan Results:</span>
              <span className="text-lg font-bold text-[#f1f5f9] font-mono">{activeScan.target}</span>
              {activeScan.status === 'scanning' ? (
                <span className="px-3 py-1 text-xs font-bold rounded bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] animate-pulse uppercase tracking-wider">
                  SCANNING HOST...
                </span>
              ) : activeScan.status === 'completed' && enrichedActiveScan ? (
                enrichedActiveScan.riskLevel === 'Unknown' ? (
                  <span className="px-3 py-1 text-xs font-bold rounded bg-[#64748b]/10 border border-[#64748b]/30 text-[#64748b] uppercase tracking-wider">
                    NOT ASSESSED
                  </span>
                ) : (
                  <span className={`px-3 py-1 text-xs font-bold rounded border ${enrichedActiveScan?.riskColor} uppercase tracking-wider`}>
                    {enrichedActiveScan?.riskLevel} RISK TARGET
                  </span>
                )
              ) : (
                <span className="px-3 py-1 text-xs font-bold rounded bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] uppercase tracking-wider">
                  FAILED
                </span>
              )}
            </div>

            {activeScan.status === 'completed' && enrichedActiveScan && (
              <div className="flex items-center gap-4 text-sm text-[#94a3b8]">
                <span>Open Ports: <strong className="text-white text-base">{enrichedActiveScan.openPortsCount}</strong></span>
                <span className="text-[#21293a]">|</span>
                <span>Duration: <strong className="text-white text-base">{enrichedActiveScan.durationFormatted}</strong></span>
                <span className="text-[#21293a]">|</span>
                <a
                  href={`/api/reports/generate/${activeScan.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#21293a] hover:bg-[#3b82f6]/20 border border-[#3b82f6]/30 hover:border-[#3b82f6] text-[#f1f5f9] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                >
                  <FileText size={16} className="text-[#3b82f6]" /> PDF Export
                </a>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            {activeScan.status === 'scanning' ? (
              <ScanLoadingUI target={activeScan.target} currentScan={activeScan} />
            ) : activeScan.status === 'completed' && enrichedActiveScan ? (
              <>
                {!enrichedActiveScan.hostReachable && enrichedActiveScan.openPortsCount === 0 ? (
                  <div className="rounded-xl border border-[#334155]/60 bg-[#0d1117] overflow-hidden shadow-lg">
                    <div className="flex items-center gap-4 px-6 py-5 border-b border-[#1e293b] bg-[#0f172a]">
                      <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                        <WifiOff size={20} className="text-[#ef4444]" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#f1f5f9] tracking-wide">Host Unreachable / Offline</p>
                        <p className="text-sm text-[#64748b] mt-1">No active services or open ports detected on this target</p>
                      </div>
                      <span className="ml-auto px-4 py-1.5 rounded-md text-xs font-bold tracking-widest bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] uppercase">Unreachable</span>
                    </div>

                    <div className="px-6 py-5 border-t border-[#1e293b] flex flex-wrap items-center gap-6 text-sm text-[#475569] bg-[#0a0f1a]">
                      <span className="flex items-center gap-2">
                        <Clock size={16} className="text-[#334155]" />
                        <span>Scan Duration:</span>
                        <strong className="text-[#94a3b8]">{enrichedActiveScan.duration}</strong>
                      </span>
                    </div>

                    <div className="mx-6 my-6 flex items-start gap-4 rounded-lg border border-[#eab308]/20 bg-[#eab308]/5 px-5 py-4">
                      <AlertTriangle size={20} className="text-[#eab308] flex-shrink-0 mt-1" />
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-[#eab308]">No active host or open services were detected on the target.</p>
                        <p className="text-sm text-[#64748b] leading-relaxed">
                          The target did not respond to ICMP/TCP probes or all scanned ports are filtered/closed.
                        </p>
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
              <div className="py-12 text-center text-base text-[#475569]">
                Scan failed or produced no results.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
