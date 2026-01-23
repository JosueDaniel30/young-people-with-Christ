
import React, { useState, useEffect, useRef } from 'react';
import { Home, Book, Trophy, User, Music, Sparkles, Bell, X, Moon, Sun, CloudOff, Database, Waves, MessageSquare, MessageCircle, Zap, Trash2, CheckCircle2 } from 'lucide-react';
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
    return () => window.removeEventListener('ignite_db_update', handleUpdate);
  }, []);

  const toggleTheme = () => {
    feedback.playClick();
    const newTheme = isDarkMode ? 'light' : 'dark';
    updateUser(u => ({ ...u, theme: newTheme }));
  };

  const handleOpenNotifications = () => {
    feedback.playClick();
    setShowNotifications(true);
  };

  const handleMarkAsRead = () => {
    feedback.playSuccess();
    markNotificationsRead();
    setState(loadDB());
  };

  const navItems = [
    { id: 'home', icon: Home, color: 'from-amber-600 to-orange-600' },
    { id: 'bible', icon: Book, color: 'from-orange-500 to-amber-700' },
    { id: 'community', icon: MessageSquare, color: 'from-amber-500 to-yellow-600' },
    { id: 'prayer', icon: Waves, color: 'from-orange-600 to-amber-800' },
    { id: 'chat', icon: MessageCircle, color: 'from-yellow-500 to-orange-600' },
    { id: 'profile', icon: User, color: 'from-amber-700 to-orange-900' },
  ];

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-[100dvh] pb-36 transition-colors duration-500 ${isDarkMode ? 'bg-[#111111] text-amber-50' : 'bg-[#fffcf8] text-amber-950'}`}>
      
      {/* Toast de Notificación Rápida */}
      {activeToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-[92%] max-w-md animate-in slide-in-from-top duration-500">
          <div className={`p-5 rounded-3xl border shadow-2xl flex items-center gap-4 backdrop-blur-3xl ${isDarkMode ? 'bg-[#1a1a1a]/90 border-amber-500/40 shadow-amber-900/40' : 'bg-white/90 border-amber-100 shadow-amber-200'}`}>
            <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-2xl shadow-lg ring-2 ring-white/10">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-[9px] uppercase tracking-widest text-amber-500 mb-0.5">{activeToast.title}</h4>
              <p className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activeToast.message}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-amber-400' : 'hover:bg-amber-50 text-amber-500'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Panel Lateral de Notificaciones (Drawer) */}
      <div className={`fixed inset-0 z-[1000] transition-opacity duration-500 ${showNotifications ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowNotifications(false)} />
        <div className={`absolute right-0 top-0 h-full w-full max-w-md transform transition-transform duration-500 ease-out p-6 ${showNotifications ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className={`h-full w-full rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border ${isDarkMode ? 'bg-[#1a1a1a] border-amber-500/20 shadow-black/80' : 'bg-white border-amber-100'}`}>
            
            {/* Header del Panel */}
            <div className="p-8 flex justify-between items-center border-b border-amber-500/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Actividad</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{unreadCount} nuevas</span>
                </div>
              </div>
              <button onClick={() => setShowNotifications(false)} className={`p-3 rounded-2xl transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Notificaciones */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {state.notifications.length > 0 ? (
                state.notifications.map((n) => (
                  <div key={n.id} className={`p-5 rounded-[2rem] border transition-all ${!n.read ? (isDarkMode ? 'bg-amber-500/10 border-amber-500/40' : 'bg-amber-50 border-amber-200') : (isDarkMode ? 'bg-white/5 border-transparent' : 'bg-slate-50 border-transparent opacity-60')}`}>
                    <div className="flex gap-4">
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${n.type === 'award' ? 'bg-yellow-500 text-white' : 'bg-amber-600 text-white'}`}>
                         {n.type === 'award' ? <Trophy className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-current" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{n.title}</h4>
                          {!n.read && <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]" />}
                        </div>
                        <p className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{n.message}</p>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-amber-700/40 mt-2">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                  <div className="w-20 h-20 bg-amber-500/5 rounded-full flex items-center justify-center text-amber-500/20">
                    <Bell className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-800/40">Silencio celestial...</p>
                </div>
              )}
            </div>

            {/* Footer del Panel */}
            {state.notifications.length > 0 && (
              <div className="p-6 border-t border-amber-500/10 bg-amber-500/5">
                <button 
                  onClick={handleMarkAsRead}
                  className="w-full py-4 rounded-2xl bg-amber-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-600/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" /> Marcar como leídas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <header className={`sticky top-0 z-50 transition-all safe-pt backdrop-blur-xl border-b ${isDarkMode ? 'bg-[#111111]/80 border-white/5 shadow-2xl shadow-black/40' : 'bg-white/80 border-amber-100 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-gradient-to-br from-amber-600 via-orange-600 to-yellow-600 rounded-2xl flex items-center justify-center p-2.5 shadow-xl shadow-amber-500/30 ring-1 ring-white/10">
               <Zap className="w-full h-full text-white fill-current" />
             </div>
             <div className="flex flex-col">
               <div className="flex items-center gap-2">
                 <h1 className="text-xl font-black tracking-tighter uppercase leading-none font-heading bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 bg-clip-text text-transparent">Ignite</h1>
                 {!isOnline && (
                   <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-600 text-[6px] font-black uppercase text-white animate-pulse">Offline</div>
                 )}
               </div>
               <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Luz en la Oscuridad</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme} 
              className={`p-3 rounded-2xl shadow-lg border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400' : 'bg-white border-amber-50 text-amber-600 shadow-amber-100'}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleOpenNotifications}
              className={`p-3 rounded-2xl relative shadow-lg border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10 text-amber-400' : 'bg-white border-amber-50 text-amber-600 shadow-amber-100'}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-[#111111] animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {children}
      </main>

      <nav className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-[500px] backdrop-blur-3xl border rounded-[3rem] flex justify-around p-2 z-50 shadow-2xl mb-[env(safe-area-inset-bottom)] transition-all ${isDarkMode ? 'bg-black/80 border-white/10 shadow-amber-900/10' : 'bg-white/80 border-amber-100 shadow-amber-200/50'}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { feedback.playClick(); setActiveTab(item.id); }}
            className={`relative group flex flex-col items-center justify-center p-4 rounded-[2.5rem] transition-all duration-300 ${
              activeTab === item.id 
                ? `bg-gradient-to-br ${item.color} text-white scale-110 shadow-2xl -translate-y-2 ring-4 ring-white/5` 
                : `${isDarkMode ? 'text-amber-500/40 hover:text-amber-400 hover:bg-white/5' : 'text-amber-400 hover:text-amber-600 hover:bg-amber-50'}`
            }`}
          >
            <item.icon className={`w-5 h-5 transition-transform duration-500 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
