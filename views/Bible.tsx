
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share2, Volume2, Search, BookOpen, Loader2, ArrowRight, AlertCircle, RefreshCw, CheckCircle2, Zap, CloudDownload, FileJson, Pause } from 'lucide-react';
import { tts } from '../services/ttsService';
import { searchBible } from '../services/bibleService';
import { BibleVerse } from '../types';
import { loadDB, toggleFavorite } from '../store/db';
import { feedback } from '../services/audioFeedback';
import { shareContent } from '../services/shareService';
import { BIBLE_BOOKS } from '../constants';

const Bible: React.FC<{ refreshState: () => void }> = ({ refreshState }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';

  const [view, setView] = useState<'library' | 'reader' | 'search_results'>('library');
  const [currentBook, setCurrentBook] = useState('Juan');
  const [currentChapter, setCurrentChapter] = useState(3);
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (view === 'reader') {
      loadFullChapter(currentBook, currentChapter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentBook, currentChapter, view]);

  useEffect(() => {
    return () => tts.stop();
  }, []);

  const loadFullChapter = async (book: string, chapter: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchBible({ book, chapter });
      if (results.length === 0) {
        setError(`El capítulo ${chapter} de ${book} no se encuentra.`);
      } else {
        setChapterVerses(results.sort((a: any, b: any) => a.verse - b.verse));
      }
    } catch (e) { 
      setError("Error al cargar el capítulo.");
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleToggleFavorite = (verse: BibleVerse) => {
    feedback.playClick();
    toggleFavorite(verse);
    refreshState();
  };

  const handlePlayChapter = async () => {
    if (chapterVerses.length === 0) return;
    
    if (isSpeaking) {
      tts.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const fullText = chapterVerses.map(v => v.text).join(' ');
      tts.play(fullText);
      // Monitorear si sigue hablando
      const interval = setInterval(() => {
        if (!tts.isSpeaking()) {
          setIsSpeaking(false);
          clearInterval(interval);
        }
      }, 500);
    }
  };

  const handlePlayVerse = (text: string) => {
    tts.play(text);
  };

  const isFavorited = (v: BibleVerse) => {
    return state.user.favorites.some(f => 
      f.book === v.book && f.chapter === v.chapter && f.verse === v.verse
    );
  };

  const handleSelectBook = (book: string) => {
    feedback.playClick();
    setCurrentBook(book);
    setCurrentChapter(1);
    setView('reader');
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    feedback.playClick();
    setIsSearching(true);
    setView('search_results');
    try {
      const results = await searchBible({ query: searchQuery });
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      'Pentateuco': 'from-amber-600 to-orange-800',
      'Históricos': 'from-amber-700 to-amber-900',
      'Poéticos': 'from-yellow-600 to-amber-700',
      'Profetas Mayores': 'from-orange-700 to-orange-950',
      'Profetas Menores': 'from-amber-500 to-orange-600',
      'Evangelios': 'from-yellow-400 to-amber-600',
      'Historia': 'from-amber-600 to-amber-800',
      'Cartas Paulinas': 'from-amber-700 to-orange-800',
      'Cartas Generales': 'from-orange-600 to-orange-900',
      'Profecía': 'from-amber-900 to-black'
    };
    return map[cat] || 'from-amber-600 to-orange-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-10 pb-40">
      {/* Mantenemos la estructura visual intacta */}
      {(view === 'library' || view === 'search_results') && (
        <section className="text-center space-y-8 relative py-12 sm:py-20 overflow-hidden rounded-[3rem]">
          <div className="relative z-10 space-y-6 px-6">
             <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full border ${isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                <Zap className="w-5 h-5 text-amber-600" />
                <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>Biblia Nativa RVR1960</span>
             </div>
             <h2 className={`text-5xl sm:text-8xl font-black uppercase tracking-tighter font-heading leading-tight ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>
               LA PALABRA <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600">SIN INTERMITENCIAS</span>
             </h2>
             
             <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto group mt-8">
               <Search className="absolute left-16 top-1/2 -translate-y-1/2 w-6 h-6 text-amber-400" />
               <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca en capítulos guardados..." 
                className={`w-full pl-16 pr-32 py-6 rounded-[2rem] border-2 outline-none font-bold text-lg transition-all shadow-xl ${
                  isDarkMode ? 'bg-amber-950/20 border-white/5 focus:border-amber-500 text-white' : 'bg-white border-amber-50 focus:border-amber-600 text-amber-950 shadow-amber-100'
                }`}
               />
             </form>
          </div>
        </section>
      )}

      {view === 'reader' && (
        <div className="max-w-4xl mx-auto">
           <div className={`sticky top-24 z-40 glass p-6 rounded-[2.5rem] border-2 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 ${isDarkMode ? 'border-amber-500/10' : 'border-amber-100'}`}>
            <div className="flex items-center gap-3">
              <button onClick={() => setView('library')} className="px-5 py-3 rounded-xl bg-amber-500/10 text-amber-700 text-[9px] font-black uppercase transition-all">Biblioteca</button>
            </div>
            
            <div className="flex items-center gap-6">
              <button onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))} className="p-4 rounded-xl bg-amber-500/10"><ChevronLeft className="w-5 h-5 text-amber-600"/></button>
              <div className="text-center min-w-[140px]"><h2 className="text-2xl font-black uppercase tracking-tighter text-amber-900 dark:text-amber-100">{currentBook}</h2><span className="text-[8px] font-black text-amber-500">Capítulo {currentChapter}</span></div>
              <button onClick={() => setCurrentChapter(currentChapter + 1)} className="p-4 rounded-xl bg-amber-500/10"><ChevronRight className="w-5 h-5 text-amber-600"/></button>
            </div>
            
            <button 
              onClick={handlePlayChapter} 
              className="bg-amber-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg flex items-center gap-2 disabled:opacity-30"
            >
              {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {isSpeaking ? 'Detener' : 'Escuchar'}
            </button>
          </div>
          
          <div className={`mt-12 p-10 rounded-[3rem] border-2 transition-all min-h-[400px] ${isDarkMode ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-amber-100 shadow-xl'}`}>
             {isLoading ? (
               <div className="space-y-12 py-10">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex gap-6 animate-pulse">
                     <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-100/10" />
                     <div className="flex-1 space-y-3">
                        <div className="h-4 bg-amber-100/10 rounded w-full" />
                        <div className="h-4 bg-amber-100/10 rounded w-3/4" />
                     </div>
                   </div>
                 ))}
               </div>
             ) : error ? (
                <div className="py-20 text-center space-y-6">
                   <AlertCircle className="w-16 h-16 text-orange-500 mx-auto" />
                   <p className="text-lg font-bold text-orange-500 mb-4">{error}</p>
                </div>
             ) : (
               chapterVerses.map(v => (
                 <div key={v.verse} className="mb-10 group relative">
                   {v.title && (
                     <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 mb-6 mt-12 first:mt-0">{v.title}</h3>
                   )}
                   <div className="flex gap-6 group">
                     <div className="flex flex-col items-center gap-2">
                        <span className="shrink-0 w-8 h-8 rounded-lg border border-amber-500/20 text-[10px] font-black flex items-center justify-center text-amber-500/40 group-hover:text-amber-500 transition-colors">{v.verse}</span>
                        <button 
                          onClick={() => handleToggleFavorite(v)}
                          className={`p-2 rounded-full transition-all ${isFavorited(v) ? 'text-amber-500 scale-110' : 'text-amber-500/10 opacity-0 group-hover:opacity-100'}`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorited(v) ? 'fill-current' : ''}`} />
                        </button>
                     </div>
                     <div className="flex-1 space-y-4">
                        <p className={`text-2xl leading-relaxed font-medium ${isDarkMode ? 'text-amber-50' : 'text-amber-950'}`}>{v.text}</p>
                        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => shareContent(`${v.book} ${v.chapter}:${v.verse}`, v.text)} className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-amber-700/40 hover:text-amber-500">
                             <Share2 className="w-3 h-3" /> Compartir
                           </button>
                           <button onClick={() => handlePlayVerse(v.text)} className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-amber-700/40 hover:text-amber-500">
                             <Volume2 className="w-3 h-3" /> Oír
                           </button>
                        </div>
                     </div>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>
      )}

      {/* Biblioteca se mantiene igual */}
      {view === 'library' && (
        <div className="space-y-24 mt-10">
          {[...BIBLE_BOOKS.antiguo, ...BIBLE_BOOKS.nuevo].map(group => (
            <div key={group.cat} className="space-y-6">
              <div className="flex items-center gap-4 ml-6">
                 <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${getCategoryColor(group.cat)} shadow-lg`} />
                 <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-amber-700/60' : 'text-amber-700'}`}>{group.cat}</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 px-4">
                {group.books.map((b: string) => (
                  <button
                    key={b}
                    onClick={() => handleSelectBook(b)}
                    className={`group h-36 rounded-[2rem] border-2 transition-all ${isDarkMode ? 'bg-amber-950/20 border-white/5 hover:border-amber-500/30' : 'bg-white border-amber-50 hover:border-amber-200 shadow-xl shadow-amber-50/40'}`}
                  >
                    <span className={`text-sm font-black uppercase tracking-tighter text-center transition-colors ${isDarkMode ? 'text-white' : 'text-amber-900'} group-hover:text-amber-600`}>{b}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bible;
