import { useState, useMemo } from 'react';
import { Network, AlertCircle, Monitor, Server, MonitorDot } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function NetworkMap() {
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentScan } = useOutletContext<any>();

  const hasScanData = currentScan && currentScan.status === 'completed' && currentScan.results?.hosts?.length > 0;
  const hosts = hasScanData ? currentScan.results.hosts : [];

  // Determine positions for nodes in a circle around the scanner node (300, 200)
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    if (!hasScanData) return positions;

    const centerX = 300;
    const centerY = 200;
    const radius = 140;

    hosts.forEach((host: any, index: number) => {
      const angle = (index / hosts.length) * 2 * Math.PI - Math.PI / 2; // Start from top
      positions[host.ip] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    return positions;
  }, [hosts, hasScanData]);

  const getRiskLevel = (host: any) => {
    if (!host.ports || host.ports.length === 0) return 'clean';
    const hasCritical = host.ports.some((p: any) => [22, 23, 3389, 445].includes(parseInt(p.port)));
    if (hasCritical) return 'high';
    return 'medium';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#ef4444';
      case 'medium': return '#eab308';
      case 'clean': return '#22c55e';
      default: return '#22c55e';
    }
  };

  const selectedHost = hosts.find((h: any) => h.ip === selectedMapNode);

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto">
      <PageHeader 
        title="Network Map" 
        subtitle="Interactive topology mapping of active scanning interfaces and detected nodes."
        className="mb-4 mt-0 text-center max-w-xl mx-auto"
      />

      <div className="bg-[#161b27] border border-[#21293a] rounded-xl p-4 md:p-6 space-y-4 shadow-xl max-w-[1050px] mx-auto">
        <div className="flex items-center justify-between border-b border-[#21293a] pb-3">
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <Network className="text-[#3b82f6]" size={20} /> Host Topology Graph
            </h3>
            <p className="text-sm text-[#94a3b8] mt-1">Visual node clustering of scanning interfaces and subnets.</p>
          </div>
          {hasScanData && (
            <span className="text-sm text-[#475569] font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" /> Live Nodes
            </span>
          )}
        </div>

        {!hasScanData ? (
          <div className="bg-[#0d1117] border border-[#21293a] rounded-xl p-10 flex flex-col items-center justify-center text-center shadow-inner min-h-[400px]">
            <AlertCircle className="text-[#475569] mb-4" size={48} />
            <h4 className="text-lg font-semibold text-white mb-2">No network scan data available.</h4>
            <p className="text-sm text-[#94a3b8] max-w-md">
              Run a scan from Recon Console to generate a network topology. 
              The map will automatically populate once a scan is successfully completed.
            </p>
            <button
              onClick={() => navigate('/recon-console')}
              className="mt-6 bg-[#3b82f6] hover:bg-[#2563eb] text-white h-[44px] px-6 rounded-lg text-sm font-semibold transition duration-200"
            >
              Go to Recon Console
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Interactive SVG Canvas */}
            <div className="lg:col-span-3 bg-[#0d1117] border border-[#21293a] rounded-xl h-[420px] relative overflow-hidden flex items-center justify-center shadow-inner">
              <svg className="w-full h-full" viewBox="0 0 600 400">
                {/* Connection lines */}
                {hosts.map((host: any) => {
                  const pos = nodePositions[host.ip];
                  if (!pos) return null;
                  return (
                    <line 
                      key={`line-${host.ip}`}
                      x1="300" y1="200" 
                      x2={pos.x} y2={pos.y} 
                      stroke="#21293a" strokeWidth="2" strokeDasharray="5,5" 
                      className="animate-pulse" 
                    />
                  );
                })}

                {/* Central Server Node */}
                <g 
                  className="cursor-pointer group"
                  onClick={() => setSelectedMapNode('scanner')}
                >
                  <circle cx="300" cy="200" r="24" fill="#161b27" stroke={selectedMapNode === 'scanner' ? '#3b82f6' : '#21293a'} strokeWidth="2" />
                  <circle cx="300" cy="200" r="28" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" className="animate-spin" style={{ transformOrigin: '300px 200px', animationDuration: '10s' }} />
                  <text x="300" y="234" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="bold" fontFamily="monospace">RECON CONSOLE</text>
                  <circle cx="300" cy="200" r="3" fill="#22c55e" />
                </g>

                {/* Dynamic Host Nodes */}
                {hosts.map((host: any) => {
                  const pos = nodePositions[host.ip];
                  if (!pos) return null;
                  const isSelected = selectedMapNode === host.ip;
                  const riskLevel = getRiskLevel(host);
                  const color = getRiskColor(riskLevel);

                  return (
                    <g 
                      key={`node-${host.ip}`}
                      className="cursor-pointer transition-all hover:opacity-80"
                      onClick={() => setSelectedMapNode(host.ip)}
                    >
                      <circle cx={pos.x} cy={pos.y} r="20" fill="#161b27" stroke={isSelected ? '#3b82f6' : '#21293a'} strokeWidth="2" />
                      <circle cx={pos.x} cy={pos.y} r="3" fill={color} />
                      <text x={pos.x} y={pos.y + 32} textAnchor="middle" fill="#f1f5f9" fontSize="10" fontWeight="bold" fontFamily="monospace">{host.ip}</text>
                      {host.hostname && (
                        <text x={pos.x} y={pos.y + 44} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">
                          {host.hostname.length > 15 ? host.hostname.substring(0, 15) + '...' : host.hostname}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="absolute bottom-3 left-3 bg-[#161b27]/90 border border-[#21293a] rounded-lg p-2.5 text-xs font-mono text-[#94a3b8] space-y-1.5 backdrop-blur-sm">
                <span className="block font-bold text-white mb-1.5 border-b border-[#21293a] pb-1">LEGEND</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> High Risk Node (Crit Ports)</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#eab308]" /> Med Risk Node (Open Ports)</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Clean Node (No Ports)</span>
              </div>
            </div>

            {/* Sidebar Details Drawer */}
            <div className="bg-[#0d1117] border border-[#21293a] rounded-xl p-5 flex flex-col justify-between shadow-inner h-[420px] overflow-y-auto custom-scrollbar">
              {selectedMapNode ? (
                <div className="space-y-4">
                  <div className="border-b border-[#21293a] pb-3 sticky top-0 bg-[#0d1117] z-10 pt-1">
                    <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Node Details</span>
                    <h4 className="text-lg font-bold text-white font-mono mt-1 break-all flex items-center gap-2">
                      {selectedMapNode === 'scanner' ? (
                        <><MonitorDot size={20} className="text-[#3b82f6]" /> Recon Console</>
                      ) : (
                        <>
                          {selectedHost?.os_detection?.detected ? (
                            selectedHost.os_detection.os_name.toLowerCase().includes('windows') || selectedHost.os_detection.vendor.toLowerCase().includes('microsoft') ? (
                              <Monitor size={20} className="text-[#3b82f6]" />
                            ) : selectedHost.os_detection.os_name.toLowerCase().includes('linux') || selectedHost.os_detection.vendor.toLowerCase().includes('linux') ? (
                              <Server size={20} className="text-[#eab308]" />
                            ) : selectedHost.os_detection.os_name.toLowerCase().includes('mac') || selectedHost.os_detection.vendor.toLowerCase().includes('apple') ? (
                              <Monitor size={20} className="text-[#a855f7]" />
                            ) : (
                              <MonitorDot size={20} className="text-[#64748b]" />
                            )
                          ) : (
                            <MonitorDot size={20} className="text-[#64748b]" />
                          )}
                          {selectedMapNode}
                        </>
                      )}
                    </h4>
                  </div>

                  {selectedMapNode === 'scanner' ? (
                    <div className="space-y-3 text-sm text-[#94a3b8] leading-relaxed">
                      <p>Running scanning agent local interface.</p>
                      <p><strong>Status:</strong> Active</p>
                      <p><strong>Scan Target:</strong> {currentScan.target}</p>
                      <p><strong>Scan Duration:</strong> {currentScan.results?.scan_duration_seconds}s</p>
                    </div>
                  ) : selectedHost ? (
                    <div className="space-y-4 text-sm text-[#94a3b8]">
                      {selectedHost.hostname && (
                        <p><strong>Hostname:</strong> {selectedHost.hostname}</p>
                      )}
                      <p><strong>Status:</strong> {selectedHost.status}</p>
                      <p><strong>Latency:</strong> {selectedHost.latency || 'N/A'}</p>
                      
                      {selectedHost.os_detection?.detected && (
                        <div className="bg-[#161b27] border border-[#21293a] rounded p-3 mt-2 flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[#3b82f6] uppercase tracking-wider block mb-1">Operating System</span>
                          <span className="text-sm text-white"><strong>{selectedHost.os_detection.os_name}</strong></span>
                          <span className="text-xs text-[#94a3b8]">Vendor: {selectedHost.os_detection.vendor}</span>
                          <span className="text-xs text-[#94a3b8]">Accuracy: {selectedHost.os_detection.accuracy}%</span>
                        </div>
                      )}
                      
                      {selectedHost.ports && selectedHost.ports.length > 0 ? (
                        <div className="space-y-2 font-mono text-xs bg-[#161b27] border border-[#21293a] p-3 rounded-lg mt-2">
                          <div className="text-white font-bold mb-1 border-b border-[#21293a] pb-1 flex justify-between">
                            <span>Open Ports ({selectedHost.ports.length})</span>
                          </div>
                          <div className="space-y-1.5 mt-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                            {selectedHost.ports.map((p: any, i: number) => (
                              <div key={i} className="flex flex-col border-b border-[#21293a]/50 pb-1.5 last:border-0 last:pb-0">
                                <div className="text-white">- {p.port}/{p.protocol} ({p.service})</div>
                                {p.version !== 'Unknown' && (
                                  <div className="text-[#64748b] ml-3 text-[10px] break-all">{p.version}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#22c55e] font-semibold border-l-2 border-[#22c55e] pl-2 mt-4">
                          No open ports detected. Node appears clean.
                        </p>
                      )}

                      {selectedHost.ports && selectedHost.ports.length > 0 && (
                        <p className={`text-sm font-semibold border-l-2 pl-2 mt-4 ${getRiskLevel(selectedHost) === 'high' ? 'text-[#ef4444] border-[#ef4444]' : 'text-[#eab308] border-[#eab308]'}`}>
                          {getRiskLevel(selectedHost) === 'high' 
                            ? 'High Risk: Critical services (SSH/Telnet/RDP/SMB) detected.' 
                            : 'Medium Risk: Open ports expose network footprint.'}
                        </p>
                      )}

                      {currentScan.results?.mitre_mappings && currentScan.results.mitre_mappings.length > 0 && (
                        <div className="mt-4 border-t border-[#21293a] pt-3">
                          <span className="text-xs font-semibold text-[#a855f7] uppercase tracking-wider block mb-2">MITRE ATT&CK Mapping</span>
                          <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                            {currentScan.results.mitre_mappings.map((mitre: any, idx: number) => (
                              <div key={idx} className="bg-[#161b27] border border-[#21293a] rounded p-2 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-mono font-bold text-[#a855f7]">{mitre.id}</span>
                                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${mitre.risk === 'High' ? 'bg-[#ef4444]/10 text-[#ef4444]' : 'bg-[#eab308]/10 text-[#eab308]'}`}>{mitre.risk}</span>
                                </div>
                                <span className="text-xs text-white truncate" title={mitre.name}>{mitre.name}</span>
                                <span className="text-[10px] text-[#64748b] truncate">Tactic: {mitre.tactic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-6 border-2 border-dashed border-[#21293a] rounded-xl">
                  <span className="text-sm text-[#475569] leading-relaxed">Select a host from the network map first to inspect details and launch scans.</span>
                </div>
              )}

              <button
                disabled={!selectedMapNode || selectedMapNode === 'scanner'}
                onClick={() => {
                  if (selectedMapNode && selectedMapNode !== 'scanner') {
                    navigate(`/recon-console?target=${selectedMapNode}`);
                  }
                }}
                className={`w-full mt-4 flex-shrink-0 text-white h-[52px] px-8 rounded-lg text-base font-semibold leading-tight tracking-normal transition duration-200 flex items-center justify-center ${
                  (!selectedMapNode || selectedMapNode === 'scanner') 
                  ? 'bg-[#21293a] text-[#64748b] cursor-not-allowed' 
                  : 'bg-[#3b82f6] hover:bg-[#2563eb]'
                }`}
              >
                Launch Advanced Scan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
