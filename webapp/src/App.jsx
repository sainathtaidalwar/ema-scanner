import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScannerDashboard from './components/ScannerDashboard';
import LandingPage from './components/LandingPage';
import LearnStrategy from './components/LearnStrategy';
import { ThemeProvider } from './hooks/useTheme';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white transition-colors duration-200">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/scanner" element={<ScannerDashboard />} />
            <Route path="/learn" element={<LearnStrategy />} />
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
