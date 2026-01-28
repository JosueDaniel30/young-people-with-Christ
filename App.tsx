
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import HomeView from './views/Home.tsx';
import BibleView from './views/Bible.tsx';
import GoalsView from './views/Goals.tsx';
import ProfileView from './views/Profile.tsx';
import AuthView from './views/Auth.tsx';
import CommunityView from './views/Community.tsx';
import PrayerRequestsView from './views/PrayerRequests.tsx';
import { loadDB, handleDailyCheckIn, saveDB } from './store/db.ts';
import { auth } from './services/firebaseConfig';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Loader2, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [appState, setAppState] = useState(loadDB());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        handleDailyCheckIn();
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    const handleUpdate = () => setAppState(loadDB());
    window.addEventListener('ignite_db_update', handleUpdate);
    
    return () => {
      unsubscribe();
      window.removeEventListener('ignite_db_update', handleUpdate);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center gap-6">
      <Zap className="w-16 h-16 text-amber-500 animate-bounce" />
      <Loader2 className="animate-spin text-amber-600" />
    </div>
  );

  if (!isAuthenticated) return <AuthView onLogin={() => setIsAuthenticated(true)} />;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && <HomeView user={appState.user} refreshState={() => setAppState(loadDB())} setActiveTab={setActiveTab} />}
      {activeTab === 'bible' && <BibleView refreshState={() => setAppState(loadDB())} />}
      {activeTab === 'community' && <CommunityView refreshState={() => setAppState(loadDB())} />}
      {activeTab === 'prayer' && <PrayerRequestsView refreshState={() => setAppState(loadDB())} />}
      {activeTab === 'goals' && <GoalsView goals={appState.goals} refreshState={() => setAppState(loadDB())} />}
      {activeTab === 'profile' && <ProfileView user={appState.user} refreshState={() => setAppState(loadDB())} onLogout={handleLogout} setActiveTab={setActiveTab} />}
    </Layout>
  );
};

export default App;
