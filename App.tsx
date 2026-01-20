
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
import { loadDB, handleDailyCheckIn, syncUserToLeaderboard, saveDB, updateUser } from './store/db.ts';
import { auth, db } from './services/firebaseConfig.ts';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { Loader2, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [appState, setAppState] = useState(loadDB());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        const state = loadDB();
        if (userSnap.exists()) {
          const cloudData = userSnap.data();
          state.user = {
            ...state.user,
            id: firebaseUser.uid,
            name: firebaseUser.displayName || state.user.name,
            email: firebaseUser.email || state.user.email,
            points: cloudData.points || 0,
            level: cloudData.level || 0,
            xpHistory: cloudData.xpHistory || []
          };
          saveDB(state);
        }

        setIsAuthenticated(true);
        handleDailyCheckIn(); 
        await syncUserToLeaderboard();
        setAppState(loadDB());
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshState = () => {
    setAppState(loadDB());
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('ignite_youth_db');
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-600 blur-[60px] opacity-50 animate-pulse" />
          <Zap className="w-16 h-16 text-white relative z-10 fill-current animate-bounce" />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-white font-black uppercase tracking-[0.5em] text-xs">Conectando al Servidor</h2>
          <div className="flex justify-center">
            <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView onLogin={() => setIsAuthenticated(true)} />;
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
