
import React from 'react';
import { Trophy, Star, Shield, ArrowRight, Share2, Medal, Crown, Sparkles } from 'lucide-react';
import { Goal } from '../types';
import { loadDB } from '../store/db';
import { feedback } from '../services/audioFeedback';

const Goals: React.FC<{ goals: Goal[], refreshState: () => void }> = ({ goals, refreshState }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';

  const getIcon = (type: string) => {
    switch (type) {
      case 'Bronce': return <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />;
      case 'Plata': return <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />;
      case 'Oro': return <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />;
      default: return <Star className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'Bronce': return isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600';
      case 'Plata': return isDarkMode ? 'bg-slate-500/10 text-slate-300' : 'bg-slate-100 text-slate-600';
      case 'Oro': return isDarkMode ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-700';
      default: return isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600';
    }
  };

  const getXP = (type: string) => {
    switch (type) {
      case 'Bronce': return '100 XP';
      case 'Plata': return '500 XP';
      case 'Oro': return '2,000 XP';
      default: return 'XP';
    }
  };

  const handleShareAchievements = () => {
    feedback.playClick();
    const completedCount = goals.filter(g => g.completed).length;
    const shareText = `¡Estoy creciendo en mi fe con Jóvenes con Cristo! He completado ${completedCount} metas espirituales y tengo ${state.user.points} XP. ✝️✨`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mis Logros en Ignite Youth',
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else {
      alert("La funcionalidad de compartir no está disponible en este navegador, pero ¡sigue así! " + shareText);
    }
  };

  const handleShareGoal = (goal: Goal) => {
    feedback.playClick();
    const shareText = `¡Meta Cumplida! Acabo de completar "${goal.title}" en la app Jóvenes con Cristo. ¡Gloria a Dios! 🏆🙌`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Meta Completada - Ignite Youth',
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-12 animate-in zoom-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className={`text-3xl sm:text-5xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Tus Metas</h2>
          <p className={`font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] mt-2 ${isDarkMode ? 'text-indigo-400' : 'text-slate-400'}`}>Niveles: Bronce • Plata • Oro</p>
        </div>
        <button 
          onClick={handleShareAchievements}
          className={`w-fit px-8 py-4 rounded-[24px] shadow-sm hover:shadow-xl transition-all active:scale-95 flex items-center gap-3 border ${isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-white border-slate-100 text-slate-600'}`}
        >
          <Share2 className="w-5 h-5 text-indigo-500" />
          <span className="text-xs font-black uppercase tracking-widest">Compartir Logros</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {goals.map((goal) => (
          <div key={goal.id} className={`rounded-[48px] p-10 border relative overflow-hidden group hover:shadow-2xl transition-all duration-700 ${isDarkMode ? 'bg-[#1e293b] border-slate-700/50 hover:border-indigo-500/30' : 'bg-white border-slate-100 shadow-sm'}`}>
            {/* Background glow decoration */}
            <div className={`absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-[2] transition-all duration-1000 ${isDarkMode ? 'text-white' : 'text-indigo-900'}`}>
               {getIcon(goal.type)}
            </div>
            
            <div className="flex flex-col gap-8 relative z-10">
              <div className="flex justify-between items-start">
                <div className={`p-5 rounded-[24px] shadow-sm transition-transform duration-500 group-hover:scale-110 ${getColor(goal.type)}`}>
                  {getIcon(goal.type)}
                </div>
                <div className="text-right">
                  <span className={`block text-[10px] font-black uppercase tracking-[0.25em] mb-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{goal.period}</span>
                  <div className={`flex items-center justify-end gap-1.5 px-3 py-1 rounded-full ${isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{getXP(goal.type)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`font-black text-2xl mb-1.5 uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{goal.title}</h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${goal.completed ? 'text-green-500' : 'text-slate-500'}`}>
                  {goal.completed ? 'Misión Cumplida' : 'Camino al Éxito'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{goal.progress} / {goal.total}</span>
                  <span className={goal.completed ? 'text-green-500' : 'text-indigo-500'}>
                    {Math.round((goal.progress / goal.total) * 100)}%
                  </span>
                </div>
                <div className={`w-full h-4 rounded-full overflow-hidden border p-1 ${isDarkMode ? 'bg-slate-900 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${goal.completed ? 'bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gradient-to-r from-indigo-500 to-violet-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]'}`}
                    style={{ width: `${(goal.progress / goal.total) * 100}%` }}
                  />
                </div>
              </div>
              
              {goal.completed && (
                <div className="pt-2 animate-in slide-in-from-top-4 duration-500 space-y-3">
                  <div className={`flex items-center justify-center gap-3 px-6 py-4 rounded-[24px] border shadow-xl transition-all ${isDarkMode ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-green-500 border-white/20 text-white'}`}>
                    <Medal className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Insignia Desbloqueada</span>
                  </div>
                  <button 
                    onClick={() => handleShareGoal(goal)}
                    className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${isDarkMode ? 'border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500' : 'border-indigo-50 text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Compartir Victoria</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className={`rounded-[64px] p-10 sm:p-16 text-white relative overflow-hidden shadow-2xl transition-all duration-700 ${isDarkMode ? 'bg-[#1e293b] border border-slate-700/50' : 'bg-[#1A3A63]'}`}>
        <div className={`absolute top-[-40px] left-[-40px] w-96 h-96 rounded-full opacity-20 blur-[100px] ${isDarkMode ? 'bg-indigo-500' : 'bg-[#B91C1C]'}`}></div>
        <div className={`absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full opacity-20 blur-[100px] ${isDarkMode ? 'bg-violet-500' : 'bg-[#D97706]'}`}></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="text-center lg:text-left max-w-2xl">
            <h3 className="text-3xl sm:text-5xl font-black mb-6 uppercase tracking-tight leading-none">Comunidad Ignite</h3>
            <p className={`text-sm sm:text-lg font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-indigo-100/70'}`}>
              Tus puntos de fe reflejan tu constancia y pasión por la Palabra. ¡Pronto podrás canjear tu XP por acceso a retiros exclusivos, merch de la iglesia y mentorías especiales!
            </p>
          </div>
          <button className={`w-full lg:w-fit px-12 py-6 rounded-[32px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 hover:scale-105 transition-all active:scale-95 shadow-2xl group ${isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30' : 'bg-white text-[#1A3A63]'}`}>
            VER RANKING GLOBAL
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Goals;
