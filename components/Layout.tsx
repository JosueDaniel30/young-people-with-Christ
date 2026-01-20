
import React, { useState, useEffect, useRef } from 'react';
import { Home, Book, Trophy, User, Music, Sparkles, Bell, X, Moon, Sun, MessageCircle, Zap, CloudOff, Wifi, Info, Database, Cloud, Waves, MessageSquare } from 'lucide-react';
import { loadDB, markNotificationsRead, updateUser } from '../store/db.ts';
import { Notification as NotificationType } from '../types.ts';
import { feedback } from '../services/audioFeedback.ts';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [state, setState] = useState(loadDB());
  const [activeToast, setActiveToast] = useState<NotificationType | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const lastToastId = useRef<string | null>(null);
  
  const isDarkMode = state.user.theme === 'dark';

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      feedback.playNotification();
    };
    const handleOffline = () => {
      setIsOnline(false);
      feedback.playNotification();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleUpdate = () => {
      const currentState = loadDB();
      setState(currentState);
      if (currentState.notifications.length > 0) {
        const latest = currentState.notifications[0];
        if (!latest.read && latest.id !== lastToastId.current) {
          lastToastId.current = latest.id;
          setActiveToast(latest);
          setTimeout(() => setActiveToast(null), 4000);
        }
      }
    };
    window.addEventListener('ignite_db_update', handleUpdate);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('ignite_db_update', handleUpdate);
    };
  }, []);

  const toggleTheme = () => {
    feedback.playClick();
    const newTheme = isDarkMode ? 'light' : 'dark';
    updateUser(u => ({ ...u, theme: newTheme }));
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio', color: 'from-violet-600 to-fuchsia-600' },
    { id: 'bible', icon: Book, label: 'Biblia', color: 'from-fuchsia-500 to-rose-500' },
    { id: 'community', icon: MessageSquare, label: 'Muro', color: 'from-violet-500 to-indigo-500' },
    { id: 'prayer', icon: Waves, label: 'Oración', color: 'from-cyan-500 to-blue-500' },
    { id: 'chat', icon: MessageCircle, label: 'Mentor', color: 'from-indigo-500 to-purple-600' },
    { id: 'profile', icon: User, label: 'Perfil', color: 'from-violet-500 to-indigo-700' },
  ];

  const hasCache = state.bibleCache.length > 0;

  return (
    <div className={`min-h-[100dvh] pb-36 transition-colors duration-500 ${isDarkMode ? 'bg-[#030014] text-slate-100' : 'bg-[#f8faff] text-slate-900'}`}>
      
      {activeToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-md animate-in slide-in-from-top duration-500">
          <div className={`p-5 rounded-3xl border shadow-2xl flex items-center gap-4 backdrop-blur-3xl ${isDarkMode ? 'bg-slate-900/90 border-violet-500/40 shadow-violet-900/20' : 'bg-white/90 border-violet-100 shadow-violet-200'}`}>
            <div className="p-3 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-2xl shadow-lg ring-2 ring-white/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-[9px] uppercase tracking-widest text-violet-500 mb-0.5">{activeToast.title}</h4>
              <p className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activeToast.message}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <header className={`sticky top-0 z-50 transition-all safe-pt backdrop-blur-xl border-b ${isDarkMode ? 'bg-[#030014]/80 border-white/5' : 'bg-white/80 border-violet-100'}`}>
        {!isOnline && (
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 bg-[length:200%_auto] animate-[gradient-xy_3s_linear_infinite] text-white py-3 px-6 flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <CloudOff className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Desconectado del Mundo</span>
                <span className="text-[8px] font-bold opacity-80 uppercase tracking-widest mt-1">Sincronización pausada</span>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 rounded-2xl flex items-center justify-center p-2.5 shadow-xl shadow-violet-500/30 ring-1 ring-white/10">
               <Zap className="w-full h-full text-white fill-current" />
             </div>
             <div className="flex flex-col">
               <div className="flex items-center gap-2">
                 <h1 className="text-xl font-black tracking-tighter uppercase leading-none font-heading bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">Ignite</h1>
                 {!isOnline ? (
                   <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500 text-white shadow-lg animate-bounce">
                     <Database className="w-2.5 h-2.5" />
                     <span className="text-[7px] font-black uppercase tracking-widest">Cache</span>
                   </div>
                 ) : (
                   <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500">Live</span>
                   </div>
                 )}
               </div>
               <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-violet-400' : 'text-slate-400'}`}>The Future Is Now</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme} 
              className={`p-3 rounded-2xl shadow-lg transition-all active:scale-90 border ${isDarkMode ? 'bg-white/5 border-white/10 text-amber-400' : 'bg-white border-violet-50 text-violet-600 shadow-violet-100'}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => { feedback.playClick(); setShowNotifications(true); }}
              className={`p-3 rounded-2xl relative shadow-lg transition-all active:scale-90 border ${isDarkMode ? 'bg-white/5 border-white/10 text-violet-400' : 'bg-white border-violet-50 text-violet-600 shadow-violet-100'}`}
            >
              <Bell className="w-5 h-5" />
              {state.notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-[#030014] animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {children}
      </main>

      <nav className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-[600px] backdrop-blur-3xl border rounded-[3rem] flex justify-around p-2 z-50 shadow-2xl mb-[env(safe-area-inset-bottom)] transition-all ${isDarkMode ? 'bg-black/80 border-white/10 shadow-black/60' : 'bg-white/80 border-violet-100 shadow-violet-200/50'}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { feedback.playClick(); setActiveTab(item.id); }}
            className={`relative group flex flex-col items-center justify-center p-4 rounded-[2.5rem] transition-all duration-300 ${
              activeTab === item.id 
                ? `bg-gradient-to-br ${item.color} text-white scale-110 shadow-2xl -translate-y-2 ring-4 ring-white/5` 
                : `${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50'}`
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-500 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            {activeTab === item.id && (
              <span className="absolute -bottom-1.5 w-1 h-1 bg-white rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
