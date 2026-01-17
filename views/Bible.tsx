
import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Volume2, Heart, Sparkles, ChevronLeft, ChevronRight, SlidersHorizontal, Play, Info } from 'lucide-react';
import { playAudio, searchBible, BibleSearchParams } from '../services/geminiService';
import { BibleVerse } from '../types';
import { loadDB, toggleFavorite } from '../store/db';
import { feedback } from '../services/audioFeedback';

const Bible: React.FC<{ refreshState: () => void }> = ({ refreshState }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';

  const [currentBook, setCurrentBook] = useState('Salmos');
  const [currentChapter, setCurrentChapter] = useState(23);
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);

  // Cargar capítulo al iniciar o cambiar
  useEffect(() => {
    loadFullChapter(currentBook, currentChapter);
  }, [currentBook, currentChapter]);

  const loadFullChapter = async (book: string, chapter: number) => {
    setIsLoading(true);
    try {
      // Intentar cargar via Gemini para tener el capítulo completo real
      const results = await searchBible({ book, chapter });
      if (results && results.length > 0) {
        setChapterVerses(results.sort((a:any, b:any) => a.verse - b.verse));
      } else {
        // Fallback para evitar vista vacía si falla la API
        setChapterVerses([{ book, chapter, verse: 1, text: "Cargando contenido sagrado..." }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    feedback.playClick();
    setIsSearching(true);
    const results = await searchBible(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const isFavorite = (v: BibleVerse) => {
    return state.user.favorites.some(fav => 
      fav.book === v.book && fav.chapter === v.chapter && fav.verse === v.verse
    );
  };

  const handleToggleFavorite = (v: BibleVerse) => {
    feedback.playClick();
    toggleFavorite(v);
    refreshState();
  };

  return (
    <div className="p-4 sm:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Buscador Superior */}
      <div className="max-w-4xl mx-auto w-full">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej: 'fortaleza', 'amor', 'Salmos 23'"
              className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 transition-all ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-100 focus:border-indigo-600'
              }`}
            />
          </div>
          <button type="submit" disabled={isSearching} className="bg-indigo-600 text-white px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50 transition-all active:scale-95">
            {isSearching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Buscar"}
          </button>
        </form>
      </div>

      {searchResults.length > 0 && (
        <div className="max-w-4xl mx-auto w-full space-y-4 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center">
             <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500">Hallazgos Espirituales</h3>
             <button onClick={() => setSearchResults([])} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500">Cerrar</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {searchResults.map((res, i) => (
              <div key={i} className={`p-6 rounded-3xl border-2 transition-all hover:shadow-xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-indigo-50'}`}>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black text-indigo-500">{res.book} {res.chapter}:{res.verse}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleFavorite(res)} className={`${isFavorite(res) ? 'text-red-500' : 'text-slate-400'}`}><Heart className="w-4 h-4" /></button>
                    <button onClick={() => playAudio(res.text)} className="text-indigo-400"><Volume2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className={`text-sm italic font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>"{res.text}"</p>
                <button 
                  onClick={() => { setCurrentBook(res.book); setCurrentChapter(res.chapter); setSearchResults([]); }}
                  className="mt-4 text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:underline"
                >
                  Leer Capítulo Completo →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lectura Principal */}
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className={`text-4xl sm:text-6xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{currentBook}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
              <button 
                onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              ><ChevronLeft className="w-5 h-5" /></button>
              <span className={`text-lg font-black ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Capítulo {currentChapter}</span>
              <button 
                onClick={() => setCurrentChapter(currentChapter + 1)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              ><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <button 
            onClick={() => playAudio(chapterVerses.map(v => v.text).join(' '))}
            className="bg-[#1A3A63] text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            Lectura Inmersiva
          </button>
        </div>

        <div className={`rounded-[48px] p-6 sm:p-12 border-4 transition-all ${
          isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'
        } ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-50 shadow-inner'}`}>
          {isLoading ? (
            <div className="space-y-8">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-6 w-full rounded-full skeleton" />
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              {chapterVerses.map((v) => (
                <div key={v.verse} className="flex flex-col sm:flex-row gap-4 group">
                  <div className="flex-1">
                    <p className={`text-xl sm:text-2xl leading-relaxed font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      <span className="text-indigo-500 font-black mr-4 text-sm opacity-50">{v.verse}</span>
                      {v.text}
                    </p>
                  </div>
                  <div className="flex gap-4 shrink-0 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleToggleFavorite(v)} className={`p-3 rounded-xl ${isFavorite(v) ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                      <Heart className={`w-5 h-5 ${isFavorite(v) ? 'fill-current' : ''}`} />
                    </button>
                    <button onClick={() => playAudio(v.text)} className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="pb-20 text-center text-slate-400">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Santa Biblia Reina Valera 1960</p>
      </div>
    </div>
  );
};

export default Bible;
