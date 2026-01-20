import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Heart, Share2, Volume2, Search, BookOpen, Download, CloudCheck, Loader2, Sparkles, Zap, Layers, ArrowRight, Filter, X, Check } from 'lucide-react';
import { playAudio, searchBible, analyzeVerse } from '../services/geminiService';
import { BibleVerse } from '../types';
import { loadDB, toggleFavorite, saveChapterToCache, isChapterCached, addNotification } from '../store/db';
import { feedback } from '../services/audioFeedback';
import { shareContent } from '../services/shareService';
import { BIBLE_BOOKS } from '../constants';

const Bible: React.FC<{ refreshState: () => void }> = ({ refreshState }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';

  const [view, setView] = useState<'library' | 'reader' | 'search_results'>('library');
  const [currentBook, setCurrentBook] = useState('Salmos');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [analyzingVerseIdx, setAnalyzingVerseIdx] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filtros Avanzados
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBookFilter, setSelectedBookFilter] = useState<string | null>(null);

  const readerTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === 'reader') {
      loadFullChapter(currentBook, currentChapter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentBook, currentChapter, view]);

  const loadFullChapter = async (book: string, chapter: number) => {
    setIsLoading(true);
    try {
      const results = await searchBible({ book, chapter });
      setChapterVerses(results.sort((a: any, b: any) => a.verse - b.verse));
    } catch (e) { 
      console.error(e); 
      setChapterVerses([]);
    }
    finally { setIsLoading(false); }
  };

  const handleDeepInsight = async (verseText: string, idx: number) => {
    feedback.playClick();
    setAnalyzingVerseIdx(idx);
    try {
      const analysis = await analyzeVerse(verseText);
      addNotification('Revelación del Mentor', analysis, 'info');
      feedback.playNotification();
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingVerseIdx(null);
    }
  };

  const handleDownloadChapter = async () => {
    if (isDownloading || isChapterCached(currentBook, currentChapter)) return;
    feedback.playClick();
    setIsDownloading(true);
    try {
      const results = await searchBible({ book: currentBook, chapter: currentChapter });
      if (results.length > 0) {
        saveChapterToCache(currentBook, currentChapter, results);
        feedback.playSuccess();
        refreshState();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
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
      const results = await searchBible({
        query: searchQuery,
        book: selectedBookFilter || undefined,
        category: selectedCategory || undefined
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching bible:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const jumpToVerse = (book: string, chapter: number) => {
    feedback.playClick();
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setView('reader');
  };

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      'Pentateuco': 'from-amber-400 to-orange-600',
      'Históricos': 'from-blue-500 to-indigo-700',
      'Poéticos': 'from-fuchsia-500 to-purple-700',
      'Profetas Mayores': 'from-rose-500 to-red-700',
      'Profetas Menores': 'from-orange-500 to-rose-600',
      'Evangelios': 'from-emerald-400 to-teal-600',
      'Historia': 'from-cyan-500 to-blue-600',
      'Cartas Paulinas': 'from-violet-500 to-purple-800',
      'Cartas Generales': 'from-indigo-400 to-indigo-700',
      'Profecía': 'from-slate-700 to-black'
    };
    return map[cat] || 'from-violet-500 to-fuchsia-500';
  };

  const categories = [
    ...BIBLE_BOOKS.antiguo.map(g => g.cat),
    ...BIBLE_BOOKS.nuevo.map(g => g.cat)
  ];

  const allBooks = [
    ...BIBLE_BOOKS.antiguo.flatMap(g => g.books),
    ...BIBLE_BOOKS.nuevo.flatMap(g => g.books)
  ];

  const BookGrid = ({ title, groups }: { title: string, groups: any[] }) => (
    <div className="space-y-16">
      <div className="flex items-center gap-6 px-4">
        <Layers className="w-8 h-8 text-violet-500" />
        <h3 className={`text-3xl sm:text-5xl font-black uppercase tracking-tighter font-heading ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
      </div>
      
      <div className="grid grid-cols-1 gap-12">
        {groups.map(group => (
          <div key={group.cat} className="space-y-6">
            <div className="flex items-center gap-4 ml-6">
               <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${getCategoryColor(group.cat)} shadow-lg`} />
               <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{group.cat}</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 px-4">
              {group.books.map((b: string) => {
                const isBookInCache = state.bibleCache.some((c: any) => c.book === b);
                const colorClass = getCategoryColor(group.cat);
                return (
                  <button
                    key={b}
                    onClick={() => handleSelectBook(b)}
                    className={`group relative h-36 rounded-[2rem] overflow-hidden border-2 transition-all duration-500 hover:scale-[1.03] active:scale-95 ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/5 hover:border-violet-500/30' 
                        : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:border-violet-200'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                    <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 space-y-3">
                       <span className={`text-sm font-black uppercase tracking-tighter text-center transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'} group-hover:text-violet-500`}>{b}</span>
                       <div className="flex items-center gap-2">
                         {isBookInCache ? (
                           <CloudCheck className="w-4 h-4 text-emerald-500" />
                         ) : (
                           <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${colorClass} opacity-20`} />
                         )}
                       </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-10 page-fade pb-40">
      
      {(view === 'library' || view === 'search_results') && (
        <section className="text-center space-y-8 relative py-12 sm:py-20 overflow-hidden rounded-[3rem]">
          <div className="relative z-10 space-y-6 px-6">
             <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full border ${isDarkMode ? 'bg-violet-500/10 border-violet-500/30' : 'bg-violet-50 border-violet-200'}`}>
                <BookOpen className="w-5 h-5 text-violet-500" />
                <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>Sagrado Codex • RVR1960</span>
             </div>
             <h2 className={`text-5xl sm:text-8xl font-black uppercase tracking-tighter font-heading leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               PALABRA <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600">ETERNA</span>
             </h2>
             
             <div className="flex flex-col items-center gap-6 pt-6 sm:pt-10">
               <form onSubmit={handleSearch} className="relative w-full max-w-2xl group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                 <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca un tema, frase o cita..." 
                  className={`w-full pl-16 pr-32 py-6 rounded-[2rem] border-2 outline-none font-bold text-lg transition-all shadow-xl ${
                    isDarkMode ? 'bg-white/5 border-white/5 focus:border-violet-500 text-white' : 'bg-white border-slate-100 focus:border-violet-500 text-slate-800 shadow-slate-200'
                  }`}
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <button 
                    type="button"
                    onClick={() => { feedback.playClick(); setShowFilters(!showFilters); }}
                    className={`p-4 rounded-[1.2rem] transition-all ${showFilters ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200'}`}
                   >
                     <Filter className="w-5 h-5" />
                   </button>
                   <button 
                    type="submit"
                    disabled={isSearching}
                    className="bg-violet-600 text-white p-4 rounded-[1.2rem] shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                   >
                     {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                   </button>
                 </div>
               </form>

               {/* Advanced Filters Panel */}
               {showFilters && (
                 <div className={`w-full max-w-2xl p-8 rounded-[2.5rem] border-2 animate-in slide-in-from-top-4 duration-300 text-left space-y-8 ${isDarkMode ? 'bg-[#0a0520] border-white/5' : 'bg-white border-violet-100 shadow-xl shadow-violet-100/30'}`}>
                    <div className="flex items-center justify-between">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-500">Refinar Búsqueda</h4>
                       <button onClick={() => { feedback.playClick(); setSelectedCategory(null); setSelectedBookFilter(null); }} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest">Limpiar</button>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categoría</p>
                       <div className="flex flex-wrap gap-2">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => { feedback.playClick(); setSelectedCategory(selectedCategory === cat ? null : cat); }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategory === cat ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:border-violet-500/40'}`}
                            >
                              {cat}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Libro Específico</p>
                       <select 
                        value={selectedBookFilter || ''} 
                        onChange={(e) => { feedback.playClick(); setSelectedBookFilter(e.target.value || null); }}
                        className={`w-full p-4 rounded-2xl border-2 outline-none font-bold text-xs ${isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-violet-100'}`}
                       >
                         <option value="">Cualquier Libro</option>
                         {allBooks.map(b => <option key={b} value={b}>{b}</option>)}
                       </select>
                    </div>
                 </div>
               )}
             </div>
          </div>
        </section>
      )}

      {view === 'library' && (
        <div className="space-y-24 mt-10">
          <BookGrid title="Antiguo Testamento" groups={BIBLE_BOOKS.antiguo} />
          <BookGrid title="Nuevo Testamento" groups={BIBLE_BOOKS.nuevo} />
        </div>
      )}

      {view === 'search_results' && (
        <div className="space-y-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center justify-between px-6">
            <button 
              onClick={() => { feedback.playClick(); setView('library'); }}
              className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-violet-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Regresar
            </button>
            <div className="flex items-center gap-3">
               {selectedCategory && <span className="px-3 py-1 bg-violet-500/10 text-violet-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{selectedCategory}</span>}
               {selectedBookFilter && <span className="px-3 py-1 bg-fuchsia-500/10 text-fuchsia-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{selectedBookFilter}</span>}
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-500">
                 {searchResults.length} Resultados
               </span>
            </div>
          </div>

          <div className="space-y-6">
            {isSearching ? (
              <div className="py-40 flex flex-col items-center justify-center space-y-8">
                <Loader2 className="w-16 h-16 text-violet-500 animate-spin" />
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">Escudriñando...</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((v, i) => (
                <div 
                  key={i} 
                  className={`p-10 rounded-[2.5rem] border-2 transition-all hover:scale-[1.01] group cursor-pointer ${
                    isDarkMode ? 'bg-white/5 border-white/5 hover:border-violet-500/30' : 'bg-white border-slate-100 hover:border-violet-200 shadow-xl shadow-slate-200/30'
                  }`}
                  onClick={() => jumpToVerse(v.book, v.chapter)}
                >
                  <div className="flex flex-col sm:flex-row gap-8">
                    <div className="shrink-0 flex items-center justify-center w-16 h-16 bg-violet-500/10 rounded-2xl border border-violet-500/20 text-violet-500 font-black text-lg">
                      {v.verse}
                    </div>
                    <div className="flex-1 space-y-4">
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-violet-500">{v.book} {v.chapter}:{v.verse}</span>
                      <p className={`text-2xl font-medium leading-relaxed italic ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        "{v.text}"
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-40 flex flex-col items-center justify-center space-y-6 text-center">
                 <div className="p-8 bg-slate-100 dark:bg-white/5 rounded-full">
                    <X className="w-12 h-12 text-slate-300" />
                 </div>
                 <p className="text-xl font-bold opacity-40 uppercase tracking-widest">No hay resultados para esta búsqueda</p>
                 <button onClick={() => { setSearchQuery(''); setShowFilters(true); handleSearch(); }} className="text-violet-500 font-black text-xs uppercase tracking-widest underline">Ajustar Filtros</button>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'reader' && (
        <div className="space-y-12 max-w-5xl mx-auto" ref={readerTopRef}>
          <div className={`sticky top-24 z-40 glass p-6 rounded-[2.5rem] border-2 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 ${isDarkMode ? 'border-white/5' : 'border-violet-100'}`}>
            <button 
              onClick={() => { feedback.playClick(); setView('library'); }} 
              className={`group flex items-center gap-2 px-6 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest border ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              <ChevronLeft className="w-5 h-5" /> Biblioteca
            </button>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { feedback.playClick(); setCurrentChapter(Math.max(1, currentChapter - 1)); }} 
                className={`p-4 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center min-w-[140px]">
                <h2 className={`text-2xl sm:text-4xl font-black uppercase tracking-tighter font-heading ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentBook}</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-500 mt-1 block">Capítulo {currentChapter}</span>
              </div>
              
              <button 
                onClick={() => { feedback.playClick(); setCurrentChapter(currentChapter + 1); }} 
                className={`p-4 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleDownloadChapter} 
                disabled={isChapterCached(currentBook, currentChapter)}
                className={`p-4 rounded-xl border transition-all ${
                  isChapterCached(currentBook, currentChapter) 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { feedback.playClick(); playAudio(chapterVerses.map(v => v.text).join(' ')); }} 
                className="bg-violet-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-violet-500/30 flex items-center gap-2 hover:scale-105 transition-all"
              >
                <Volume2 className="w-5 h-5" /> Escuchar
              </button>
            </div>
          </div>

          <div className={`relative p-8 sm:p-20 rounded-[3rem] border-2 shadow-2xl overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0520] border-white/5' : 'bg-white border-violet-100'}`}>
            {isLoading ? (
              <div className="py-40 flex flex-col items-center justify-center space-y-8">
                 <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Descargando Maná...</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-16">
                {chapterVerses.map((v, idx) => (
                  <div key={v.verse} className="group relative space-y-6">
                    {v.title && (
                      <h4 className="text-3xl font-black uppercase tracking-tighter font-heading text-violet-500 pt-10 pb-6 border-b border-violet-500/10">
                        {v.title}
                      </h4>
                    )}

                    <div className="flex gap-6 items-start">
                      <span className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'} group-hover:bg-violet-600 group-hover:text-white`}>
                        {v.verse}
                      </span>

                      <div className="flex-1 space-y-6">
                        <p className={`text-2xl sm:text-3xl leading-relaxed font-medium transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                          {v.text}
                        </p>
                        
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                          <button 
                            onClick={() => { feedback.playClick(); toggleFavorite(v); refreshState(); }} 
                            className={`p-3 rounded-xl border transition-all ${
                              state.user.favorites.some(f => f.text === v.text) 
                                ? 'bg-rose-500 border-rose-500 text-white shadow-lg' 
                                : 'bg-white/5 border-white/10 text-slate-500 hover:text-rose-500'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${state.user.favorites.some(f => f.text === v.text) ? 'fill-current' : ''}`} />
                          </button>
                          
                          <button 
                            onClick={() => handleDeepInsight(v.text, idx)}
                            disabled={analyzingVerseIdx !== null}
                            className={`px-4 py-3 rounded-xl border flex items-center gap-2 transition-all ${isDarkMode ? 'bg-violet-600/10 border-violet-600/20 text-violet-400 hover:bg-violet-600 hover:text-white' : 'bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-600 hover:text-white'}`}
                          >
                            {analyzingVerseIdx === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            <span className="text-[9px] font-black uppercase tracking-widest">IA Insight</span>
                          </button>
                          
                          <div className="flex-1" />
                          
                          <button 
                            onClick={() => shareContent(`${currentBook} ${currentChapter}:${v.verse}`, v.text)} 
                            className={`p-3 rounded-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-500 hover:text-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-cyan-600'}`}
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Bible;