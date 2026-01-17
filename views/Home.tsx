
import React, { useState } from 'react';
import { Play, Sparkles, BookOpen, Share2, Volume2, Quote, Flame, ChevronRight, Zap, MessageSquare, Smartphone, Download } from 'lucide-react';
import { BibleVerse, User, Study } from '../types';
import { analyzeVerse, playAudio } from '../services/geminiService';
import { updateGoalProgress, loadDB } from '../store/db';
import { STUDIES } from '../constants';
import { feedback } from '../services/audioFeedback';

const Home: React.FC<{ user: User, refreshState: () => void, setActiveTab: (t: string) => void }> = ({ user, refreshState, setActiveTab }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  
  const [verse, setVerse] = useState<BibleVerse>({
    book: 'Filipenses',
    chapter: 4,
    verse: 13,
    text: 'Todo lo puedo en Cristo que me fortalece.'
  });
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    feedback.playClick();
    setIsAnalyzing(true);
    try {
      const result = await analyzeVerse(verse.text);
      setAnalysis(result || '');
      updateGoalProgress('g1', 1);
      refreshState();
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = () => {
    feedback.playClick();
    if (navigator.share) {
      navigator.share({
        title: 'Versículo del Día - Jóvenes con Cristo',
        text: `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`,
        url: window.location.href
      });
    }
  };

  const handlePlayPromesa = () => {
    feedback.playClick();
    playAudio(verse.text);
  };

  const handlePlayStudy = (study: Study) => {
    feedback.playClick();
    playAudio(`Estudio: ${study.title}. ${study.content}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-12 sm:space-y-20 animate-in fade-in duration-1000">
      
      {/* Hero Section: Daily Verse */}
      <section className="relative w-full group">
        <div className={`rounded-[40px] sm:rounded-[64px] p-8 sm:p-16 text-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative overflow-hidden transition-all duration-1000 min-h-[450px] sm:min-h-[550px] flex flex-col justify-center border-b-4 ${isDarkMode ? 'mesh-bg border-indigo-500/20' : 'mesh-bg-light border-white/20'}`}>
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full blur-[100px] animate-float-slow opacity-20 ${isDarkMode ? 'bg-indigo-400' : 'bg-white'}`} />
            <div className={`absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[100px] animate-float-delayed opacity-20 ${isDarkMode ? 'bg-purple-500' : 'bg-sky-300'}`} />
            <div className="absolute top-10 right-10 opacity-[0.03] scale-[1.5] transform -rotate-12 transition-transform group-hover:rotate-0 duration-1000">
              <Quote className="w-64 h-64" />
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-8 animate-reveal">
            <div className="flex items-center gap-3">
              <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.4em] backdrop-blur-md border border-white/20 transition-all ${isDarkMode ? 'bg-indigo-500/20 text-indigo-200' : 'bg-white/20 text-white'}`}>
                Promesa de Hoy
              </span>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display leading-[1.1] tracking-tight drop-shadow-xl">
                "{verse.text}"
              </h2>
              
              <div className="flex flex-col items-center gap-2">
                <div className="h-1 w-12 rounded-full bg-white/30" />
                <p className="font-black text-xl sm:text-3xl tracking-tighter uppercase">{verse.book} {verse.chapter}:{verse.verse}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Reina Valera 1960</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <button 
                onClick={handlePlayPromesa}
                className={`px-8 py-4 rounded-full transition-all active:scale-95 shadow-lg backdrop-blur-xl flex items-center justify-center gap-2.5 group border border-white/10 ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-900'}`}
              >
                <Play className={`w-4 h-4 transition-transform group-hover:scale-110 ${isDarkMode ? 'fill-white' : 'fill-indigo-900'}`} />
                <span className="font-black text-[10px] uppercase tracking-widest">Escuchar</span>
              </button>
              <button 
                onClick={handleShare}
                className="px-8 py-4 rounded-full transition-all active:scale-95 shadow-lg backdrop-blur-md flex items-center justify-center gap-2.5 border border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <Share2 className="w-4 h-4" />
                <span className="font-black text-[10px] uppercase tracking-widest">Compartir</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* IA Analysis Card */}
        <div className="md:col-span-8">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full h-full p-8 sm:p-10 rounded-[40px] border-2 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all active:scale-[0.98] group relative overflow-hidden shadow-sm hover:shadow-xl ${
              isDarkMode 
                ? 'bg-slate-800/40 border-slate-700 hover:border-indigo-500/40' 
                : 'bg-white border-slate-100 hover:border-indigo-100'
            }`}
          >
            <div className="flex items-center gap-6 relative z-10">
              <div className={`p-5 rounded-3xl transition-all duration-700 group-hover:rotate-6 ${
                isDarkMode 
                  ? 'bg-indigo-500/10 text-indigo-400' 
                  : 'bg-indigo-50 text-indigo-600'
              }`}>
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="text-left">
                <span className={`block font-black text-xl uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Mentor Espiritual IA</span>
                <p className={`text-[9px] font-bold uppercase tracking-[0.3em] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Analizar Palabra de vida</p>
              </div>
            </div>

            <div className="shrink-0 relative z-10">
              {isAnalyzing ? (
                <div className="w-12 h-12 border-4 rounded-full animate-spin border-indigo-600 border-t-transparent" />
              ) : (
                <div className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-md transition-all group-hover:shadow-indigo-500/20 ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-[#1A3A63] text-white'}`}>
                  Empezar (+100 XP)
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Community Quick Link Card */}
        <div className="md:col-span-4">
          <button 
            onClick={() => { feedback.playClick(); setActiveTab('community'); }}
            className={`w-full h-full p-8 rounded-[40px] border-2 flex flex-col items-start justify-between gap-4 transition-all shadow-sm hover:shadow-xl group ${
              isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-indigo-100'
            }`}
          >
            <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className={`block font-black text-lg uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Comunidad</span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">¿Qué opinan otros?</p>
            </div>
          </button>
        </div>
      </div>

      {/* PWA CTA Card for Android Users */}
      <section className={`rounded-[40px] p-8 border-2 flex flex-col md:flex-row items-center justify-between gap-8 transition-all ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100 shadow-sm'}`}>
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg shrink-0">
              <Smartphone className="w-8 h-8 text-indigo-600" />
           </div>
           <div>
             <h3 className={`text-xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Lleva Ignite en tu móvil</h3>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Instala la app para acceso offline y mayor rapidez.</p>
           </div>
        </div>
        <button 
          onClick={() => { feedback.playClick(); setActiveTab('profile'); }}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
        >
          <Download className="w-5 h-5" />
          Instalar Ahora
        </button>
      </section>

      {/* AI Analysis Result Section */}
      {analysis && (
        <section className={`rounded-[40px] p-8 sm:p-12 border-2 shadow-2xl animate-in slide-in-from-bottom-8 duration-700 relative overflow-hidden ${
          isDarkMode ? 'bg-slate-800/60 border-indigo-500/20' : 'bg-white border-indigo-50'
        }`}>
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-black text-lg uppercase tracking-widest ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Visión Profunda</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sabiduría del Mentor IA</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { feedback.playClick(); playAudio(analysis); }}
                className={`p-4 rounded-full transition-all active:scale-90 shadow-lg border ${isDarkMode ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'}`}
              >
                <Volume2 className="w-6 h-6" />
              </button>
              <button 
                onClick={() => { feedback.playClick(); setActiveTab('community'); }}
                className={`flex items-center gap-2 px-6 py-4 rounded-full transition-all active:scale-90 shadow-lg border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-[#1A3A63] text-white border-transparent'}`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Opinar en Muro</span>
              </button>
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-serif-italic leading-relaxed tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            {analysis}
          </p>
        </section>
      )}

      {/* Studies Section */}
      <section className="space-y-8 sm:space-y-12">
        <div className="flex flex-col sm:flex-row items-end justify-between gap-4 px-2">
          <div className="text-left">
            <span className={`text-[9px] font-black uppercase tracking-[0.4em] mb-2 block ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Contenido Premium</span>
            <h3 className={`text-3xl sm:text-5xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Series Ignite</h3>
          </div>
          <button className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 font-black text-[9px] uppercase tracking-widest transition-all ${
            isDarkMode 
              ? 'border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500' 
              : 'border-slate-100 text-slate-600 hover:bg-white hover:shadow-md'
          }`}>
            Explorar Todo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
          {STUDIES.map(study => (
            <div 
              key={study.id} 
              className={`rounded-[40px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border-2 flex flex-col sm:flex-row h-full ${
                isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-100'
              }`}
            >
              <div className="relative w-full sm:w-[42%] min-h-[220px] sm:min-h-full overflow-hidden shrink-0">
                <img 
                  src={study.image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  alt={study.title}
                  onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${study.id}/800/800`; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-[#B91C1C] text-white text-[8px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest border border-white/10">Destacado</span>
                </div>
              </div>

              <div className="p-8 sm:p-10 flex flex-col justify-between flex-1">
                <div className="space-y-3">
                  <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{study.category}</span>
                  <h4 className={`text-2xl font-black leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{study.title}</h4>
                  <p className={`text-xs font-medium leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{study.description}</p>
                </div>

                <div className={`mt-8 pt-6 border-t flex items-center justify-between ${isDarkMode ? 'border-slate-700/50' : 'border-slate-50'}`}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePlayStudy(study); }}
                    className={`p-3.5 rounded-xl transition-all shadow-md ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <div className={`flex items-center gap-2 font-black uppercase text-[9px] tracking-widest group-hover:text-indigo-500 transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    <span>Ver Lección</span>
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-10 pb-20 flex flex-col items-center opacity-20">
        <div className="w-1 h-12 bg-gradient-to-b from-indigo-500 to-transparent rounded-full mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[1em] text-slate-500">Fin de la Sección</span>
      </div>
    </div>
  );
};

export default Home;
