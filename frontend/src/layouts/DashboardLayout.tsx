import { useState } from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Menu,
  Home,
  ArrowLeft,
  Bot,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useScan } from '../hooks/useScan';
import logo from '../assets/reconsentinel-logo.png';

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hoist the scan state so it persists across Recon Console and other pages
  const { currentScan, loading, scanError, triggerScan } = useScan();

  const navItems = [
    { path: '/', label: 'Home', icon: Home, isExternal: true },
    { path: '/recon-console', label: 'Recon Console', icon: LayoutDashboard },
    { path: '/intel', label: 'Threat Intelligence', icon: ShieldAlert },
    { path: '/network-map', label: 'Network Map', icon: Network },
    { path: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  ];

  const handleNavClick = (item: any) => {
    navigate(item.path);
    setIsSidebarOpen(false); // Close mobile drawer
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f1f5f9] flex font-sans overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel - Fixed 260px for better typography */}
      <aside className={`
        fixed top-0 bottom-0 left-0 w-[260px] bg-[#161b27] border-r border-[#21293a] z-50 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex flex-shrink-0 shadow-2xl
      `}>
        {/* Sidebar Header / Logo */}
        <div className="h-16 border-b border-[#21293a] flex items-center px-5 gap-3">
          <img src={logo} alt="ReconSentinel Logo" className="w-[36px] h-[36px] object-contain" />
          <span className="font-extrabold text-base tracking-widest text-[#f1f5f9]">
            <span className="text-[#3b82f6]">RECON</span><span className="text-[#22c55e]">SENTINEL</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-[#334155] scrollbar-track-transparent">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 border-l-2 whitespace-nowrap
                  ${isActive 
                    ? 'border-[#3b82f6] text-[#3b82f6] bg-[#3b82f6]/10 shadow-sm' 
                    : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#21293a]/60 hover:border-[#475569]'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-[#3b82f6]' : 'text-[#64748b] group-hover:text-[#94a3b8] transition-colors'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div 
          className="p-4 border-t border-[#21293a]/80 bg-[#05080f] flex items-center justify-center gap-2 cursor-help transition-colors hover:bg-[#0a0f1a]"
          title="ReconSentinel Scanning & Threat Intelligence Engine"
        >
          <Cpu size={16} className="text-[#64748b]" />
          <span className="text-sm font-semibold tracking-wide">
            <span className="text-[#3b82f6]">RECON</span><span className="text-[#22c55e]">SENTINEL</span>
            <span className="text-[#e2e8f0] ml-1.5">ENGINE</span>
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#161b27] border-b border-[#21293a] flex items-center justify-between px-5 md:px-8 flex-shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] md:hidden rounded-lg focus:outline-none hover:bg-[#21293a] transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-sm md:text-base font-bold text-[#f1f5f9] tracking-widest uppercase">
              ReconSentinel Console
            </h2>
          </div>

          {/* Action / Navigation */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 h-[48px] px-6 bg-gradient-to-r from-[#3b82f6]/20 to-[#3b82f6]/5 hover:from-[#3b82f6]/30 hover:to-[#3b82f6]/10 text-[#3b82f6] hover:text-[#60a5fa] rounded-lg text-base font-semibold leading-tight tracking-normal transition-all duration-300 border border-[#3b82f6]/30 hover:border-[#3b82f6]/50 shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_15px_rgba(59,130,246,0.25)]"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </button>
          </div>
        </header>

        {/* Main Area Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-[#0d1117] custom-scrollbar">
          <Outlet context={{ currentScan, loading, scanError, triggerScan }} />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
