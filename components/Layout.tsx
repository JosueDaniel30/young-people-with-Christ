
import React, { useState, useEffect, useRef } from 'react';
import { Home, Book, Trophy, User, Music, Sparkles, Bell, X, Moon, Sun, MessageCircle, Users, Info, Award, Calendar, Download } from 'lucide-react';
import { loadDB, markNotificationsRead, updateUser } from '../store/db';
import { Notification as NotificationType } from '../types';
import { feedback } from '../services/audioFeedback';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [logoError, setLogoError] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [state, setState] = useState(loadDB());
  const [activeToast, setActiveToast] = useState<NotificationType | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const lastToastId = useRef<string | null>(null);
  
  const isDarkMode = state.user.theme === 'dark';

  // Sincronización y PWA
  useEffect(() => {
    // Escuchar el evento de instalación de PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const interval = setInterval(() => {
      const currentState = loadDB();
      setState(currentState);
      
      if (currentState.notifications.length > 0) {
        const latest = currentState.notifications[0];
        if (!latest.read && latest.id !== lastToastId.current) {
          lastToastId.current = latest.id;
          setActiveToast(latest);
          feedback.playNotification();
          setTimeout(() => setActiveToast(null), 5000);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('App instalada');
    }
    setDeferredPrompt(null);
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'bible', icon: Book, label: 'Biblia' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'community', icon: Users, label: 'Comunidad' },
    { id: 'goals', icon: Trophy, label: 'Metas' },
    { id: 'playlists', icon: Music, label: 'Música' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const toggleTheme = () => {
    feedback.playClick();
    const newTheme = isDarkMode ? 'light' : 'dark';
    updateUser(u => ({ ...u, theme: newTheme }));
    setState(loadDB());
  };

  const handleOpenNotifications = () => {
    feedback.playClick();
    setShowNotifications(true);
    markNotificationsRead();
    setState(loadDB());
    setActiveToast(null);
  };

  const handleTabChange = (id: string) => {
    if (id !== activeTab) {
      feedback.playClick();
      setActiveTab(id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'award': return <Award className="w-5 h-5 text-yellow-500" />;
      case 'event': return <Calendar className="w-5 h-5 text-indigo-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className={`min-h-screen pb-24 flex flex-col transition-colors duration-500 ${isDarkMode ? 'dark bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-900'} relative overflow-x-hidden`}>
      
      {/* PWA Install Banner (Solo si está disponible) */}
      {deferredPrompt && activeTab === 'profile' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className={`p-4 rounded-3xl border-2 flex items-center justify-between shadow-2xl backdrop-blur-xl ${isDarkMode ? 'bg-indigo-600/90 border-indigo-400/30' : 'bg-[#1A3A63] border-white/20'} text-white`}>
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5" />
              <p className="text-xs font-black uppercase tracking-widest">Instala Ignite en tu móvil</p>
            </div>
            <button 
              onClick={handleInstallClick}
              className="bg-white text-indigo-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Instalar
            </button>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {activeToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md animate-in slide-in-from-top-10 duration-500 ease-out">
          <div className={`p-5 rounded-[32px] border-2 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-2xl flex items-center gap-4 group transition-all ${
            isDarkMode ? 'bg-slate-800/90 border-indigo-500/30 text-white' : 'bg-white/95 border-indigo-100 text-slate-800'
          }`}>
            <div className={`shrink-0 p-3 rounded-2xl ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
              {getNotificationIcon(activeToast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-xs uppercase tracking-widest text-indigo-500 mb-0.5">{activeToast.title}</h4>
              <p className="text-sm font-bold truncate leading-tight">{activeToast.message}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className="p-2 hover:bg-slate-500/10 rounded-full transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      <header className={`w-full ${isDarkMode ? 'bg-[#1e293b]/80 border-slate-700/50 backdrop-blur-xl' : 'bg-[#1A3A63] border-white/10'} text-white sticky top-0 z-50 shadow-lg border-b`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-xl flex items-center justify-center min-w-[36px] min-h-[36px] shadow-lg">
              {!logoError ? (
                <img src="./logojov.png" alt="Logo" className="w-8 h-8 object-contain" onError={() => setLogoError(true)} />
              ) : (
                <span className="text-sm">✝️</span>
              )}
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-lg font-black tracking-tighter uppercase leading-none">Jóvenes</h1>
              <span className={`text-[10px] sm:text-xs font-serif italic px-2 rounded-full ml-1 w-fit mt-0.5 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white text-[#B91C1C]'}`}>con Cristo</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={toggleTheme} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-indigo-500/20 text-yellow-400 hover:bg-indigo-500/30' : 'bg-white/10 text-slate-200 hover:bg-white/20'}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={handleOpenNotifications} className={`w-10 h-10 rounded-full flex items-center justify-center relative group transition-all duration-300 ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600' : 'bg-white/10 hover:bg-white/20'}`}>
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1e293b] animate-bounce">{unreadCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className={`absolute top-0 left-0 w-full h-96 z-0 pointer-events-none transition-colors duration-1000 ${isDarkMode ? 'bg-gradient-to-b from-indigo-500/10 to-transparent' : 'bg-[#1A3A63]/10'}`} />
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          {children}
        </div>
      </main>

      {showNotifications && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`absolute right-0 top-0 bottom-0 w-full max-w-sm ${isDarkMode ? 'bg-[#1e293b] border-l border-slate-700/50' : 'bg-white'} shadow-2xl flex flex-col animate-in slide-in-from-right duration-500`}>
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <h2 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Notificaciones</h2>
              <button onClick={() => { feedback.playClick(); setShowNotifications(false); }} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {state.notifications.map((n) => (
                <div key={n.id} className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                       {getNotificationIcon(n.type)}
                       <h3 className={`font-bold text-sm ${isDarkMode ? 'text-indigo-300' : 'text-slate-800'}`}>{n.title}</h3>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{n.time}</span>
                  </div>
                  <p className={`text-xs ml-7 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[98%] max-w-[700px] backdrop-blur-2xl border rounded-[36px] flex justify-around p-2 z-50 shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-[#1e293b]/70 border-slate-700/50 shadow-indigo-500/10' : 'bg-white/90 border-slate-200/50'}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`flex flex-col items-center justify-center p-2.5 sm:px-5 rounded-[28px] transition-all duration-300 ${
              activeTab === item.id 
                ? `${isDarkMode ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-[#1A3A63] shadow-blue-200'} text-white scale-105 shadow-lg` 
                : `${isDarkMode ? 'text-slate-500 hover:text-indigo-400 hover:bg-slate-700/30' : 'text-slate-400 hover:text-[#B91C1C]'}`
            }`}
          >
            <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${activeTab === item.id ? 'stroke-[3px]' : ''}`} />
            {activeTab === item.id && (
              <span className="text-[8px] sm:text-[9px] font-black mt-1 uppercase tracking-widest">{item.label}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
