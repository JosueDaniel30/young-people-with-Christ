import React, { useState, useMemo } from 'react';
import { Trophy, Star, Shield, ArrowRight, Share2, Medal, Crown, Sparkles, Plus, X, Target, Zap, Clock, CloudCheck, ChevronRight, TrendingUp, Flame, Swords, Activity } from 'lucide-react';
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
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'Bronce' as Goal['type'],
    total: 1,
    period: 'Diario' as Goal['period']
  });

  // Procesar datos para el gráfico
  const chartData = useMemo(() => {
    const history = state.user.xpHistory || [];
    // Agrupar por día para que el gráfico sea más limpio
    const dailyMap = new Map();
    history.forEach(entry => {
      const dateStr = new Date(entry.date).toLocaleDateString([], { day: '2-digit', month: 'short' });
      dailyMap.set(dateStr, entry.points);
    });
    
    return Array.from(dailyMap.entries()).map(([date, points]) => ({
      date,
      xp: points
    }));
  }, [state.user.xpHistory]);

  const getTierConfig = (type: string) => {
    switch (type) {
      case 'Bronce': return {
        icon: <Shield className="w-8 h-8" />,
        color: 'text-orange-400',
        glow: 'shadow-orange-500/20',
        border: 'border-orange-500/30',
        bg: isDarkMode ? 'bg-orange-500/5' : 'bg-orange-50',
        xp: 100
      };
      case 'Plata': return {
        icon: <Medal className="w-8 h-8" />,
        color: 'text-cyan-400',
        glow: 'shadow-cyan-500/20',
        border: 'border-cyan-500/30',
        bg: isDarkMode ? 'bg-cyan-500/5' : 'bg-cyan-50',
        xp: 350
      };
      case 'Oro': return {
        icon: <Crown className="w-8 h-8" />,
        color: 'text-yellow-400',
        glow: 'shadow-yellow-500/40',
        border: 'border-yellow-500/40',
        bg: isDarkMode ? 'bg-yellow-500/5' : 'bg-yellow-50',
        xp: 1000
      };
      default: return {
        icon: <Target className="w-8 h-8" />,
        color: 'text-violet-400',
        glow: 'shadow-violet-500/20',
        border: 'border-violet-500/30',
        bg: 'bg-violet-500/5',
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

  return (
    <div className="p-4 sm:p-10 space-y-12 animate-in zoom-in duration-500 pb-32">
      
      {/* Dynamic Status Header */}
      <section className="relative overflow-hidden rounded-[4rem] p-10 sm:p-16 glass border-2 border-violet-500/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 blur-[120px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter font-heading leading-none">
              CENTRO DE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500">MISIONES</span>
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">{goals.filter(g => !g.completed).length} Activas</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                <CloudCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{goals.filter(g => g.completed).length} Completadas</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { feedback.playClick(); setShowAddModal(true); }}
            className="group relative px-12 py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-[2.2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-violet-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            Nueva Quest
          </button>
        </div>
      </section>

      {/* Charts Section: Progresión de Fe */}
      <section className={`p-8 sm:p-12 rounded-[3rem] border-2 space-y-8 ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-violet-50 shadow-xl shadow-violet-100/30'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-violet-600 rounded-2xl text-white shadow-lg">
               <Activity className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-xl font-black uppercase tracking-tighter font-heading">Progresión de Fe</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tu crecimiento espiritual en el tiempo</p>
             </div>
          </div>
        </div>

        <div className="h-[300px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.1)'} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 800, fill: isDarkMode ? '#94a3b8' : '#64748b' }} 
                dy={10}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#0f172a' : '#fff', 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  fontSize: '10px',
                  fontWeight: '800',
                  textTransform: 'uppercase'
                }}
                itemStyle={{ color: '#7c3aed' }}
              />
              <Area 
                type="monotone" 
                dataKey="xp" 
                stroke="#7c3aed" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorXP)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {goals.map((goal) => {
          const config = getTierConfig(goal.type);
          const progressPercent = Math.round((goal.progress / goal.total) * 100);

          return (
            <div 
              key={goal.id} 
              className={`group relative rounded-[4rem] p-10 border-2 transition-all duration-700 hover:-translate-y-3 ${
                isDarkMode 
                  ? `${config.bg} ${config.border} ${config.glow}` 
                  : `bg-white border-violet-50 shadow-2xl shadow-violet-100/50`
              }`}
            >
              <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-30 ${isDarkMode ? 'bg-white' : 'bg-violet-500'}`} />

              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className={`p-5 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="text-right space-y-2">
                    <span className="block text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{goal.period}</span>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/20 rounded-full border border-white/5">
                      <Zap className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                      <span className="text-[10px] font-black text-white">{config.xp} XP</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
                    {goal.title}
                  </h3>
                  <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${goal.completed ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {goal.completed ? 'Misión Cumplida' : `Nivel: ${goal.type}`}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Energía de Fe</span>
                    <span className={`text-sm font-black ${goal.completed ? 'text-emerald-500' : 'text-violet-500'}`}>
                      {goal.progress}/{goal.total} <span className="text-[10px] opacity-40 ml-1">({progressPercent}%)</span>
                    </span>
                  </div>
                  <div className={`h-5 w-full rounded-full border-2 p-1 overflow-hidden ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-violet-50 border-violet-100'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative ${
                        goal.completed 
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                          : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                      }`}
                      style={{ width: `${Math.max(8, progressPercent)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                </div>

                {goal.completed ? (
                  <button 
                    onClick={() => shareContent('¡Quest Completada!', `He superado el desafío "${goal.title}" en Ignite Youth! ✝️🔥`)}
                    className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                    <Share2 className="w-4 h-4" /> Compartir Victoria
                  </button>
                ) : (
                  <button 
                    onClick={() => { feedback.playClick(); updateGoalProgress(goal.id, 1); refreshState(); }}
                    className={`w-full py-5 rounded-2xl border-2 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white hover:bg-violet-600 hover:border-violet-600' 
                        : 'bg-white border-violet-100 text-violet-600 hover:bg-violet-600 hover:text-white hover:shadow-xl hover:shadow-violet-500/30'
                    }`}
                  >
                    <Flame className="w-4 h-4" /> Registrar Avance
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal - Quest Creator */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className={`w-full max-w-xl rounded-[5rem] overflow-hidden shadow-2xl border-2 animate-in zoom-in-95 duration-500 glass ${isDarkMode ? 'border-white/10' : 'border-white'}`}>
            <div className="h-40 bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center relative">
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
               <h3 className="relative z-10 text-3xl font-black uppercase tracking-tighter text-white">Configurar Misión</h3>
               <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 p-3 bg-black/20 text-white rounded-full hover:bg-black/40 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-12 space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-500 ml-4">Nombre del Desafío</label>
                <input 
                  type="text" 
                  value={newGoal.title}
                  onChange={e => setNewGoal(prev => ({...prev, title: e.target.value}))}
                  placeholder="Ej: Evangelismo Urbano"
                  className={`w-full px-8 py-6 rounded-[2.5rem] border-2 outline-none font-bold text-lg transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white focus:border-violet-500' : 'bg-slate-50 border-transparent focus:bg-white focus:border-violet-500'}`}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-500 ml-4">Nivel de Recompensa</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['Bronce', 'Plata', 'Oro'] as Goal['type'][]).map(type => {
                    const c = getTierConfig(type);
                    return (
                      <button 
                        key={type}
                        onClick={() => { feedback.playClick(); setNewGoal(prev => ({...prev, type})); }}
                        className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${
                          newGoal.type === type 
                            ? 'bg-violet-600 border-violet-600 text-white shadow-2xl shadow-violet-500/40' 
                            : `${isDarkMode ? 'bg-white/5 border-white/5 opacity-40' : 'bg-slate-50 border-transparent opacity-60'}`
                        }`}
                      >
                        <div className={newGoal.type === type ? 'text-white' : c.color}>{c.icon}</div>
                        <span className="text-[10px] font-black uppercase tracking-tight">{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-500 ml-4">Frecuencia</label>
                  <select 
                    value={newGoal.period}
                    onChange={e => setNewGoal(prev => ({...prev, period: e.target.value as Goal['period']}))}
                    className={`w-full px-8 py-5 rounded-[2rem] border-2 outline-none font-bold text-sm ${isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-slate-50 border-transparent'}`}
                  >
                    <option value="Diario">Diario</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensual">Mensual</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-500 ml-4">Objetivo</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newGoal.total}
                    onChange={e => setNewGoal(prev => ({...prev, total: parseInt(e.target.value) || 1}))}
                    className={`w-full px-8 py-5 rounded-[2rem] border-2 outline-none font-bold text-center text-sm ${isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-slate-50 border-transparent'}`}
                  />
                </div>
              </div>

              <button 
                onClick={handleCreateGoal}
                className="w-full py-7 rounded-[3rem] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-violet-500/40 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Activar Misión <Swords className="w-6 h-6 group-hover:animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;