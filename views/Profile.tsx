
import React, { useState } from 'react';
import { Camera, Edit2, LogOut, Award, Flame, Settings, Moon, Sun, Medal, Crown, BookOpen, Music, Heart, Volume2, Share2, Trash2, X, Calendar, Sparkles, Trophy } from 'lucide-react';
import { User, Badge, BibleVerse } from '../types';
import { BADGES } from '../constants';
import { updateUser, loadDB, toggleFavorite } from '../store/db';
import { playAudio } from '../services/geminiService';
import { feedback } from '../services/audioFeedback';

interface ProfileProps {
  user: User;
  refreshState: () => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, refreshState, onLogout }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const handleSave = () => {
    feedback.playClick();
    updateUser(u => ({ ...u, name: newName }));
    setIsEditing(false);
    refreshState();
  };

  const toggleTheme = () => {
    feedback.playClick();
    const newTheme = isDarkMode ? 'light' : 'dark';
    updateUser(u => ({ ...u, theme: newTheme }));
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

  const handleRemoveFavorite = (verse: BibleVerse) => {
    feedback.playClick();
    toggleFavorite(verse);
    refreshState();
  };

  const handleShareFavorite = (verse: BibleVerse) => {
    feedback.playClick();
    if (navigator.share) {
      navigator.share({
        title: 'Versículo Favorito - Jóvenes con Cristo',
        text: `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`,
        url: window.location.href
      });
    }
  };

  const handleBadgeClick = (badge: Badge, isEarned: boolean) => {
    feedback.playClick();
    if (isEarned) {
      const userBadge = user.badges.find(b => b.id === badge.id);
      setSelectedBadge({
        ...badge,
        dateEarned: userBadge?.dateEarned || 'Recientemente'
      });
    } else {
      // Opcional: mostrar qué se necesita para ganarla
      setSelectedBadge({
        ...badge,
        dateEarned: 'Bloqueada',
        message: '¡Sigue perseverando para desbloquear este honor!'
      });
    }
  };

  const handleShareBadge = (badge: Badge) => {
    feedback.playClick();
    const shareText = `¡He ganado la insignia "${badge.name}" en Ignite Youth! 🏆✨\n"${badge.message}"`;
    if (navigator.share) {
      navigator.share({
        title: 'Mi Logro Ignite',
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    }
  };

  const earnedBadgeIds = user.badges.map(b => b.id);

  return (
    <div className="p-6 sm:p-10 space-y-10 animate-in slide-in-from-bottom duration-300">
      <div className="flex flex-col items-center pt-8 relative max-w-2xl mx-auto">
        <div className="relative group">
          <div className={`p-1 rounded-full ${isDarkMode ? 'bg-indigo-500' : 'bg-[#1A3A63]'} shadow-2xl`}>
            <img 
              src={user.photoUrl} 
              alt="User" 
              className="w-40 h-40 rounded-full object-cover border-4 border-white dark:border-slate-800" 
              onError={(e) => {
                e.currentTarget.src = './logojov.png';
              }}
            />
          </div>
          <button className="absolute bottom-2 right-2 p-3 bg-[#B91C1C] text-white rounded-full border-4 border-white dark:border-slate-800 shadow-lg hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-6 text-center">
          {isEditing ? (
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className={`border-2 rounded-2xl px-6 py-2 text-center font-black text-2xl outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-indigo-100 text-slate-800 focus:border-indigo-500'}`}
              />
              <button onClick={handleSave} className="bg-indigo-600 text-white p-3 rounded-2xl font-bold">OK</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <h2 className={`text-3xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{user.name}</h2>
                <button onClick={() => { feedback.playClick(); setIsEditing(true); }} className="text-slate-400 hover:text-indigo-500 transition-colors">
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest">{user.email}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 mt-10 w-full">
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-[40px] border text-center shadow-sm relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full" />
            <span className="block text-4xl font-black text-indigo-500 group-hover:scale-110 transition-transform">{user.points}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-2 block">Fe Points</span>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-8 rounded-[40px] border text-center shadow-sm relative overflow-hidden group`}>
             <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-bl-full" />
            <span className="block text-4xl font-black text-orange-500 group-hover:scale-110 transition-transform">7</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-2 block">Días Racha</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-12">
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`font-black uppercase tracking-widest text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <Award className="w-5 h-5 text-yellow-500" />
              Insignias Ganadas
            </h3>
            <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              {user.badges.length} de {BADGES.length}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-6">
            {BADGES.map(badge => {
              const isEarned = earnedBadgeIds.includes(badge.id);
              return (
                <div 
                  key={badge.id} 
                  onClick={() => handleBadgeClick(badge, isEarned)}
                  className={`flex flex-col items-center gap-3 transition-all duration-500 cursor-pointer ${isEarned ? 'scale-100 hover:scale-110 active:scale-95' : 'opacity-20 grayscale'}`}
                >
                  <div className={`w-20 h-20 rounded-[28px] ${isEarned ? badge.color : isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} flex items-center justify-center text-white shadow-xl relative overflow-hidden group`}>
                    {isEarned && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                    <div className="relative z-10 transition-transform group-hover:rotate-12">
                      {getBadgeIcon(badge.icon)}
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-center px-2 leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`font-black uppercase tracking-widest text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              Versículos Favoritos
            </h3>
          </div>
          {user.favorites.length > 0 ? (
            <div className="space-y-4">
              {user.favorites.map((fv, i) => (
                <div key={i} className={`p-6 rounded-[32px] border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      {fv.book} {fv.chapter}:{fv.verse}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => { feedback.playClick(); playAudio(fv.text); }} className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-400" title="Escuchar">
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleShareFavorite(fv)} className="p-2 rounded-full hover:bg-green-50 dark:hover:bg-slate-700 text-green-500" title="Compartir">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRemoveFavorite(fv)} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-slate-700 text-red-500" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm italic leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    "{fv.text}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-10 rounded-[40px] border border-dashed text-center ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest">Guarda tus versículos favoritos</p>
            </div>
          )}
        </section>

        <div className="space-y-4 pt-10 border-t border-slate-100 dark:border-slate-800">
          <button onClick={toggleTheme} className={`w-full flex items-center justify-between p-6 rounded-[32px] font-black uppercase tracking-widest text-xs transition-all ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-700'}`}>
            <div className="flex items-center gap-4">
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
              <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </div>
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-4 p-6 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-[32px] font-black uppercase tracking-widest text-xs">
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Badge Detail Modal Enhanced */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white'} w-full max-w-lg rounded-[64px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 border-4 border-white/10 relative`}>
            {/* Header Decorativo con Icono Grande */}
            <div className={`h-48 w-full relative overflow-hidden flex items-center justify-center ${earnedBadgeIds.includes(selectedBadge.id) ? selectedBadge.color : 'bg-slate-600'}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12 scale-150">
                 {getBadgeIcon(selectedBadge.icon, "w-64 h-64")}
              </div>
              
              <div className="relative z-10 p-10 rounded-[48px] bg-white/10 backdrop-blur-3xl border-4 border-white/30 shadow-2xl transform hover:rotate-6 transition-transform duration-700">
                 {getBadgeIcon(selectedBadge.icon, "w-20 h-20 text-white")}
              </div>

              <button 
                onClick={() => { feedback.playClick(); setSelectedBadge(null); }} 
                className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all z-20"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 space-y-8 text-center">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 mb-1">
                   <Sparkles className="w-5 h-5 text-yellow-500" />
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500">Misión Cumplida</span>
                   <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>
                <h3 className={`text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {selectedBadge.name}
                </h3>
                {earnedBadgeIds.includes(selectedBadge.id) && (
                  <div className="flex items-center justify-center gap-2 text-slate-500 pt-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Logrado el: {selectedBadge.dateEarned}</span>
                  </div>
                )}
              </div>

              <div className={`p-8 rounded-[40px] border-2 space-y-4 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Mérito obtenido por:
                </p>
                <p className={`text-lg sm:text-xl font-bold leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  {selectedBadge.description || "Dedicación excepcional a tu crecimiento espiritual."}
                </p>
              </div>

              <div className="space-y-4 px-4">
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500">Sabiduría Ignite</p>
                 <p className={`text-2xl sm:text-3xl font-serif-italic italic tracking-tight leading-snug ${isDarkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>
                    "{selectedBadge.message || "Tu fe es la llama que ilumina el camino de otros."}"
                 </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => handleShareBadge(selectedBadge)}
                  className={`flex-1 py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-[#1A3A63] text-white hover:bg-[#152e4f]'}`}
                >
                  <Share2 className="w-5 h-5" />
                  Compartir Logro
                </button>
                <button 
                  onClick={() => { feedback.playClick(); setSelectedBadge(null); }}
                  className={`flex-1 py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all border-2 ${isDarkMode ? 'border-slate-700 text-slate-400 hover:text-white' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
