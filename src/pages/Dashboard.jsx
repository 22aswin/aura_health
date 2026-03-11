import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import WellnessVisualization from '../components/WellnessVisualization';
import HealthCards from '../components/HealthCards';
import InsightsPanel from '../components/InsightsPanel';
import NutritionScanner from '../components/NutritionScanner';
import AIPanel from '../components/AIPanel';
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { Heart } from 'lucide-react';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const user = auth.currentUser; // Synchronous check is fine here because AuthGuard guaranteed we are logged in

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // AuthGuard will automatically kick them out
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="flex-1 flex">
            {/* Center 3D Visualization */}
            <div className="flex-1 relative">
              <WellnessVisualization />
            </div>

            {/* Right Health Cards Panel */}
            <div className="w-80 p-6 space-y-4 overflow-y-auto">
              <HealthCards />
            </div>

            {/* Far Right Insights Panel */}
            <div className="w-80 p-6 space-y-4 overflow-y-auto border-l border-glass-border">
              <InsightsPanel />
            </div>
          </div>
        );
      case 'mood':
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="glass-card p-12 max-w-lg w-full text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-calm-teal to-calm-purple rounded-3xl flex items-center justify-center shadow-glow mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">How are you feeling?</h2>
              <p className="text-white/70 text-lg mb-8">Take a moment to check in with yourself. The PANAS assessment helps Aura understand your emotional state to provide better wellness suggestions.</p>

              <button
                onClick={() => window.location.href = '/mood-check'}
                className="w-full py-4 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-calm-teal to-calm-blue shadow-glow transform transition-transform hover:scale-105"
              >
                Start Mood Check
              </button>
            </div>
          </div>
        );
      case 'nutrition':
        return <NutritionScanner />;
      case 'ai':
        return <AIPanel />;
      case 'settings':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="glass-card p-8 max-w-md text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
              <p className="text-white/70">Customize your wellness experience</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col p-6 overflow-y-auto w-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 glass-card p-4 mx-2">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-calm-teal to-calm-blue">
              Good Morning, {user?.displayName || user?.email?.split('@')[0]}
            </h1>
            <p className="text-white/60 text-sm mt-1">Your wellness twin is analyzing your data.</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 border border-glass-border px-4 py-2 rounded-xl text-sm transition-colors text-white">
              <span>Sync Device</span>
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 mx-2">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
