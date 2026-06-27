import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../components/PageHeader';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  error?: boolean;
}

const renderFormattedText = (text: string) => {
  if (!text) return null;
  // Remove markdown code blocks completely for clean UI, or just backticks
  const lines = text.split('\n').filter(line => !line.trim().startsWith('```'));
  
  return lines.map((line, index) => {
    let cleanLine = line.trim();
    if (!cleanLine) return <div key={index} className="h-3" />;

    // Headings
    const isHeading = /^#+\s+/.test(cleanLine) || cleanLine === 'Summary' || cleanLine === 'Findings' || cleanLine === 'Risk Level' || cleanLine === 'Recommendations' || cleanLine === '**Summary**' || cleanLine === '**Findings**' || cleanLine === '**Risk Level**' || cleanLine === '**Recommendations**';
    
    if (isHeading) {
      cleanLine = cleanLine.replace(/^#+\s+/, '').replace(/\*\*/g, '');
      return (
        <div key={index} className="text-lg font-bold text-white mt-5 mb-2 border-b border-[#21293a] pb-1 uppercase tracking-wide">
          {cleanLine}
        </div>
      );
    }

    // List items
    const isListItem = /^[\-\*]\s+/.test(cleanLine);
    if (isListItem) {
      cleanLine = cleanLine.replace(/^[\-\*]\s+/, '• ');
    }

    // Bold parsing
    const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    return (
      <div 
        key={index} 
        className={`leading-relaxed mb-1.5 ${isListItem ? 'ml-3' : ''}`}
      >
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
          } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return <em key={j} className="text-[#cbd5e1]">{part.slice(1, -1)}</em>;
          }
          return <span key={j}>{part}</span>;
        })}
      </div>
    );
  });
};

export default function AIAssistant() {
  const { currentScan } = useOutletContext<any>();
  const [aiInput, setAiInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      sender: 'assistant', 
      text: 'Hello! I am your AI Security Assistant. I can analyze your network scans, explain CVEs, or suggest remediation configurations. How can I assist you today?', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const hasScanContext = currentScan && currentScan.status === 'completed' && currentScan.results;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, aiTyping]);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message to UI
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, time: timeStr }]);
    setAiInput('');
    setAiTyping(true);

    try {
      // Build history for the backend
      const history = chatMessages
        .filter(msg => !msg.error) // Don't send error messages as history
        .map(msg => ({
          role: msg.sender,
          content: msg.text
        }));

      // Only send context if there is a completed scan
      const contextPayload = hasScanContext ? currentScan.results : null;

      const response = await axios.post('/api/ai/chat', {
        message: userMsg,
        history: history,
        context: contextPayload
      });

      const replyText = response.data.reply;
      
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'assistant', 
          text: replyText, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      
      let errorMessage = 'An unexpected error occurred while contacting the AI service.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.detail || `Server error: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'assistant', 
          text: errorMessage, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true
        }
      ]);
    } finally {
      setAiTyping(false);
    }
  };

  return (
    <div className="space-y-3 max-w-[1200px] mx-auto h-[calc(100vh-8rem)] flex flex-col pb-2">
      <div className="flex-shrink-0">
        <PageHeader 
          title="AI Security Assistant" 
          subtitle="Chat with Gemini to analyze vulnerabilities and get remediation advice based on real scan data." 
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
              <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wider">AI Security Assistant</h3>
              {hasScanContext ? (
                <span className="text-xs text-[#22c55e] flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block animate-pulse" /> 
                  Active scanning context loaded ({currentScan.target})
                </span>
              ) : (
                <span className="text-xs text-[#64748b] flex items-center gap-1.5 mt-0.5">
                  <AlertCircle size={12} /> 
                  No active scan data available. Run a scan to enable contextual security analysis.
                </span>
              )}
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
            const isError = msg.error;
            
            return (
              <div key={index} className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
                {!isUser && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border ${isError ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]' : 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'}`}>
                    {isError ? <AlertCircle size={16} /> : <Bot size={16} />}
                  </div>
                )}
                <div className={`
                  max-w-[85%] md:max-w-[75%] rounded-xl p-3 md:p-4 text-sm md:text-base leading-relaxed shadow-md
                  ${isUser 
                    ? 'bg-[#3b82f6] text-white rounded-tr-none' 
                    : isError
                      ? 'bg-[#161b27] border border-[#ef4444]/50 text-[#ef4444] rounded-tl-none'
                      : 'bg-[#161b27] border border-[#21293a] text-[#e2e8f0] rounded-tl-none'}
                `}>
                  <div className="font-sans text-[#e2e8f0]">
                    {isUser ? <p className="whitespace-pre-wrap">{msg.text}</p> : renderFormattedText(msg.text)}
                  </div>
                  <span className={`block text-xs text-opacity-70 mt-3 text-right font-mono font-medium ${isUser ? 'text-blue-200' : isError ? 'text-[#ef4444]/70' : 'text-[#64748b]'}`}>
                    {msg.time}
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
          {hasScanContext ? (
            <>
              <button 
                onClick={() => setAiInput('Analyze Latest Scan')}
                className="px-4 py-1.5 rounded-full bg-[#0d1117] border border-[#334155] hover:border-[#3b82f6] text-[#94a3b8] hover:text-white text-xs md:text-sm font-mono whitespace-nowrap transition-colors shadow-sm"
              >
                Analyze Latest Scan
              </button>
              <button 
                onClick={() => setAiInput('Explain Open Ports')}
                className="px-4 py-1.5 rounded-full bg-[#0d1117] border border-[#334155] hover:border-[#3b82f6] text-[#94a3b8] hover:text-white text-xs md:text-sm font-mono whitespace-nowrap transition-colors shadow-sm"
              >
                Explain Open Ports
              </button>
              <button 
                onClick={() => setAiInput('Security Recommendations')}
                className="px-4 py-1.5 rounded-full bg-[#0d1117] border border-[#334155] hover:border-[#3b82f6] text-[#94a3b8] hover:text-white text-xs md:text-sm font-mono whitespace-nowrap transition-colors shadow-sm"
              >
                Security Recommendations
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setAiInput('Review Network Risks')}
                className="px-4 py-1.5 rounded-full bg-[#0d1117] border border-[#334155] hover:border-[#3b82f6] text-[#94a3b8] hover:text-white text-xs md:text-sm font-mono whitespace-nowrap transition-colors shadow-sm"
              >
                Review Network Risks
              </button>
              <button 
                onClick={() => setAiInput('Analyze CVE')}
                className="px-4 py-1.5 rounded-full bg-[#0d1117] border border-[#334155] hover:border-[#3b82f6] text-[#94a3b8] hover:text-white text-xs md:text-sm font-mono whitespace-nowrap transition-colors shadow-sm"
              >
                Analyze CVE
              </button>
            </>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleAiSubmit} className="p-3 md:p-4 border-t border-[#21293a] bg-[#0f172a] flex gap-3 flex-shrink-0">
          <input
            type="text"
            required
            placeholder="Ask a security question or request vulnerability analysis..."
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
