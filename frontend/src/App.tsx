import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Play, 
  History, 
  ShieldAlert, 
  FileText, 
  Network, 
  Bot, 
  Menu, 
  Shield, 
  Activity, 
  Bell 
} from 'lucide-react';
import Dashboard from './pages/Dashboard';

export type Tab = 'dashboard' | 'scan' | 'history' | 'cve' | 'reports' | 'map' | 'assistant';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const saved = localStorage.getItem('netreconx_active_tab');
    const validTabs: Tab[] = ['dashboard', 'scan', 'history', 'cve', 'reports', 'map', 'assistant'];
    return (saved && validTabs.includes(saved as Tab)) ? (saved as Tab) : 'dashboard';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('netreconx_active_tab', activeTab);
  }, [activeTab]);

  const navSections = [
    {
      title: 'SYSTEM',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'RECON',
      items: [
        { id: 'scan', label: 'New Scan', icon: Play },
        { id: 'history', label: 'History', icon: History },
        { id: 'cve', label: 'CVE Lookup', icon: ShieldAlert },
        { id: 'reports', label: 'Reports', icon: FileText },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'map', label: 'Network Map', icon: Network },
        { id: 'assistant', label: 'AI Assistant', icon: Bot },
      ]
    }
  ];

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Close mobile drawer
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0d1117] text-[#f1f5f9] flex font-sans overflow-x-hidden">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Panel - Fixed 200px */}
        <aside className={`
          fixed top-0 bottom-0 left-0 w-[200px] bg-[#161b27] border-r border-[#21293a] z-50 flex flex-col transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:flex
        `}>
          {/* Sidebar Header / Logo */}
          <div className="h-14 border-b border-[#21293a] flex items-center px-4 gap-2">
            <div className="bg-[#3b82f6]/10 p-1.5 rounded border border-[#3b82f6]/30 text-[#3b82f6]">
              <Shield size={18} />
            </div>
            <span className="font-extrabold text-sm tracking-widest text-[#f1f5f9]">
              NETRECON<span className="text-[#3b82f6]">X</span>
            </span>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 py-4 space-y-5 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.title} className="px-3">
                {/* Section Header */}
                <h3 className="px-3 text-[10px] font-semibold tracking-[0.08em] text-[#475569] uppercase mb-2">
                  {section.title}
                </h3>
                {/* Section Items */}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => handleTabClick(item.id as Tab)}
                          className={`
                            w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium rounded transition-all duration-150 border-l-2
                            ${isActive 
                              ? 'border-[#3b82f6] text-[#3b82f6] bg-[#3b82f6]/5' 
                              : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#21293a]/40'}
                          `}
                        >
                          <Icon size={14} className={isActive ? 'text-[#3b82f6]' : 'text-[#94a3b8]'} />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#21293a] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
            <span className="text-[10px] text-[#94a3b8] font-medium">Secured Sandbox</span>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Topbar */}
          <header className="h-14 bg-[#161b27] border-b border-[#21293a] flex items-center justify-between px-4 md:px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger menu */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1 text-[#94a3b8] hover:text-[#f1f5f9] md:hidden rounded focus:outline-none focus:bg-[#21293a]"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-xs font-semibold text-[#f1f5f9] tracking-wider uppercase hidden sm:block">
                NetReconX Console
              </h2>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 text-[10px] font-semibold">
                <Activity size={10} />
                ONLINE
              </span>
              <button className="p-1.5 text-[#94a3b8] hover:text-[#f1f5f9] rounded border border-[#21293a] bg-[#0d1117]/50 hover:bg-[#21293a] transition-all">
                <Bell size={14} />
              </button>
            </div>
          </header>

          {/* Main Area Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0d1117]">
            <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
