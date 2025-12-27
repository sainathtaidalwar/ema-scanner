import { useState } from 'react';
import ScannerDashboard from './components/ScannerDashboard';
import LandingPage from './components/LandingPage';

function App() {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {showScanner ? (
        <div className="p-6">
          <ScannerDashboard />
        </div>
      ) : (
        <LandingPage onEnter={() => setShowScanner(true)} />
      )}
    </div>
  );
}

export default App;
