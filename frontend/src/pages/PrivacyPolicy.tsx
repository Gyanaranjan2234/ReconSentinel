import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
            className="text-[#94a3b8] hover:text-white h-[48px] px-6 rounded text-base font-semibold leading-tight tracking-normal transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} /> Back to Home
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
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Privacy Policy</h1>
            <p className="text-[#94a3b8] font-mono text-sm">Last Updated: October 2026</p>
          </div>

          <div className="space-y-8 text-[#cbd5e1] leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-[#22c55e]" size={20} /> 1. Information We Collect
              </h2>
              <p>
                When utilizing ReconSentinel, the platform primarily operates on your local network or within your configured server environment. The platform may process:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#94a3b8]">
                <li>Local network topologies and open port data.</li>
                <li>Identified service banners and optional OS fingerprints (obtained via standard Nmap TCP/IP probing with no persistent storage).</li>
                <li>Authentication tokens utilized for accessing third-party Threat Intelligence APIs.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-[#22c55e]" size={20} /> 2. Third-Party Data Sharing
              </h2>
              <p>
                ReconSentinel does not sell, distribute, or monetize your scan data. 
                When performing Threat Intelligence lookups, AI analysis, or report generation, specific artifacts (e.g., IP addresses, domain names, service versions, metadata) are transmitted over HTTPS to authorized third-party APIs (including NVD, VirusTotal, and Google Gemini). We recommend reviewing the privacy policies of these external services as they handle real-time data queries on your behalf.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-[#22c55e]" size={20} /> 3. Data Security & Storage
              </h2>
              <p>
                ReconSentinel operates strictly as a stateless security assessment platform. Scan results and network discovery data are processed entirely in real-time. Results are not stored after your session ends unless you explicitly choose to download the generated PDF report. Because there is no persistent storage or database, it is your responsibility to manage and secure any exported reports locally.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-[#22c55e]" size={20} /> 4. Contact Us
              </h2>
              <p>
                If you have any questions or concerns regarding how ReconSentinel handles your data, please contact our security team through the GitHub repository or the Contact Support section on the main platform.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
