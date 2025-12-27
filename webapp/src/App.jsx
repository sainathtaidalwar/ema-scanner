import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScannerDashboard from './components/ScannerDashboard';
import LandingPage from './components/LandingPage';
import LearnStrategy from './components/LearnStrategy';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-900 text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scanner" element={<ScannerDashboard />} />
          <Route path="/learn" element={<LearnStrategy />} />
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
