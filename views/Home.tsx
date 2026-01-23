
import React, { useState, useEffect } from 'react';
import { Play, Sparkles, GraduationCap, ChevronRight, CheckCircle, Flame, Star, Zap, Volume2, ArrowRight, Loader2, RefreshCw, Quote, Trophy, Users, Cloud, Music, Headphones, Disc, Plus, MessageCircle } from 'lucide-react';
import { BibleVerse, User, Playlist } from '../types';
import { analyzeVerse, playAudio, getRandomVerse } from '../services/geminiService';
import { loadDB, addFEPoints, fetchGlobalLeaderboard, addNotification } from '../store/db';
import { feedback } from '../services/audioFeedback';
import { shareContent } from '../services/shareService';
import { BAPTIST_STUDIES } from '../constants';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1600&q=80", 
  "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600&q=80", 
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80", 
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80", 
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80"
];

const Home: React.FC<{ user: User, refreshState: () => void, setActiveTab: (t: string) => void }> = ({ user, refreshState, setActiveTab }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingVerse, setIsLoadingVerse] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  
  const dailyIndex = new Date().getDate() % HERO_IMAGES.length;
  const [heroImageIndex, setHeroImageIndex] = useState(dailyIndex);

  const sharedPlaylists = (state.playlists || []).filter((p: Playlist) => p.shared);

  const STUDY_IMAGES = [
    "https://images.unsplash.com/photo-1504052434569-70ad58165627?w=800&q=80",
    "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80"
  ];

  useEffect(() => {
    const loadData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const cached = localStorage.getItem('ignite_daily_verse');
      const cachedDate = localStorage.getItem('ignite_daily_verse_date');

      if (cached && cachedDate === today) {
        setVerse(JSON.parse(cached));
        setIsLoadingVerse(false);
      } else {
        try {
          const newVerse = await getRandomVerse();
          setVerse(newVerse);
          localStorage.setItem('ignite_daily_verse', JSON.stringify(newVerse));
          localStorage.setItem('ignite_daily_verse_date', today);
        } catch (error) { console.error(error); }
        finally { setIsLoadingVerse(false); }
      }

      try {
        const board = await fetchGlobalLeaderboard();
        setLeaderboard(board);
      } catch (e) { console.error(e); }
      finally { setIsLoadingLeaderboard(false); }
    };

    loadData();
  }, [user.points]);

  const nextLevelPoints = Math.pow(user.level + 1, 2) * 100;
  const currentLevelStart = Math.pow(user.level, 2) * 100;
  const progress = ((user.points - currentLevelStart) / (nextLevelPoints - currentLevelStart)) * 100;

  const handleAnalyze = () => {
    if (!verse) return;
    feedback.playClick();
    // Guardar el prompt pendiente para que el chat lo recoja
    localStorage.setItem('ignite_pending_prompt', `Hijo mío, por favor explícame el significado práctico de este versículo para mi vida hoy y dame un desafío: "${verse.text}" (${verse.book} ${verse.chapter}:${verse.verse})`);
    setActiveTab('chat');
  };

  const cycleHeroImage = () => {
    feedback.playClick();
    setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-10 space-y-12 sm:y-16 animate-in fade-in duration-1000 pb-40">
      
      <div className="flex items-center justify-end gap-2 px-2">
         <Cloud className={`w-3 h-3 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'} animate-pulse`} />
         <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Sincronización Divina</span>
      </div>

      <section className="relative min-h-[550px] sm:min-h-[700px] rounded-[2.5rem] overflow-hidden group shadow-2xl flex flex-col">
        <img src={HERO_IMAGES[heroImageIndex]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105" alt="Daily" />
        <div className={`absolute inset-0 transition-opacity duration-700 ${isDarkMode ? 'bg-black/60' : 'bg-black/40'}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
        
        <div className="relative z-10 flex-1 flex flex-col justify-end px-5 sm:px-16 pb-8 sm:pb-16">
          <div className={`glass p-6 sm:p-12 rounded-[2rem] border transition-all duration-500 ${isDarkMode ? 'border-amber-500/10 bg-black/40' : 'border-amber-100 bg-black/20'}`}>
            <div className="space-y-6">
              {isLoadingVerse ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-white/10 rounded-xl w-full" />
                  <div className="h-8 bg-white/10 rounded-xl w-4/5" />
                </div>
              ) : verse && (
                <div className="space-y-6">
                  <Quote className="w-8 h-8 text-amber-500/50 fill-current mb-[-10px]" />
                  <h2 className={`font-black text-white font-heading leading-tight tracking-tighter drop-shadow-xl ${verse.text.length > 120 ? 'text-xl sm:text-3xl' : 'text-2xl sm:text-5xl'}`}>{verse.text}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
                    <p className="text-amber-300 font-black uppercase text-xs tracking-[0.4em]">{verse.book} {verse.chapter}:{verse.verse}</p>
                    <div className="flex gap-3">
                      <button onClick={() => { feedback.playClick(); playAudio(verse.text); }} className="flex-1 px-6 py-4 bg-white text-black rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-current" /> Oír Palabra
                      </button>
                      <button onClick={handleAnalyze} className="flex-1 px-6 py-4 bg-amber-600/40 backdrop-blur-2xl border border-amber-500/50 text-white rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg hover:bg-amber-600 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5 text-yellow-400 fill-current" /> Abba Mentor
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <button onClick={cycleHeroImage} className="absolute bottom-6 right-6 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white/30 hover:text-white transition-all z-20 active:scale-90"><RefreshCw className="w-4 h-4" /></button>
      </section>

      {/* SECCIÓN: Vibras de la Comunidad */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl text-white shadow-xl">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter font-heading">Vibras del Hogar</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">Sinfonía de la comunidad</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { feedback.playClick(); setActiveTab('playlists'); }} 
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-amber-600/10 text-amber-600 font-black uppercase text-[9px] tracking-widest hover:bg-amber-600 hover:text-white transition-all border border-amber-500/20 flex items-center justify-center gap-2"
            >
              <Music className="w-3.5 h-3.5" /> Explorar
            </button>
          </div>
        </div>
        
        {sharedPlaylists.length > 0 ? (
          <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide px-2">
            {sharedPlaylists.map((pl: Playlist) => (
              <div 
                key={pl.id} 
                onClick={() => { feedback.playClick(); setActiveTab('playlists'); }}
                className={`shrink-0 w-72 rounded-[3rem] border-2 overflow-hidden transition-all hover:scale-[1.03] active:scale-95 cursor-pointer relative group ${isDarkMode ? 'bg-amber-950/20 border-white/5 shadow-2xl shadow-black/40' : 'bg-white border-amber-50 shadow-xl shadow-amber-100/30'}`}
              >
                <div className="h-44 relative">
                  <img src={pl.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Play className="w-12 h-12 text-white fill-current" />
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-tight truncate group-hover:text-amber-500 transition-colors">{pl.title}</h4>
                  <p className="text-[10px] font-bold text-amber-700/60 uppercase tracking-widest truncate">Curada por {pl.creator}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-16 rounded-[3rem] border-4 border-dashed text-center space-y-4 ${isDarkMode ? 'border-white/5' : 'border-amber-100/10'}`}>
             <Music className="w-12 h-12 text-amber-200 mx-auto animate-bounce" />
             <p className="text-sm font-black uppercase tracking-widest opacity-30 text-amber-800">Crea tu primera melodía de gratitud.</p>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 p-8 sm:p-12 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-amber-950/20 border-white/5' : 'bg-white border-amber-50 shadow-xl'}`}>
           <div className="flex justify-between items-start mb-8">
             <h3 className="text-3xl font-black font-heading tracking-tighter">Nivel <span className="text-amber-500">{user.level}</span></h3>
             <div className="flex items-center gap-4">
               <div className="text-right">
                 <p className="text-[8px] font-black uppercase tracking-widest text-amber-700/60">Sabiduría Acumulada</p>
                 <p className="text-lg font-black text-amber-500">{user.points} XP</p>
               </div>
               <div className="p-3 bg-amber-600 rounded-2xl text-white shadow-lg"><Star className="w-6 h-6 fill-current" /></div>
             </div>
           </div>
           <div className={`h-6 w-full rounded-full border p-1 overflow-hidden ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-amber-50 border-amber-100'}`}>
              <div className="h-full rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-500 shadow-lg transition-all duration-1000" style={{ width: `${Math.max(8, progress)}%` }} />
           </div>
           <p className="text-[9px] font-black uppercase tracking-[0.4em] mt-4 opacity-40 text-amber-800">Crecimiento Espiritual</p>
        </div>

        <div className={`p-8 rounded-[2.5rem] border flex flex-col ${isDarkMode ? 'bg-amber-950/20 border-white/5' : 'bg-white border-amber-50 shadow-xl'}`}>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-black uppercase tracking-widest">Muro de Honor</h4>
          </div>
          <div className="space-y-4 flex-1">
            {isLoadingLeaderboard ? (
              [1,2,3,4].map(i => <div key={i} className="h-10 bg-white/5 animate-pulse rounded-xl" />)
            ) : leaderboard.map((player, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border ${player.id === user.id ? 'bg-amber-600/20 border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-transparent'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-black text-[10px] ${i < 3 ? 'text-amber-500' : 'text-amber-700/40'}`}>{i + 1}</span>
                  <div className="flex flex-col">
                    <p className={`text-xs font-bold ${player.id === user.id ? 'text-amber-500' : ''}`}>{player.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-amber-500">{player.points} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-800 rounded-2xl text-white shadow-lg"><GraduationCap className="w-6 h-6" /></div>
          <h3 className="text-2xl font-black uppercase tracking-tighter font-heading">Escuela de Sabiduría</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BAPTIST_STUDIES.map((study, idx) => (
            <div key={study.id} className={`group rounded-[2.5rem] overflow-hidden border transition-all hover:shadow-2xl ${isDarkMode ? 'bg-amber-950/20 border-white/5' : 'bg-white border-amber-50 shadow-lg'}`}>
              <div className="h-48 relative overflow-hidden">
                <img src={STUDY_IMAGES[idx]} className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110" alt={study.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
              <div className="p-8 space-y-6">
                <h4 className="text-lg font-black uppercase tracking-tight">{study.title}</h4>
                <button onClick={() => feedback.playClick()} className="w-full py-4 rounded-xl bg-amber-600 text-white font-black text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-95 transition-all">Explorar Unidad</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
