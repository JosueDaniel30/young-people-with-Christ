
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share2, Volume2, Search, BookOpen, Loader2, ArrowRight, AlertCircle, RefreshCw, CheckCircle2, Zap, CloudDownload, FileJson, Pause, X, Sparkles, MessageCircle, ArrowUpRight, Book as BookIcon, Library, Compass } from 'lucide-react';
import { tts } from '../services/ttsService';
import { searchBible } from '../services/bibleService';
import { BibleVerse } from '../types';
import { loadDB, toggleFavorite } from '../store/db';
import { feedback } from '../services/audioFeedback';
import { shareContent } from '../services/shareService';
import { BIBLE_BOOKS } from '../constants';

const QUICK_TOPICS = [
  { label: 'Ansiedad', emoji: '😌', query: 'ansiedad' },
  { label: 'Paz', emoji: '🕊️', query: 'paz' },
  { label: 'Fortaleza', emoji: '💪', query: 'fortaleza' },
  { label: 'Amor', emoji: '❤️', query: 'amor' },
  { label: 'Miedo', emoji: '🛡️', query: 'miedo' },
  { label: 'Tristeza', emoji: '💧', query: 'tristeza' }
];

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
    const jumpTo = localStorage.getItem('ignite_jump_to');
    if (jumpTo) {
      try {
        const { book, chapter } = JSON.parse(jumpTo);
        setCurrentBook(book);
        setCurrentChapter(chapter);
        setView('reader');
        localStorage.removeItem('ignite_jump_to');
      } catch (e) { console.error(e); }
    }
  }, []);

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
        setError(`El capítulo ${chapter} de ${book} no se encuentra disponible sin conexión.`);
      } else {
        setChapterVerses(results.sort((a: any, b: any) => a.verse - b.verse));
      }
    } catch (e) { 
      setError("Error de conexión al cargar la Palabra.");
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
      const interval = setInterval(() => {
        if (!tts.isSpeaking()) {
          setIsSpeaking(false);
          clearInterval(interval);
        }
      }, 500);
    }
  };

  // Add missing handleSelectBook function
  const handleSelectBook = (book: string) => {
    feedback.playClick();
    setCurrentBook(book);
    setCurrentChapter(1);
    setView('reader');
  };

  const isFavorited = (v: BibleVerse) => state.user.favorites.some(f => f.book === v.book && f.chapter === v.chapter && f.verse === v.verse);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery || searchQuery;
    if (!queryToUse.trim()) return;
    
    feedback.playClick();
    setIsSearching(true);
    setView('search_results');
    setSearchQuery(queryToUse);
    
    try {
      const results = await searchBible({ query: queryToUse });
      setSearchResults(results);
    } catch (err) { console.error(err); }
    finally { setIsSearching(false); }
  };

  const goToVerse = (verse: BibleVerse) => {
    feedback.playClick();
    setCurrentBook(verse.book);
    setCurrentChapter(verse.chapter);
    setView('reader');
  };

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      'Pentateuco': 'from-amber-600 to-orange-800', 'Evangelios': 'from-yellow-400 to-amber-600',
      'Poéticos': 'from-yellow-600 to-amber-700', 'Profecía': 'from-amber-900 to-black'
    };
    return map[cat] || 'from-amber-500 to-orange-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-10 pb-40">
      
      {/* Navegación interna (Tabs) */}
      <div className="flex justify-center mb-10 gap-4">
         <button onClick={() => setView('library')} className={`px-6 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all flex items-center gap-2 ${view === 'library' ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/20' : (isDarkMode ? 'bg-white/5 text-amber-500/40' : 'bg-amber-50 text-amber-700/40')}`}>
            <Library className="w-4 h-4" /> Estantería
         </button>
         <button onClick={() => setView('search_results')} className={`px-6 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all flex items-center gap-2 ${view === 'search_results' ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/20' : (isDarkMode ? 'bg-white/5 text-amber-500/40' : 'bg-amber-50 text-amber-700/40')}`}>
            <Compass className="w-4 h-4" /> Buscador Nátivo
         </button>
      </div>

      {(view === 'library' || view === 'search_results') && (
        <section className={`relative overflow-hidden rounded-[3rem] p-8 sm:p-16 mb-12 border-2 ${isDarkMode ? 'bg-amber-950/10 border-amber-500/10' : 'bg-white border-amber-50 shadow-xl'}`}>
           <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 blur-[100px] -mr-32 -mt-32" />
           <div className="relative z-10 space-y-8 text-center sm:text-left">
              <div>
                <h2 className={`text-4xl sm:text-7xl font-black uppercase tracking-tighter leading-none mb-2 ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>La Palabra <br/> <span className="text-amber-600">Es Viva</span></h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Motor RVR1960 Nátivo</p>
              </div>

              <form onSubmit={handleSearch} className="relative group max-w-2xl">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                 <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca por tema (paz, amor) o cita (Juan 3)..." 
                  className={`w-full pl-16 pr-24 py-5 rounded-3xl border-2 outline-none font-bold transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus:border-amber-500 text-white' : 'bg-slate-50 border-transparent focus:bg-white focus:border-amber-600'}`}
                 />
                 <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-amber-600 text-white rounded-2xl font-black uppercase text-[8px] tracking-widest">Localizar</button>
              </form>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                 {QUICK_TOPICS.map(t => (
                   <button key={t.label} onClick={() => handleSearch(undefined, t.query)} className={`px-4 py-2 rounded-xl border font-black uppercase text-[8px] tracking-widest flex items-center gap-2 transition-all ${searchQuery === t.query ? 'bg-amber-600 border-amber-600 text-white' : (isDarkMode ? 'bg-white/5 border-white/10 text-amber-500/60 hover:bg-white/10' : 'bg-white border-amber-100 text-amber-600 shadow-sm')}`}>
                      {t.emoji} {t.label}
                   </button>
                 ))}
              </div>
           </div>
        </section>
      )}

      {view === 'search_results' && (
        <div className="space-y-10 animate-in fade-in duration-500">
           {isSearching ? (
             <div className="py-20 text-center space-y-4">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Explorando pergaminos locales...</p>
             </div>
           ) : searchResults.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {searchResults.map((v, i) => (
                  <div key={i} onClick={() => goToVerse(v)} className={`p-8 rounded-[3rem] border-2 cursor-pointer group transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-amber-950/20 border-white/5 shadow-2xl' : 'bg-white border-amber-50 shadow-xl'}`}>
                     <div className="flex justify-between items-center mb-6">
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-lg">{v.book} {v.chapter}:{v.verse}</span>
                        <ArrowUpRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <p className={`text-lg font-medium leading-relaxed italic ${isDarkMode ? 'text-amber-100' : 'text-amber-900'}`}>"{v.text}"</p>
                  </div>
                ))}
             </div>
           ) : (
             <div className="py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-amber-500/5 rounded-full flex items-center justify-center text-amber-500/20 mx-auto"><Search className="w-8 h-8" /></div>
                <p className="text-sm font-black uppercase tracking-widest text-amber-700/40">No hay resultados. Prueba buscando por libro y capítulo.</p>
             </div>
           )}
        </div>
      )}

      {view === 'reader' && (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
           <div className={`sticky top-24 z-40 p-5 rounded-[2.5rem] border-2 shadow-2xl flex items-center justify-between gap-4 glass ${isDarkMode ? 'border-amber-500/10' : 'border-amber-100'}`}>
              <button onClick={() => setView('library')} className="p-3 bg-amber-500/10 text-amber-700 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
              
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))} className="p-2 text-amber-600"><ChevronLeft className="w-5 h-5"/></button>
                <div className="text-center">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-amber-900 dark:text-amber-100">{currentBook}</h2>
                  <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Cap. {currentChapter}</span>
                </div>
                <button onClick={() => setCurrentChapter(currentChapter + 1)} className="p-2 text-amber-600"><ChevronRight className="w-5 h-5"/></button>
              </div>

              <button onClick={handlePlayChapter} className="p-3 bg-amber-600 text-white rounded-xl shadow-lg active:scale-95 transition-all">
                {isSpeaking ? <Pause className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
              </button>
           </div>
           
           <div className={`mt-8 p-8 sm:p-16 rounded-[4rem] border-2 transition-all ${isDarkMode ? 'bg-[#0f0802]/60 border-white/5' : 'bg-white border-amber-50 shadow-2xl'}`}>
              {isLoading ? (
                <div className="space-y-8 py-10">
                  {[1,2,3].map(i => <div key={i} className="h-4 bg-amber-500/5 rounded-full w-full animate-pulse" />)}
                </div>
              ) : error ? (
                <div className="py-20 text-center text-orange-500 font-black uppercase text-xs tracking-widest">{error}</div>
              ) : (
                chapterVerses.map(v => (
                  <div key={v.verse} className="mb-10 group flex gap-6">
                    <span className="shrink-0 w-8 h-8 rounded-lg border border-amber-500/10 text-[10px] font-black flex items-center justify-center text-amber-500/30 group-hover:text-amber-600 transition-colors">{v.verse}</span>
                    <div className="flex-1 space-y-4">
                       <p className={`text-xl leading-relaxed font-medium transition-colors ${isDarkMode ? 'text-amber-50' : 'text-amber-950'} group-hover:text-amber-600`}>{v.text}</p>
                       <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleToggleFavorite(v)} className={`p-2 rounded-lg ${isFavorited(v) ? 'text-orange-500 bg-orange-500/10' : 'text-amber-500/30 hover:bg-amber-500/5'}`}><Heart className={`w-4 h-4 ${isFavorited(v) ? 'fill-current' : ''}`} /></button>
                          <button onClick={() => shareContent(`${v.book} ${v.chapter}:${v.verse}`, v.text)} className="p-2 text-amber-500/30 hover:text-amber-600"><Share2 className="w-4 h-4" /></button>
                       </div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

      {view === 'library' && (
        <div className="space-y-16 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             {Object.entries(BIBLE_BOOKS).map(([testament, groups]) => (
               <div key={testament} className="space-y-8">
                  <h3 className="text-2xl font-black uppercase tracking-tighter border-b-2 border-amber-500/10 pb-4">{testament === 'antiguo' ? 'Antiguo Testamento' : 'Nuevo Testamento'}</h3>
                  <div className="space-y-10">
                    {groups.map(group => (
                      <div key={group.cat} className="space-y-4">
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-600 opacity-60 ml-4">{group.cat}</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {group.books.map(b => (
                            <button key={b} onClick={() => handleSelectBook(b)} className={`p-5 rounded-2xl border-2 font-black text-[10px] uppercase tracking-tighter text-center transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-white/5 border-transparent hover:border-amber-500/30' : 'bg-white border-amber-50 hover:border-amber-200 shadow-sm'}`}>
                               {b}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Bible;
