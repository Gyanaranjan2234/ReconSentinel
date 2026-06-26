import React, { useState } from 'react';
import { 
  ShieldAlert, 
  RotateCw, 
  Globe, 
  Search
} from 'lucide-react';
import axios from 'axios';
import { ThreatIntel } from '../types';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function ThreatIntelligence() {
  const [intelQuery, setIntelQuery] = useState('');
  const [intelType, setIntelType] = useState('CVE');
  const [intelResult, setIntelResult] = useState<ThreatIntel | null>(null);
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelValidationError, setIntelValidationError] = useState('');
  
  const navigate = useNavigate();

  const handleIntelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intelQuery) return;
    
    setIntelValidationError('');
    
    if (intelType === 'CVE') {
      const cveRegex = /^CVE-\d{4}-\d{4,7}$/i;
      if (!cveRegex.test(intelQuery)) {
        setIntelValidationError('Please enter a valid CVE format (e.g. CVE-2021-40438).');
        return;
      }
    } else if (intelType === 'IP') {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/;
      if (!ipRegex.test(intelQuery)) {
        setIntelValidationError('Please enter a valid IP address.');
        return;
      }
    } else if (intelType === 'Domain') {
      const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
      if (!domainRegex.test(intelQuery)) {
        setIntelValidationError('Please enter a valid domain name.');
        return;
      }
    }

    setIntelLoading(true);
    try {
      const response = await axios.get(`/api/intel/lookup?query=${encodeURIComponent(intelQuery)}&type=${intelType}`);
      setIntelResult(response.data);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setIntelValidationError(err.response.data.detail);
      } else {
        setIntelValidationError('Failed to fetch threat intel.');
      }
    } finally {
      setIntelLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <PageHeader 
        title="Threat Intelligence" 
        subtitle="Query global feeds for vulnerabilities, IP reputation, and domain intelligence." 
      />

      <div className="bg-[#161b27] border border-[#21293a] rounded-xl p-6 md:p-8 shadow-xl max-w-[1050px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-[#21293a] pb-4">
          <h3 className="text-lg font-bold tracking-wider text-[#f1f5f9] uppercase flex items-center gap-3">
            <ShieldAlert className="text-[#eab308]" size={20} /> Threat Intel Analyzer
          </h3>
          <span className="text-sm text-[#94a3b8] flex items-center gap-2 mt-2 sm:mt-0">
            <Globe size={14} /> Global Feed Stub
          </span>
        </div>
        
        <form onSubmit={handleIntelSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Lookup Query</label>
              <input
                type="text"
                required
                placeholder={intelType === 'CVE' ? 'e.g. CVE-2021-40438' : intelType === 'IP' ? 'e.g. 8.8.8.8 or 1.1.1.1' : 'e.g. google.com or example.org'}
                value={intelQuery}
                onChange={(e) => setIntelQuery(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#21293a] rounded-lg px-4 py-3 text-base text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] placeholder-[#475569] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#475569] uppercase tracking-wider mb-2">Type</label>
              <select
                value={intelType}
                onChange={(e) => {
                  setIntelType(e.target.value);
                  setIntelValidationError('');
                }}
                className="w-full bg-[#0d1117] border border-[#21293a] rounded-lg px-4 py-3 text-base text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6] transition-all"
              >
                <option value="CVE">CVE</option>
                <option value="Domain">Domain</option>
                <option value="IP">IP</option>
              </select>
            </div>
          </div>
          
          {intelValidationError && (
            <div className="text-sm text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg p-4">
              {intelValidationError}
            </div>
          )}
          
          <div className="text-sm text-[#94a3b8] bg-[#0d1117] border border-[#21293a] rounded-lg p-3 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              Data Source:{' '}
              <strong className="text-white">
                {intelType === 'CVE' && 'National Vulnerability Database (NVD)'}
                {intelType === 'IP' && 'AbuseIPDB + IPInfo'}
                {intelType === 'Domain' && 'WHOIS + DNS Lookup + VirusTotal'}
              </strong>
            </span>
            <span className="text-[#3b82f6] font-semibold">Connection: Secure HTTPS</span>
          </div>
          
          <button
            type="submit"
            disabled={intelLoading}
            className="w-full bg-[#eab308] hover:bg-[#ca8a04] disabled:bg-[#21293a] disabled:text-[#475569] text-[#0f172a] text-base font-semibold leading-tight tracking-normal h-[52px] px-8 rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-4"
          >
            {intelLoading ? (
              <>
                <RotateCw size={20} className="animate-spin" /> Querying Feeds...
              </>
            ) : (
              <>
                <Search size={20} /> Analyze Threat Intel
              </>
            )}
          </button>
        </form>
      </div>

      {intelResult && (
        <div className="bg-[#161b27] border border-[#21293a] rounded-xl p-6 md:p-8 shadow-xl animate-fadeIn mt-8 max-w-[1050px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-[#21293a] pb-4">
            <h4 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Globe className="text-[#3b82f6]" size={20} /> Intel Analysis for {intelResult.query} <span className="text-[#94a3b8] text-sm bg-[#0d1117] px-2 py-1 rounded ml-2 border border-[#21293a]">({intelResult.intelligence_type})</span>
            </h4>
            <button 
              onClick={() => setIntelResult(null)}
              className="text-base font-semibold leading-tight tracking-normal text-[#94a3b8] hover:text-[#f1f5f9] mt-2 sm:mt-0 h-[48px] px-6 bg-[#0d1117] rounded border border-[#21293a] flex items-center justify-center"
            >
              Clear Results
            </button>
          </div>
          <div className="bg-[#0d1117] p-6 rounded-lg border border-[#21293a] font-mono text-sm md:text-base text-[#cbd5e1] whitespace-pre-line leading-relaxed">
            {intelResult.summary}
          </div>
          
          {intelType === 'IP' && intelResult.summary && (
            <div className="mt-6">
              <button
                onClick={() => navigate(`/recon-console?target=${encodeURIComponent(intelResult.query)}`)}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white h-[48px] px-6 rounded-lg text-base font-semibold leading-tight tracking-normal transition-colors flex items-center justify-center gap-2"
              >
                Run Scan on this IP
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
