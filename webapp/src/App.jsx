import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScannerDashboard from './components/ScannerDashboard';
import LandingPage from './components/LandingPage';
import LearnStrategy from './components/LearnStrategy';
import Backtests from './components/Backtests';


function App() {
  return (
    <BrowserRouter>
      {/* Reverted to single dark theme */}
      <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-indigo-500/30">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scanner" element={<ScannerDashboard />} />
          <Route path="/learn" element={<LearnStrategy />} />
          <Route path="/backtests" element={<Backtests />} />
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
