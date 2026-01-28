
import React, { useState, useEffect, useRef } from 'react';
import { Home, Book, Trophy, User, MessageSquare, Waves, Zap, Sun, Moon, Bell, X, CheckCircle2 } from 'lucide-react';
import { loadDB, markNotificationsRead, updateUser, subscribeToNotifications } from '../store/db.ts';
import { Notification as NotificationType } from '../types.ts';
import { feedback } from '../services/audioFeedback.ts';
import { auth } from '../services/firebaseConfig';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [state, setState] = useState(loadDB());
  const [activeToast, setActiveToast] = useState<NotificationType | null>(null);
  
  const isDarkMode = state.user.theme === 'dark';

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const handleUpdate = () => setState(loadDB());
    window.addEventListener('ignite_db_update', handleUpdate);

    const unsubscribe = subscribeToNotifications((notifs) => {
      if (notifs.length > 0 && !notifs[0].read) {
        setActiveToast(notifs[0]);
        setTimeout(() => setActiveToast(null), 4000);
      }
    });

    return () => {
      window.removeEventListener('ignite_db_update', handleUpdate);
      unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    feedback.playClick();
    updateUser(u => ({ ...u, theme: isDarkMode ? 'light' : 'dark' }));
  };

  const navItems = [
    { id: 'home', icon: Home, color: 'from-amber-600 to-orange-600' },
    { id: 'bible', icon: Book, color: 'from-orange-500 to-amber-700' },
    { id: 'community', icon: MessageSquare, color: 'from-amber-500 to-yellow-600' },
    { id: 'prayer', icon: Waves, color: 'from-orange-600 to-amber-800' },
    { id: 'profile', icon: User, color: 'from-amber-700 to-orange-900' },
  ];

  return (
    <div className={`min-h-[100dvh] pb-36 transition-colors duration-500 ${isDarkMode ? 'bg-[#111111] text-amber-50' : 'bg-[#fffcf8] text-amber-950'}`}>
      {activeToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md animate-in slide-in-from-top duration-500">
          <div className="p-4 rounded-3xl border shadow-2xl flex items-center gap-4 bg-amber-600 text-white border-white/20">
            <Zap className="w-5 h-5 fill-current" />
            <div className="flex-1">
              <h4 className="font-black text-[8px] uppercase tracking-widest opacity-80">{activeToast.title}</h4>
              <p className="text-sm font-bold">{activeToast.message}</p>
            </div>
            <button onClick={() => setActiveToast(null)}><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <header className={`sticky top-0 z-50 safe-pt backdrop-blur-xl border-b ${isDarkMode ? 'bg-[#111111]/80 border-white/5' : 'bg-white/80 border-amber-100'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Zap className="w-6 h-6 fill-current" /></div>
             <h1 className="text-xl font-black uppercase tracking-tighter bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Ignite</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">{isDarkMode ? <Sun /> : <Moon />}</button>
            <button onClick={() => setShowNotifications(true)} className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 relative">
              {/* Notificaciones locales únicamente */}
              <Bell />
              {state.notifications.some((n:any) => !n.read) && <span className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />}
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <nav className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[500px] backdrop-blur-2xl border rounded-[3rem] flex justify-around p-2 z-50 shadow-2xl ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/80 border-amber-100'}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { feedback.playClick(); setActiveTab(item.id); }}
            className={`p-4 rounded-full transition-all ${activeTab === item.id ? `bg-gradient-to-br ${item.color} text-white scale-110 shadow-xl -translate-y-2` : 'text-amber-500/40'}`}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
