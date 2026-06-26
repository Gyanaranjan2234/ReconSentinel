import { useState } from 'react';
import { Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function NetworkMap() {
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>(null);
  const navigate = useNavigate();

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
          <span className="text-sm text-[#475569] font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" /> Real-time Nodes
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Interactive SVG Canvas */}
          <div className="lg:col-span-3 bg-[#0d1117] border border-[#21293a] rounded-xl h-[380px] relative overflow-hidden flex items-center justify-center shadow-inner">
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
                <circle cx="300" cy="200" r="24" fill="#161b27" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="300" cy="200" r="28" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" className="animate-spin" style={{ transformOrigin: '300px 200px', animationDuration: '10s' }} />
                <text x="300" y="234" textAnchor="middle" fill="#f1f5f9" fontSize="9" fontWeight="bold" fontFamily="monospace">RECON CONSOLE</text>
                <text x="300" y="244" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace">192.168.1.50</text>
                <circle cx="300" cy="200" r="3" fill="#22c55e" />
              </g>

              {/* Node 1: Router/Firewall */}
              <g 
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => setSelectedMapNode('192.168.1.1')}
              >
                <circle cx="150" cy="120" r="20" fill="#161b27" stroke={selectedMapNode === '192.168.1.1' ? '#3b82f6' : '#21293a'} strokeWidth="2" />
                <circle cx="150" cy="120" r="3" fill="#eab308" />
                <text x="150" y="152" textAnchor="middle" fill="#f1f5f9" fontSize="10" fontWeight="bold" fontFamily="monospace">192.168.1.1</text>
                <text x="150" y="164" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">Gate/Router</text>
              </g>

              {/* Node 2: Dev Server */}
              <g 
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => setSelectedMapNode('192.168.1.105')}
              >
                <circle cx="150" cy="280" r="20" fill="#161b27" stroke={selectedMapNode === '192.168.1.105' ? '#3b82f6' : '#21293a'} strokeWidth="2" />
                <circle cx="150" cy="280" r="3" fill="#ef4444" />
                <text x="150" y="312" textAnchor="middle" fill="#f1f5f9" fontSize="10" fontWeight="bold" fontFamily="monospace">192.168.1.105</text>
                <text x="150" y="324" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">Dev-Proxy</text>
              </g>

              {/* Node 3: External Domain Web */}
              <g 
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => setSelectedMapNode('example.com')}
              >
                <circle cx="450" cy="120" r="20" fill="#161b27" stroke={selectedMapNode === 'example.com' ? '#3b82f6' : '#21293a'} strokeWidth="2" />
                <circle cx="450" cy="120" r="3" fill="#22c55e" />
                <text x="450" y="152" textAnchor="middle" fill="#f1f5f9" fontSize="10" fontWeight="bold" fontFamily="monospace">example.com</text>
                <text x="450" y="164" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">Web Target</text>
              </g>

              {/* Node 4: Isolated Subnet Node */}
              <g 
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => setSelectedMapNode('192.168.1.200')}
              >
                <circle cx="450" cy="280" r="20" fill="#161b27" stroke={selectedMapNode === '192.168.1.200' ? '#3b82f6' : '#21293a'} strokeWidth="2" />
                <circle cx="450" cy="280" r="3" fill="#22c55e" />
                <text x="450" y="312" textAnchor="middle" fill="#f1f5f9" fontSize="10" fontWeight="bold" fontFamily="monospace">192.168.1.200</text>
                <text x="450" y="324" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">Workstation</text>
              </g>
            </svg>

            <div className="absolute bottom-3 left-3 bg-[#161b27]/90 border border-[#21293a] rounded-lg p-2.5 text-xs font-mono text-[#94a3b8] space-y-1.5 backdrop-blur-sm">
              <span className="block font-bold text-white mb-1.5 border-b border-[#21293a] pb-1">LEGEND</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> High Risk Node</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#eab308]" /> Med Risk Node</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#22c55e]" /> Clean Node</span>
            </div>
          </div>

          {/* Sidebar Details Drawer */}
          <div className="bg-[#0d1117] border border-[#21293a] rounded-xl p-5 flex flex-col justify-between shadow-inner">
            {selectedMapNode ? (
              <div className="space-y-4">
                <div className="border-b border-[#21293a] pb-3">
                  <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Node Details</span>
                  <h4 className="text-lg font-bold text-white font-mono mt-1">{selectedMapNode}</h4>
                </div>

                {selectedMapNode === 'scanner' ? (
                  <div className="space-y-3 text-sm text-[#94a3b8] leading-relaxed">
                    <p>Running scanning agent local interface.</p>
                    <p><strong>Subnet scope:</strong> 192.168.1.0/24</p>
                    <p><strong>Status:</strong> Listening</p>
                  </div>
                ) : selectedMapNode === '192.168.1.1' ? (
                  <div className="space-y-4 text-sm text-[#94a3b8]">
                    <p>Subnet default gateway interface.</p>
                    <div className="space-y-2 font-mono text-xs bg-[#161b27] border border-[#21293a] p-3 rounded-lg">
                      <div className="text-white font-bold mb-1 border-b border-[#21293a] pb-1">Open Ports:</div>
                      <div>- 80/tcp (HTTP) <span className="text-[#eab308]">[Med]</span></div>
                      <div>- 443/tcp (HTTPS) <span className="text-[#22c55e]">[Safe]</span></div>
                    </div>
                    <p className="text-sm text-[#eab308] font-semibold border-l-2 border-[#eab308] pl-2">Vulnerability alert: Apache SSRF threat detected.</p>
                  </div>
                ) : selectedMapNode === '192.168.1.105' ? (
                  <div className="space-y-4 text-sm text-[#94a3b8]">
                    <p>Development proxy client.</p>
                    <div className="space-y-2 font-mono text-xs bg-[#161b27] border border-[#21293a] p-3 rounded-lg">
                      <div className="text-white font-bold mb-1 border-b border-[#21293a] pb-1">Open Ports:</div>
                      <div>- 22/tcp (SSH) <span className="text-[#22c55e]">[Safe]</span></div>
                      <div>- 8080/tcp (HTTP-alt) <span className="text-[#ef4444]">[Critical]</span></div>
                    </div>
                    <p className="text-sm text-[#ef4444] font-semibold border-l-2 border-[#ef4444] pl-2">Critical Threat: Squid vulnerability allows complete takeover.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-[#94a3b8] leading-relaxed">
                    <p>Workstation node detected in passive ARP scanning.</p>
                    <p><strong>Open Ports:</strong> None detected</p>
                    <p className="text-[#22c55e] font-semibold border-l-2 border-[#22c55e] pl-2">Risk Level: Clean</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6 border-2 border-dashed border-[#21293a] rounded-xl">
                <span className="text-sm text-[#475569] leading-relaxed">Click any topological node in the canvas grid to inspect threat logs.</span>
              </div>
            )}

            {selectedMapNode && selectedMapNode !== 'scanner' && (
              <button
                onClick={() => {
                  navigate(`/recon-console?target=${selectedMapNode}`);
                }}
                className="w-full mt-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white h-[52px] px-8 rounded-lg text-base font-semibold leading-tight tracking-normal transition duration-200 flex items-center justify-center"
              >
                Configure Target Scan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
