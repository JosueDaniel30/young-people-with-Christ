
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import HomeView from './views/Home.tsx';
import BibleView from './views/Bible.tsx';
import GoalsView from './views/Goals.tsx';
import PlaylistsView from './views/Playlists.tsx';
import ProfileView from './views/Profile.tsx';
import AIChatView from './views/AIChat.tsx';
import AuthView from './views/Auth.tsx';
import CommunityView from './views/Community.tsx';
import PrayerRequestsView from './views/PrayerRequests.tsx';
import { loadDB, handleDailyCheckIn, saveDB } from './store/db.ts';
import { startSocialSimulation } from './services/socialSimulator.ts';
import { Loader2, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [appState, setAppState] = useState(loadDB());

  useEffect(() => {
    const init = async () => {
      // Cargamos la base de datos local
      const state = loadDB();
      
      // Si el ID del usuario no es el predeterminado '1', significa que ya se registró
      if (state.user && state.user.id !== '1' && state.user.id !== '') {
        setIsAuthenticated(true);
        handleDailyCheckIn();
        startSocialSimulation();
      }
      
      // Pequeña pausa estética para el splash screen
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };
    init();

    const handleUpdate = () => setAppState(loadDB());
    window.addEventListener('ignite_db_update', handleUpdate);
    return () => window.removeEventListener('ignite_db_update', handleUpdate);
  }, []);

  const refreshState = () => {
    setAppState(loadDB());
  };

  const handleLogout = () => {
    // Solo eliminamos la sesión activa pero mantenemos la DB para no perder la configuración
    const state = loadDB();
    state.user.id = '1'; 
    saveDB(state);
    
    setIsAuthenticated(false);
    setActiveTab('home');
    refreshState();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-600 blur-[80px] opacity-40 animate-pulse" />
          <Zap className="w-24 h-24 text-amber-500 relative z-10 fill-current animate-bounce-slow" />
        </div>
        <div className="space-y-4 text-center">
          <h2 className="text-amber-500 font-black uppercase tracking-[0.8em] text-[10px]">Encendiendo la Llama</h2>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 text-amber-700/40 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView onLogin={() => {
      setIsAuthenticated(true);
      startSocialSimulation();
    }} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && <HomeView user={appState.user} refreshState={refreshState} setActiveTab={setActiveTab} />}
      {activeTab === 'bible' && <BibleView refreshState={refreshState} />}
      {activeTab === 'chat' && <AIChatView />}
      {activeTab === 'community' && <CommunityView refreshState={refreshState} />}
      {activeTab === 'prayer' && <PrayerRequestsView refreshState={refreshState} />}
      {activeTab === 'goals' && <GoalsView goals={appState.goals} refreshState={refreshState} />}
      {activeTab === 'playlists' && <PlaylistsView refreshState={refreshState} />}
      {activeTab === 'profile' && <ProfileView user={appState.user} refreshState={refreshState} onLogout={handleLogout} />}
    </Layout>
  );
};

export default App;
