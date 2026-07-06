import logo from '../assets/reconsentinel-logo.png';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-card border-b border-border shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5">
              <img src={logo} alt="ReconSentinel Logo" className="w-[36px] h-[36px] object-contain" />
              <span className="font-extrabold text-xl tracking-wider text-white">
                <span className="text-[#3b82f6]">RECON</span><span className="text-[#22c55e]">SENTINEL</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/30">
              <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
              Secure Sandbox
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
