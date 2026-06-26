import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function AIAssistant() {
  const [aiInput, setAiInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant', text: string, time: string }>>([
    { 
      sender: 'assistant', 
      text: 'Hello! I am your ReconSentinel Copilot. I can analyze your network scans, explain CVEs, or suggest remediation configurations. Try asking about a CVE or target host.', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, aiTyping]);

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
        responseText += `Discovered ports indicate exposed open nodes. Secure unnecessary SSH interfaces and ensure HTTPS modules are patched.`;
      } else {
        responseText += `Ensure your sandbox target IP address matches safe ranges. Keep service ports closed when not running active mock tests.`;
      }

      setChatMessages(prev => [...prev, { sender: 'assistant', text: responseText, time: timeStr }]);
      setAiTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-3 max-w-[1200px] mx-auto h-[calc(100vh-8rem)] flex flex-col pb-2">
      <div className="flex-shrink-0">
        <PageHeader 
          title="AI Security Assistant" 
          subtitle="Chat with your Copilot to analyze vulnerabilities and get remediation advice." 
          className="mb-2 mt-0 text-center max-w-xl mx-auto"
        />
      </div>

      <div className="bg-[#161b27] border border-[#21293a] rounded-xl max-w-[1050px] mx-auto w-full flex-1 flex flex-col overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="p-4 md:p-5 border-b border-[#21293a] bg-[#161b27] flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] shadow-inner">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wider">Copilot Threat Assistant</h3>
              <span className="text-xs text-[#22c55e] flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block animate-pulse" /> Active scanning context loaded</span>
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
            className="text-sm font-semibold leading-tight tracking-normal text-[#475569] hover:text-[#f1f5f9] transition-all h-[40px] px-5 flex items-center justify-center bg-[#0d1117] rounded-md border border-[#21293a]"
          >
            Clear Chat
          </button>
        </div>

        {/* Chat Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1117] inner-shadow scrollbar-thin scrollbar-thumb-[#334155] scrollbar-track-transparent">
          {chatMessages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={index} className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] flex-shrink-0 mt-1 shadow-sm">
                    <Bot size={16} />
                  </div>
                )}
                <div className={`
                  max-w-[85%] md:max-w-[75%] rounded-xl p-3 md:p-4 text-sm md:text-base leading-relaxed shadow-md
                  ${isUser 
                    ? 'bg-[#3b82f6] text-white rounded-tr-none' 
                    : 'bg-[#161b27] border border-[#21293a] text-[#e2e8f0] rounded-tl-none'}
                `}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className="block text-xs text-opacity-70 mt-2 text-right font-mono font-medium">
                    {isUser ? <span className="text-blue-200">{msg.time}</span> : <span className="text-[#64748b]">{msg.time}</span>}
                  </span>
                </div>
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#21293a] border border-[#334155] flex items-center justify-center text-[#f1f5f9] flex-shrink-0 mt-1 font-bold text-xs uppercase font-mono shadow-sm">
                    US
                  </div>
                )}
              </div>
            );
          })}

          {aiTyping && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6] flex-shrink-0 mt-1 shadow-sm">
                <Bot size={16} />
              </div>
              <div className="bg-[#161b27] border border-[#21293a] rounded-xl rounded-tl-none p-4 text-sm text-[#475569] font-mono flex items-center gap-1.5 shadow-md h-12">
                <span className="w-2 h-2 rounded-full bg-[#64748b] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#64748b] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#64748b] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts Tag List */}
        <div className="p-2.5 px-4 border-t border-[#21293a] bg-[#161b27] flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-none">
          <button 
            onClick={() => setAiInput('Explain Apache CVE-2021-40438 risk')}
            className="px-4 py-1.5 rounded-full bg-[#0d1117] border border-[#334155] hover:border-[#3b82f6] text-[#94a3b8] hover:text-white text-xs md:text-sm font-mono whitespace-nowrap transition-colors shadow-sm"
          >
            Analyze Apache CVE
          </button>
          <button 
            onClick={() => setAiInput('Explain Squid CVE-2023-45897 risk')}
            className="px-4 py-1.5 rounded-full bg-[#0d1117] border border-[#334155] hover:border-[#3b82f6] text-[#94a3b8] hover:text-white text-xs md:text-sm font-mono whitespace-nowrap transition-colors shadow-sm"
          >
            Analyze Squid RCE
          </button>
          <button 
            onClick={() => setAiInput('Suggest general mitigation configurations')}
            className="px-4 py-1.5 rounded-full bg-[#0d1117] border border-[#334155] hover:border-[#3b82f6] text-[#94a3b8] hover:text-white text-xs md:text-sm font-mono whitespace-nowrap transition-colors shadow-sm"
          >
            General Mitigations
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAiSubmit} className="p-3 md:p-4 border-t border-[#21293a] bg-[#0f172a] flex gap-3 flex-shrink-0">
          <input
            type="text"
            required
            placeholder="Ask for vulnerability patch instructions..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            className="flex-1 bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-3 text-sm md:text-base text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/50 placeholder-[#475569] shadow-inner transition-all"
          />
          <button
            type="submit"
            disabled={aiTyping}
            className="bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#334155] disabled:text-[#64748b] text-white text-base font-semibold leading-tight tracking-normal h-[48px] px-8 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md self-center"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
