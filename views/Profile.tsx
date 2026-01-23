
import React, { useState, useRef } from 'react';
import { Camera, Edit2, LogOut, Award, Flame, Moon, Sun, Medal, Crown, BookOpen, Music, Heart, Volume2, Share2, Trash2, X, Star, Zap, Shield, Trophy, ChevronRight, Bookmark, Sparkles, AlertTriangle, Bell, BellOff, ToggleLeft, ToggleRight, Loader2, Globe, EyeOff, MessageCircle } from 'lucide-react';
import { User, Badge, BibleVerse, Playlist } from '../types';
import { BADGES } from '../constants';
import { updateUser, loadDB, toggleFavorite, addNotification, togglePlaylistShared } from '../store/db';
import { playAudio } from '../services/geminiService';
import { feedback } from '../services/audioFeedback';
import { shareContent } from '../services/shareService';
import { notificationService } from '../services/notificationService';

const Profile: React.FC<{ user: User, refreshState: () => void, onLogout: () => void }> = ({ user, refreshState, onLogout }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextLevelPoints = Math.pow(user.level + 1, 2) * 100;
  const currentLevelStart = Math.pow(user.level, 2) * 100;
  const progress = ((user.points - currentLevelStart) / (nextLevelPoints - currentLevelStart)) * 100;

  const userPlaylists = (state.playlists || []).filter((p: Playlist) => p.userId === user.id);

  const handleSave = () => {
    feedback.playClick();
    updateUser(u => ({ ...u, name: newName }));
    setIsEditing(false);
    refreshState();
  };

  const handlePhotoClick = () => {
    feedback.playClick();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Guardar la imagen en el estado global
        updateUser(u => ({ ...u, photoUrl: base64String }));
        addNotification('Imagen Consagrada', 'Tu nueva imagen brilla con la luz de Ignite.', 'info');
        feedback.playSuccess();
        refreshState();
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error al cargar imagen:", error);
      setIsUploading(false);
    }
  };

  const toggleGlobalNotifications = async () => {
    feedback.playClick();
    if (!user.notificationsEnabled) {
      const granted = await notificationService.requestPermission();
      if (!granted) return;
    }
    updateUser(u => ({ ...u, notificationsEnabled: !u.notificationsEnabled }));
    refreshState();
  };

  const togglePref = (key: keyof User['notificationPrefs']) => {
    feedback.playClick();
    updateUser(u => ({
      ...u,
      notificationPrefs: {
        ...u.notificationPrefs,
        [key]: !u.notificationPrefs[key]
      }
    }));
    refreshState();
  };

  const getBadgeIcon = (iconName: string, className: string = "w-10 h-10") => {
    switch (iconName) {
      case 'Flame': return <Flame className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Music': return <Music className={className} />;
      case 'Medal': return <Medal className={className} />;
      case 'Crown': return <Crown className={className} />;
      default: return <Award className={className} />;
    }
  };

  const handleToggleFav = (verse: BibleVerse) => {
    feedback.playClick();
    toggleFavorite(verse);
    refreshState();
  };

  return (
    <div className="p-4 sm:p-10 space-y-12 animate-in slide-in-from-bottom duration-700 max-w-4xl mx-auto pb-40">
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture="user" className="hidden" />

      {/* Hero Profile Section */}
      <div className={`relative p-8 sm:p-16 rounded-[4rem] border-2 overflow-hidden ${isDarkMode ? 'bg-amber-950/10 border-amber-500/10' : 'bg-white border-amber-50 shadow-2xl shadow-amber-100/30'}`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[100px] -mr-32 -mt-32" />
        
        <div className="relative z-10 flex flex-col items-center sm:items-start sm:flex-row gap-10">
          <div className="relative group">
            <div className="p-1.5 rounded-full bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-500 shadow-2xl">
              <div className={`p-1.5 rounded-full ${isDarkMode ? 'bg-[#050402]' : 'bg-white'}`}>
                <div className="relative">
                  <img src={user.photoUrl} alt="User" className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover shadow-2xl transition-opacity group-hover:opacity-80" />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={handlePhotoClick}
              disabled={isUploading}
              className="absolute bottom-2 right-2 p-3 bg-amber-600 text-white rounded-2xl shadow-xl border-4 border-white dark:border-[#050402] active:scale-90 transition-all hover:bg-amber-500 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 space-y-6 w-full text-center sm:text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-4">
                {isEditing ? (
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    onBlur={handleSave}
                    className="bg-transparent border-b-4 border-amber-500 text-3xl font-black outline-none max-w-xs text-amber-500"
                    autoFocus
                  />
                ) : (
                  <>
                    <h2 className={`text-4xl sm:text-5xl font-black uppercase tracking-tighter font-heading ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>{user.name}</h2>
                    <button onClick={() => setIsEditing(true)} className="p-2 text-amber-500/40 hover:text-amber-500 transition-all">
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-amber-500 font-black uppercase tracking-[0.5em] text-[10px]">Guerrero de la Luz • Nivel {user.level}</p>
            </div>

            <div className="space-y-3 max-w-sm">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 text-amber-800">Crecimiento Espiritual</span>
                <span className="text-xs font-black text-amber-600">{user.points} / {nextLevelPoints} XP</span>
              </div>
              <div className={`h-4 w-full rounded-full border p-1 shadow-inner overflow-hidden ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-amber-50 border-amber-100'}`}>
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-500 shadow-lg transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <button 
              onClick={() => { feedback.playClick(); setShowLogoutConfirm(true); }} 
              className={`px-8 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${isDarkMode ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-50 text-orange-700'}`}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Bento Stats Dash */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: 'Racha', val: user.streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Guardados', val: user.favorites?.length || 0, icon: Bookmark, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'XP Total', val: user.points, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Logros', val: user.badges.length, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-600/10' },
        ].map((stat, i) => (
          <div key={i} className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center justify-center text-center group transition-all hover:scale-105 ${isDarkMode ? 'bg-amber-950/10 border-white/5' : 'bg-white border-amber-50 shadow-sm'}`}>
            <div className={`p-3 rounded-2xl mb-4 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <span className={`text-3xl font-black font-heading leading-none ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>{stat.val}</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-amber-700/40 mt-2">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Mis Mezclas */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl text-white shadow-lg">
            <Music className="w-6 h-6" />
          </div>
          <h3 className={`text-2xl font-black uppercase tracking-tighter font-heading ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>Mis Mezclas</h3>
        </div>

        {userPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {userPlaylists.map((pl: Playlist) => (
              <div key={pl.id} className={`p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-5 ${isDarkMode ? 'bg-amber-950/10 border-white/5' : 'bg-white border-amber-50 shadow-sm'}`}>
                <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                  <img src={pl.cover} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black uppercase tracking-tight truncate text-sm text-amber-900 dark:text-amber-100">{pl.title}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <button 
                      onClick={() => { feedback.playClick(); togglePlaylistShared(pl.id); refreshState(); }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                        pl.shared ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                      }`}
                    >
                      {pl.shared ? <><Globe className="w-2.5 h-2.5" /> Compartida</> : <><EyeOff className="w-2.5 h-2.5" /> Privada</>}
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => shareContent(pl.title, "Escucha mi frecuencia en Ignite")} 
                  className="p-3 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-12 rounded-[3rem] border-4 border-dashed text-center ${isDarkMode ? 'border-white/5' : 'border-amber-100'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-amber-800 italic">No has creado mezclas aún.</p>
          </div>
        )}
      </section>

      {/* Alertas & Preferencias */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="p-3 bg-amber-600 rounded-2xl text-white shadow-lg">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className={`text-2xl font-black uppercase tracking-tighter font-heading ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>Centro de Alertas</h3>
        </div>

        <div className={`p-8 rounded-[3rem] border-2 space-y-8 ${isDarkMode ? 'bg-amber-950/10 border-white/5' : 'bg-white border-amber-50 shadow-sm'}`}>
          <div className="flex items-center justify-between pb-6 border-b border-amber-500/10">
             <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${user.notificationsEnabled ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                   {user.notificationsEnabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-black uppercase tracking-tight text-sm text-amber-900 dark:text-amber-50">Notificaciones Globales</p>
                  <p className="text-[10px] text-amber-700/40 font-bold uppercase tracking-widest">Activar alertas divinas</p>
                </div>
             </div>
             <button onClick={toggleGlobalNotifications} className="transition-transform active:scale-90">
                {user.notificationsEnabled ? <ToggleRight className="w-12 h-12 text-amber-500" /> : <ToggleLeft className="w-12 h-12 text-slate-300" />}
             </button>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 transition-opacity ${user.notificationsEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
             {[
               { key: 'dailyVerse', label: 'Versículo Diario', icon: <BookOpen className="w-5 h-5" /> },
               { key: 'goals', label: 'Metas y XP', icon: <Trophy className="w-5 h-5" /> },
               { key: 'community', label: 'Muro Vivo', icon: <Sparkles className="w-5 h-5" /> }
             ].map((pref) => (
               <button 
                key={pref.key}
                onClick={() => togglePref(pref.key as any)}
                className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all ${
                  user.notificationPrefs[pref.key as keyof User['notificationPrefs']]
                    ? 'border-amber-500/40 bg-amber-500/5 text-amber-600' 
                    : 'border-white/5 bg-white/5 text-amber-700/40 opacity-60'
                }`}
               >
                 {pref.icon}
                 <span className="text-[10px] font-black uppercase tracking-tighter">{pref.label}</span>
               </button>
             ))}
          </div>
        </div>
      </section>

      {/* Biblioteca de Promesas */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="p-2.5 bg-orange-600 rounded-xl text-white shadow-lg">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <h3 className={`text-2xl font-black uppercase tracking-tighter font-heading ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>Biblioteca de Promesas</h3>
        </div>

        {user.favorites && user.favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.favorites.map((v, i) => (
              <div key={i} className={`p-8 rounded-[2.5rem] border-2 relative overflow-hidden group transition-all ${isDarkMode ? 'bg-amber-950/10 border-white/5 shadow-amber-900/5' : 'bg-white border-amber-50 shadow-sm'}`}>
                <div className="relative z-10 space-y-6">
                  <p className={`text-xl font-medium leading-relaxed italic tracking-tight ${isDarkMode ? 'text-amber-100' : 'text-amber-900'}`}>
                    "{v.text}"
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">{v.book}</span>
                      <p className="text-[9px] text-amber-700/40 font-bold uppercase tracking-widest">{v.chapter}:{v.verse}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => playAudio(v.text)} className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => shareContent(`${v.book} ${v.chapter}:${v.verse}`, v.text)} className="p-3 bg-amber-500/5 text-amber-700/40 rounded-xl">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleFav(v)} className="p-3 bg-orange-500/10 text-orange-600 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-16 rounded-[3rem] border-4 border-dashed text-center ${isDarkMode ? 'border-white/5' : 'border-amber-100'}`}>
             <Bookmark className="w-10 h-10 text-amber-200 mx-auto" />
             <p className="text-xs font-black uppercase tracking-tight opacity-40 text-amber-800">No has guardado promesas todavía.</p>
          </div>
        )}
      </section>

      {/* Logros Finales */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 px-2">
           <div className="p-3 bg-yellow-500 rounded-2xl text-white shadow-lg">
             <Award className="w-6 h-6" />
           </div>
           <h3 className={`text-2xl font-black uppercase tracking-tighter font-heading ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>Muro de Logros</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-6">
          {BADGES.map(badge => {
            const earned = user.badges.some(b => b.id === badge.id);
            return (
              <div 
                key={badge.id} 
                onClick={() => { feedback.playClick(); if(earned) setSelectedBadge(badge); }}
                className={`flex flex-col items-center gap-3 transition-all ${earned ? 'scale-100 cursor-pointer' : 'opacity-10 grayscale'}`}
              >
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg relative ${earned ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-slate-800'}`}>
                  {getBadgeIcon(badge.icon, "w-8 h-8 text-white")}
                  {earned && <div className="absolute -top-1 -right-1 bg-white text-yellow-500 p-1.5 rounded-full shadow-md"><Star className="w-3 h-3 fill-current" /></div>}
                </div>
                <span className={`text-[8px] font-black uppercase text-center tracking-tighter leading-tight max-w-[60px] ${isDarkMode ? 'text-amber-200/40' : 'text-amber-700'}`}>{badge.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl animate-in fade-in">
          <div className={`w-full max-w-sm rounded-[3rem] p-10 space-y-8 text-center border-2 shadow-2xl ${isDarkMode ? 'bg-[#0a0502] border-amber-500/20' : 'bg-white border-amber-100'}`}>
            <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto" />
            <div className="space-y-2">
              <h3 className={`text-2xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>¿Cerrar Sesión?</h3>
              <p className="text-xs text-amber-700/60 font-medium">Tus progresos se guardarán en este dispositivo, hijo mío.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => { feedback.playClick(); onLogout(); }} className="w-full py-5 rounded-2xl bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest shadow-lg">Salir del Hogar</button>
              <button onClick={() => setShowLogoutConfirm(false)} className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest ${isDarkMode ? 'bg-white/5 text-white' : 'bg-amber-50 text-amber-700'}`}>Seguir Camino</button>
            </div>
          </div>
        </div>
      )}

      {/* Badge View Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in">
          <div className={`w-full max-w-md rounded-[4rem] overflow-hidden shadow-2xl border-2 border-amber-500/20 glass animate-in zoom-in-95 ${isDarkMode ? 'bg-[#100802]' : 'bg-white'}`}>
             <div className="h-64 w-full relative flex items-center justify-center bg-gradient-to-br from-amber-600 to-yellow-600">
                <div className="relative z-10 p-10 rounded-[3rem] bg-white/10 backdrop-blur-3xl border-4 border-white/30 shadow-2xl rotate-6">
                   {getBadgeIcon(selectedBadge.icon, "w-20 h-20 text-white")}
                </div>
                <button onClick={() => setSelectedBadge(null)} className="absolute top-8 right-8 p-3 bg-black/20 text-white rounded-full"><X className="w-5 h-5" /></button>
             </div>
             <div className="p-12 text-center space-y-8">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-amber-500">{selectedBadge.name}</h3>
                <p className={`text-lg italic font-medium leading-relaxed ${isDarkMode ? 'text-amber-100/80' : 'text-amber-900/80'}`}>"{selectedBadge.message}"</p>
                <button 
                  onClick={() => shareContent('¡Un nuevo logro!', `¡He ganado el logro ${selectedBadge.name} en Ignite! ✝️✨`)}
                  className="w-full py-5 rounded-[2rem] bg-amber-600 text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 shadow-2xl shadow-amber-600/30"
                >
                  <Share2 className="w-4 h-4" /> Compartir Victoria
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
