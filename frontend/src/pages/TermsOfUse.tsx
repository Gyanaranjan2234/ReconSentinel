import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05080f] text-[#f1f5f9] font-sans selection:bg-[#3b82f6]/30 pb-24">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 w-full z-50 bg-[#05080f]/80 backdrop-blur-md border-b border-[#21293a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-[#3b82f6]/10 p-1.5 rounded border border-[#3b82f6]/30 text-[#3b82f6]">
              <Shield size={20} />
            </div>
            <span className="font-extrabold text-base md:text-lg tracking-widest text-[#f1f5f9]">
              <span className="text-[#3b82f6]">RECON</span><span className="text-[#22c55e]">SENTINEL</span>
            </span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-[#94a3b8] hover:text-white transition-colors flex items-center gap-2 text-sm font-semibold tracking-wider uppercase"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="border-b border-[#21293a] pb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Terms of Use</h1>
            <p className="text-[#94a3b8] font-mono text-sm">Last Updated: October 2026</p>
          </div>

          <div className="space-y-8 text-[#cbd5e1] leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Lock className="text-[#3b82f6]" size={20} /> 1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using ReconSentinel, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. If you do not accept these terms, you are prohibited from using the platform.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Lock className="text-[#3b82f6]" size={20} /> 2. Authorized Use & Restrictions
              </h2>
              <p>
                ReconSentinel is designed strictly for defensive cybersecurity operations, vulnerability management, and authorized network reconnaissance.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#94a3b8]">
                <li>You must have explicit, written authorization to scan any target infrastructure.</li>
                <li>You shall not use the platform to conduct malicious attacks, denial-of-service, or unauthorized exploitation.</li>
                <li>The platform must not be used in a manner that violates local, state, national, or international law.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Lock className="text-[#3b82f6]" size={20} /> 3. Data Privacy & Telemetry
              </h2>
              <p>
                As a localized security tool, ReconSentinel processes network data primarily within your configured environment. However, when connecting to external Threat Intelligence APIs (e.g., NVD, WHOIS), you agree that non-sensitive metadata such as IP addresses or CVE identifiers may be queried against third-party endpoints.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Lock className="text-[#3b82f6]" size={20} /> 4. Disclaimers and Limitations of Liability
              </h2>
              <p>
                ReconSentinel is provided "AS IS" without warranties of any kind. We do not guarantee that the threat intelligence data is completely accurate or exhaustive. In no event shall the creators of ReconSentinel be liable for any damages arising out of your use or inability to use the platform.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
