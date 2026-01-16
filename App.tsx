
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomeView from './views/Home';
import BibleView from './views/Bible';
import GoalsView from './views/Goals';
import PlaylistsView from './views/Playlists';
import ProfileView from './views/Profile';
import AIChatView from './views/AIChat';
import AuthView from './views/Auth';
import CommunityView from './views/Community';
import { loadDB } from './store/db';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [appState, setAppState] = useState(loadDB());

  useEffect(() => {
    const session = localStorage.getItem('ignite_session');
    if (session) setIsAuthenticated(true);
  }, []);

  const refreshState = () => {
    setAppState(loadDB());
  };

  const handleLogin = () => {
    localStorage.setItem('ignite_session', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('ignite_session');
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  if (!isAuthenticated) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && <HomeView user={appState.user} refreshState={refreshState} setActiveTab={setActiveTab} />}
      {activeTab === 'bible' && <BibleView refreshState={refreshState} />}
      {activeTab === 'chat' && <AIChatView />}
      {activeTab === 'community' && <CommunityView refreshState={refreshState} />}
      {activeTab === 'goals' && <GoalsView goals={appState.goals} refreshState={refreshState} />}
      {activeTab === 'playlists' && <PlaylistsView />}
      {activeTab === 'profile' && <ProfileView user={appState.user} refreshState={refreshState} onLogout={handleLogout} />}
    </Layout>
  );
};

export default App;
