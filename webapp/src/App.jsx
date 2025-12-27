import { useState } from 'react';
import ScannerDashboard from './components/ScannerDashboard';
import LandingPage from './components/LandingPage';
import LearnStrategy from './components/LearnStrategy';

function App() {
  const [view, setView] = useState('home'); // 'home', 'scanner', 'learn'

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {view === 'scanner' && (
        <div className="p-6">
          <ScannerDashboard onBack={() => setView('home')} />
        </div>
      )}

      {view === 'learn' && (
        <LearnStrategy onBack={() => setView('home')} />
      )}

      {view === 'home' && (
        <LandingPage
          onEnter={() => setView('scanner')}
          onLearn={() => setView('learn')}
        />
      )}
    </div>
  );
}

export default App;
