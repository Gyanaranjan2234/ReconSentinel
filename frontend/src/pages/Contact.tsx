import { useState } from 'react';
import logo from '../assets/reconsentinel-logo.png';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    let valid = true;
    const newErrors = { name: '', email: '', subject: '', message: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
      valid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
      valid = false;
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Create mailto link
      const emailTo = 'gyana.tcr20@gmail.com';
      const body = `Name: ${formData.name}%0AEmail: ${formData.email}%0A%0A${formData.message}`;
      const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(body)}`;
      
      // Open default mail client
      window.location.href = mailtoLink;
      
      // Show success notification
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] text-[#f1f5f9] font-sans selection:bg-[#3b82f6]/30 pb-24">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 w-full z-50 bg-[#05080f]/80 backdrop-blur-md border-b border-[#21293a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="ReconSentinel Logo" className="w-[36px] h-[36px] object-contain" />
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
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0f1a] border border-[#21293a] rounded-2xl overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="bg-[#161b27] border-b border-[#21293a] p-8 text-center">
            <div className="inline-block p-3 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] mb-4">
              <Send size={24} />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Contact Support</h1>
            <p className="text-[#94a3b8] text-sm">Please fill out the form below and we will get back to you as soon as possible.</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <AnimatePresence>
              {submitted && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 bg-[#22c55e]/10 border border-[#22c55e]/30 p-4 rounded-lg flex items-center gap-3 text-[#22c55e]"
                >
                  <CheckCircle2 size={20} />
                  <div>
                    <strong className="block text-sm font-bold">Request Prepared!</strong>
                    <span className="text-xs">Your default email client has been opened to send this message.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full bg-[#05080f] border ${errors.name ? 'border-[#ef4444]' : 'border-[#334155]'} rounded p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6] transition-colors`}
                    placeholder="John Doe"
                  />
                  {errors.name && <span className="text-[10px] text-[#ef4444] font-bold">{errors.name}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full bg-[#05080f] border ${errors.email ? 'border-[#ef4444]' : 'border-[#334155]'} rounded p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6] transition-colors`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <span className="text-[10px] text-[#ef4444] font-bold">{errors.email}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className={`w-full bg-[#05080f] border ${errors.subject ? 'border-[#ef4444]' : 'border-[#334155]'} rounded p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6] transition-colors`}
                  placeholder="How can we help?"
                />
                {errors.subject && <span className="text-[10px] text-[#ef4444] font-bold">{errors.subject}</span>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Message</label>
                <textarea 
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className={`w-full bg-[#05080f] border ${errors.message ? 'border-[#ef4444]' : 'border-[#334155]'} rounded p-3 text-sm text-white focus:outline-none focus:border-[#3b82f6] transition-colors resize-none`}
                  placeholder="Describe your issue or request in detail..."
                ></textarea>
                {errors.message && <span className="text-[10px] text-[#ef4444] font-bold">{errors.message}</span>}
              </div>

              <button 
                type="submit"
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white h-[52px] px-8 rounded text-base font-semibold leading-tight tracking-normal transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
              >
                Send Message <Send size={20} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
