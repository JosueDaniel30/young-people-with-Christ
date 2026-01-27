
import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Star, Shield, ArrowRight, Share2, Medal, Crown, Sparkles, Plus, X, Target, Zap, Clock, CloudCheck, ChevronRight, TrendingUp, Flame, Swords, Activity, Loader2 } from 'lucide-react';
import { Goal } from '../types';
import { loadDB, addGoal, updateGoalProgress } from '../store/db';
import { feedback } from '../services/audioFeedback';
import { shareContent } from '../services/shareService';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Goals: React.FC<{ goals: Goal[], refreshState: () => void }> = ({ goals, refreshState }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  const [showAddModal, setShowAddModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'Bronce' as Goal['type'],
    total: 1,
    period: 'Diario' as Goal['period']
  });

  // Asegurar que el gráfico solo se renderice después del montaje inicial del DOM
  // Esto evita errores de dimensiones width(-1)/height(-1) en Recharts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Procesar datos para el gráfico
  const chartData = useMemo(() => {
    const history = state.user.xpHistory || [];
    const dailyMap = new Map();
    history.forEach(entry => {
      const dateStr = new Date(entry.date).toLocaleDateString([], { day: '2-digit', month: 'short' });
      dailyMap.set(dateStr, entry.points);
    });
    
    const data = Array.from(dailyMap.entries()).map(([date, points]) => ({
      date,
      xp: points
    }));

    return data.length > 0 ? data : [{ date: 'Inicio', xp: state.user.points }];
  }, [state.user.xpHistory, state.user.points]);

  const getTierConfig = (type: string) => {
    switch (type) {
      case 'Bronce': return {
        icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
        color: 'text-orange-400',
        glow: 'shadow-orange-500/20',
        border: 'border-orange-500/30',
        xp: 100
      };
      case 'Plata': return {
        icon: <Medal className="w-6 h-6 sm:w-8 sm:h-8" />,
        color: 'text-amber-400',
        glow: 'shadow-amber-500/20',
        border: 'border-amber-500/30',
        xp: 350
      };
      case 'Oro': return {
        icon: <Crown className="w-6 h-6 sm:w-8 sm:h-8" />,
        color: 'text-yellow-400',
        glow: 'shadow-yellow-500/40',
        border: 'border-yellow-500/40',
        xp: 1000
      };
      default: return {
        icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />,
        color: 'text-amber-400',
        glow: 'shadow-amber-500/20',
        border: 'border-amber-500/30',
        xp: 0
      };
    }
  };

  const handleCreateGoal = () => {
    if (!newGoal.title.trim()) return;
    feedback.playClick();
    addGoal(newGoal);
    setShowAddModal(false);
    setNewGoal({ title: '', type: 'Bronce', total: 1, period: 'Diario' });
    refreshState();
  };

  const currentRewardXP = getTierConfig(newGoal.type).xp;

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-10 space-y-8 sm:space-y-12 animate-in fade-in duration-700 pb-40">
      
      {/* Header Estilo Ignite */}
      <section className={`relative overflow-hidden rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-16 border-2 transition-all ${isDarkMode ? 'bg-amber-950/10 border-amber-500/10 shadow-2xl shadow-black/40' : 'bg-white border-amber-50 shadow-xl shadow-amber-100/30'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-amber-600/10 blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl sm:text-6xl font-black uppercase tracking-tighter font-heading leading-tight">
              CENTRO DE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-500">MISIONES</span>
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-amber-600">{goals.filter(g => !g.completed).length} Activas</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600">{goals.filter(g => g.completed).length} Listas</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { feedback.playClick(); setShowAddModal(true); }}
            className="w-full md:w-auto group relative px-10 py-5 sm:px-12 sm:py-6 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-[1.8rem] sm:rounded-[2.2rem] font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] shadow-2xl shadow-amber-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            <Plus className="w-5 h-5 sm:w-6 h-6 group-hover:rotate-90 transition-transform" />
            Nueva Misión
          </button>
        </div>
      </section>

      {/* Gráfico Progresión (Colores Ignite) */}
      <section className={`p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] border-2 space-y-8 ${isDarkMode ? 'bg-amber-950/5 border-white/5' : 'bg-white border-amber-50 shadow-xl'}`}>
        <div className="flex items-center gap-4">
           <div className="p-3 bg-amber-600 rounded-2xl text-white shadow-lg shadow-amber-600/20">
             <Activity className="w-5 h-5 sm:w-6 h-6" />
           </div>
           <div>
             <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter font-heading">Progresión de Fe</h3>
             <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-amber-700/40">Tu crecimiento espiritual</p>
           </div>
        </div>

        {/* Contenedor con dimensiones explícitas y minWidth para evitar el error de cálculo de Recharts */}
        <div className="h-[250px] sm:h-[350px] w-full mt-4 relative overflow-hidden" style={{ minWidth: 1, minHeight: 200 }}>
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(217,119,6,0.1)'} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 800, fill: isDarkMode ? '#78350f' : '#b45309' }} 
                  dy={10}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    fontSize: '10px',
                    fontWeight: '800'
                  }}
                />
                <Area type="monotone" dataKey="xp" stroke="#d97706" strokeWidth={4} fillOpacity={1} fill="url(#colorXP)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          )}
        </div>
      </section>

      {/* Lista de Metas */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {goals.map((goal) => {
          const config = getTierConfig(goal.type);
          const progressPercent = (goal.progress / goal.total) * 100;

          return (
            <div key={goal.id} className={`p-8 sm:p-10 rounded-[3rem] border-2 transition-all hover:scale-[1.02] relative group ${goal.completed ? (isDarkMode ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100 shadow-emerald-100/20') : (isDarkMode ? 'bg-amber-950/5 border-white/5' : 'bg-white border-amber-50 shadow-xl shadow-amber-100/10')}`}>
              <div className="flex justify-between items-start mb-8">
                 <div className={`p-4 rounded-2xl bg-black/5 ${config.color} ${config.glow} border ${config.border}`}>
                    {config.icon}
                 </div>
                 <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Recompensa</span>
                    <p className={`text-lg font-black ${config.color}`}>+{config.xp} XP</p>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center gap-4">
                  <h4 className={`text-xl font-black uppercase tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{goal.title}</h4>
                  {goal.completed && <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse shrink-0" />}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-700/60">{goal.period}</span>
                    <span className="text-xs font-black text-amber-600">{goal.progress} / {goal.total}</span>
                  </div>
                  <div className={`h-4 w-full rounded-full border p-1 overflow-hidden ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-amber-50 border-amber-100'}`}>
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-500 shadow-lg transition-all duration-1000 ${goal.completed ? 'animate-pulse' : ''}`}
                      style={{ width: `${Math.max(8, progressPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-amber-500/10 flex justify-between items-center">
                  <button onClick={() => shareContent(goal.title, `He progresado en mi meta "${goal.title}" en Ignite! ✨`)} className="p-3 text-amber-700/40 hover:text-amber-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  {!goal.completed && (
                    <button 
                      onClick={() => { feedback.playClick(); updateGoalProgress(goal.id, 1); refreshState(); }}
                      className="px-6 py-3 rounded-xl bg-amber-600 text-white font-black uppercase text-[9px] tracking-widest shadow-lg shadow-amber-600/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                      Avanzar <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Modal Nueva Meta */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in">
           <div className={`w-full max-w-lg rounded-[3.5rem] overflow-hidden border-2 shadow-2xl animate-in zoom-in-95 ${isDarkMode ? 'bg-[#0a0502] border-amber-500/20' : 'bg-white border-white'}`}>
              <div className="h-40 bg-gradient-to-br from-amber-600 to-orange-700 flex flex-col items-center justify-center text-center p-8">
                 <Target className="w-12 h-12 text-white/20 absolute -rotate-12 scale-150" />
                 <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Nueva Misión</h3>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Traza tu camino de luz</p>
                 <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-3 bg-black/20 text-white rounded-full"><X className="w-6 h-6" /></button>
              </div>

              <div className="p-10 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-4">Nombre de la Misión</label>
                  <input 
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="Ej: Leer Salmos"
                    className={`w-full px-8 py-5 rounded-[2rem] border-2 outline-none font-bold text-lg transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white focus:border-amber-500' : 'bg-slate-50 border-transparent focus:bg-white focus:border-amber-600'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-4">Categoría</label>
                    <div className="flex flex-col gap-2">
                       {(['Bronce', 'Plata', 'Oro'] as Goal['type'][]).map(t => (
                         <button 
                          key={t}
                          onClick={() => setNewGoal({...newGoal, type: t})}
                          className={`py-4 rounded-xl font-black uppercase text-[10px] border transition-all ${newGoal.type === t ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-transparent'}`}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-4">Periodicidad</label>
                    <div className="flex flex-col gap-2">
                       {(['Diario', 'Semanal', 'Mensual'] as Goal['period'][]).map(p => (
                         <button 
                          key={p}
                          onClick={() => setNewGoal({...newGoal, period: p})}
                          className={`py-4 rounded-xl font-black uppercase text-[10px] border transition-all ${newGoal.period === p ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-transparent'}`}
                         >
                           {p}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/10">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
                         <Star className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                         <span className="block text-[10px] font-black uppercase tracking-widest">Recompensa XP</span>
                         <span className="text-xl font-black text-amber-600">+{currentRewardXP}</span>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handleCreateGoal}
                  disabled={!newGoal.title.trim()}
                  className="w-full py-6 rounded-[2.2rem] bg-gradient-to-r from-amber-600 to-orange-700 text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-amber-600/30 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  Confirmar Misión
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// Fix: Add missing default export to satisfy App.tsx import
export default Goals;
