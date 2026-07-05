import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contact from './pages/Contact';
import Documentation from './pages/Documentation';
import ReconConsole from './pages/ReconConsole';
import ThreatIntelligence from './pages/ThreatIntelligence';
import NetworkMap from './pages/NetworkMap';
import AIAssistant from './pages/AIAssistant';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/recon-console" element={<ReconConsole />} />
          <Route path="/intel" element={<ThreatIntelligence />} />
          <Route path="/network-map" element={<NetworkMap />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
        </Route>
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/documentation" element={<Documentation />} />
        
        {/* Legacy redirect */}
        <Route path="/dashboard" element={<Navigate to="/recon-console" replace />} />
      </Routes>
      <ScrollToTop />
    </Router>
  );
}

export default App;
