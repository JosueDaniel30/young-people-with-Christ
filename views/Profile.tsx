
import React, { useState, useRef } from 'react';
import { Camera, Edit2, LogOut, Award, Flame, Moon, Sun, Medal, Crown, BookOpen, Music, Heart, Volume2, Share2, Trash2, X, Star, Zap, Shield, Trophy, ChevronRight, Bookmark, Sparkles, AlertTriangle, Bell, BellOff, ToggleLeft, ToggleRight, Loader2, Globe, EyeOff, MessageCircle } from 'lucide-react';
import { User, Badge, BibleVerse, Playlist } from '../types';
import { BADGES } from '../constants';
import { updateUser, loadDB, toggleFavorite, addNotification, togglePlaylistShared } from '../store/db';
import { tts } from '../services/ttsService';
import { feedback } from '../services/audioFeedback';
import { shareContent } from '../services/shareService';
import { notificationService } from '../services/notificationService';

const Profile: React.FC<{ user: User, refreshState: () => void, onLogout: () => void }> = ({ user, refreshState, onLogout }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextLevelPoints = Math.pow(user.level + 1, 2) * 100;
  const currentLevelStart = Math.pow(user.level, 2) * 100;
  const progress = ((user.points - currentLevelStart) / (nextLevelPoints - currentLevelStart)) * 100;

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
    const currentEnabled = user.notificationsEnabled;

    if (!currentEnabled) {
      const granted = await notificationService.requestPermission();
      if (!granted) {
        addNotification('Permiso Denegado', 'Activa las notificaciones en tu navegador.', 'info');
        return;
      }
    }

    updateUser(u => ({ ...u, notificationsEnabled: !currentEnabled }));
    if (!currentEnabled) {
      addNotification('Alertas Activas', 'Comunidad sincronizada.', 'info');
      feedback.playSuccess();
    }
    refreshState();
  };

  return (
    <div className="p-4 sm:p-10 space-y-12 animate-in slide-in-from-bottom duration-700 max-w-4xl mx-auto pb-40">
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture="user" className="hidden" />

      {/* Hero Profile */}
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
              onClick={() => { feedback.playClick(); onLogout(); }} 
              className={`px-8 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${isDarkMode ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-50 text-orange-700'}`}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: 'Racha', val: user.streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Guardados', val: user.favorites?.length || 0, icon: Bookmark, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'XP Total', val: user.points, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Logros', val: user.badges?.length || 0, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-600/10' },
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
    </div>
  );
};

export default Profile;
