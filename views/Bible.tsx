
import React, { useState } from 'react';
import { Search, ChevronDown, BookOpen, Volume2, Sparkles, X, Filter, SlidersHorizontal, Play, Heart } from 'lucide-react';
import { playAudio, searchBible, BibleSearchParams } from '../services/geminiService';
import { BibleVerse } from '../types';
import { loadDB, toggleFavorite } from '../store/db';
import { feedback } from '../services/audioFeedback';

const Bible: React.FC<{ refreshState: () => void }> = ({ refreshState }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';

  const [currentBook, setCurrentBook] = useState('Salmos');
  const [currentChapter, setCurrentChapter] = useState(23);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced filters
  const [bookFilter, setBookFilter] = useState('');
  const [chapterFilter, setChapterFilter] = useState('');
  const [verseFilter, setVerseFilter] = useState('');

  const verses = [
    { n: 1, t: "Jehová es mi pastor; nada me faltará." },
    { n: 2, t: "En lugares de delicados pastos me hará descansar; Junto a aguas de reposo me pastoreará." },
    { n: 3, t: "Confortará mi alma; Me guiará por sendas de justicia por amor de su nombre." },
    { n: 4, t: "Aunque ande en valle de sombra de muerte, No temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento." },
  ];

  const handleReadChapter = (textToRead?: string) => {
    feedback.playClick();
    const fullText = textToRead || verses.map(v => v.t).join(' ');
    playAudio(fullText);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    feedback.playClick();
    if (!searchQuery.trim() && !bookFilter.trim() && !chapterFilter && !verseFilter) return;
    
    setIsSearching(true);
    
    const params: BibleSearchParams = {
      query: searchQuery.trim() || undefined,
      book: bookFilter.trim() || undefined,
      chapter: chapterFilter ? parseInt(chapterFilter) : undefined,
      verse: verseFilter ? parseInt(verseFilter) : undefined
    };

    const results = await searchBible(params);
    setSearchResults(results);
    setIsSearching(false);
  };

  const clearSearch = () => {
    feedback.playClick();
    setSearchQuery('');
    setBookFilter('');
    setChapterFilter('');
    setVerseFilter('');
    setSearchResults([]);
  };

  const isFavorite = (verseObj: BibleVerse) => {
    return state.user.favorites.some(v => 
      v.book === verseObj.book && v.chapter === verseObj.chapter && v.verse === verseObj.verse
    );
  };

  const handleToggleFavorite = (verseObj: BibleVerse) => {
    feedback.playClick();
    toggleFavorite(verseObj);
    refreshState();
  };

  return (
    <div className="p-6 sm:p-10 flex flex-col gap-8 animate-in slide-in-from-right duration-300">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por temas (paz, fortaleza...)" 
                className={`w-full pl-14 pr-12 py-5 rounded-3xl text-base outline-none transition-all border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-100 shadow-sm text-slate-700 focus:border-indigo-200'}`}
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <button 
              type="button"
              onClick={() => { feedback.playClick(); setShowAdvanced(!showAdvanced); }}
              className={`p-5 rounded-3xl transition-all border-2 ${showAdvanced ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-400 shadow-sm'}`}
            >
              <SlidersHorizontal className="w-6 h-6" />
            </button>

            <button 
              type="submit"
              disabled={isSearching}
              className={`px-8 rounded-3xl transition-all disabled:opacity-50 shadow-xl flex items-center justify-center min-w-[80px] ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-[#1A3A63] hover:bg-[#152e4f] text-white'}`}
            >
              {isSearching ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-6 h-6" />}
            </button>
          </div>

          {showAdvanced && (
            <div className={`p-8 rounded-[36px] animate-in slide-in-from-top-4 duration-300 border-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-indigo-50 shadow-md'} grid grid-cols-1 sm:grid-cols-3 gap-6`}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Libro</label>
                <input 
                  type="text"
                  value={bookFilter}
                  onChange={e => setBookFilter(e.target.value)}
                  placeholder="Ej: Salmos"
                  className={`w-full px-5 py-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-800'}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Capítulo</label>
                <input 
                  type="number"
                  value={chapterFilter}
                  onChange={e => setChapterFilter(e.target.value)}
                  placeholder="23"
                  className={`w-full px-5 py-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-800'}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Versículo</label>
                <input 
                  type="number"
                  value={verseFilter}
                  onChange={e => setVerseFilter(e.target.value)}
                  placeholder="1"
                  className={`w-full px-5 py-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-800'}`}
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {searchResults.length > 0 ? (
        <div className="space-y-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between px-2">
            <h3 className={`font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2 ${isDarkMode ? 'text-indigo-300' : 'text-slate-800'}`}>
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Resultados Iluminados
            </h3>
            <button onClick={clearSearch} className="text-xs text-indigo-500 font-black uppercase tracking-widest hover:underline">Limpiar</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {searchResults.map((res, i) => (
              <div key={i} className={`p-8 rounded-[40px] border-2 shadow-sm space-y-4 group transition-all hover:shadow-xl ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-indigo-50'}`}>
                <div className="flex justify-between items-start">
                  <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    {res.book} {res.chapter}:{res.verse}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleFavorite(res)} 
                      className={`p-3 rounded-full transition-all active:scale-90 ${isFavorite(res) ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-400'}`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite(res) ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={() => { feedback.playClick(); playAudio(res.text); }} 
                      className="p-3 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className={`text-lg leading-relaxed font-serif-italic pr-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  "{res.text}"
                </p>
                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => {
                      feedback.playClick();
                      setCurrentBook(res.book);
                      setCurrentChapter(res.chapter);
                      setSearchResults([]);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 transition-colors"
                  >
                    Ir al capítulo →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
            <div>
              <h2 className={`text-4xl sm:text-5xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{currentBook}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-700 text-indigo-300' : 'bg-slate-100 text-indigo-600'}`}>Capítulo {currentChapter}</span>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Reina Valera 1960</span>
              </div>
            </div>
            <button 
              onClick={() => handleReadChapter()}
              className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-[#1A3A63] text-white shadow-blue-500/20'}`}
            >
              <Volume2 className="w-5 h-5" />
              Lectura Guiada
            </button>
          </div>

          <div className={`rounded-[56px] p-8 sm:p-14 border-4 space-y-12 shadow-inner transition-colors ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-50'}`}>
            {verses.map(v => {
              const verseObj = { book: currentBook, chapter: currentChapter, verse: v.n, text: v.t };
              const isFav = isFavorite(verseObj);
              return (
                <div key={v.n} className="flex flex-col sm:flex-row gap-6 group">
                  <div className="flex-1">
                    <p className={`leading-relaxed text-2xl sm:text-3xl font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      <span className="text-indigo-500 font-black mr-6 text-sm italic align-top opacity-50">{v.n}</span>
                      {v.t}
                    </p>
                  </div>
                  <div className="flex sm:flex-col gap-3 shrink-0 items-center justify-end sm:justify-start">
                    <button 
                      onClick={() => handleToggleFavorite(verseObj)}
                      className={`p-4 rounded-2xl transition-all shadow-md active:scale-90 ${isFav ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                      title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                    >
                      <Heart className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    <button 
                      onClick={() => { feedback.playClick(); playAudio(v.t); }}
                      className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-md active:scale-90"
                      title="Reproducir versículo"
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-10 pb-20">
            <button className="flex flex-col items-center gap-4 group">
              <div className={`p-8 rounded-full transition-all group-hover:scale-110 shadow-xl border-4 ${isDarkMode ? 'bg-slate-800 border-indigo-500/30 text-indigo-400' : 'bg-white border-indigo-50 text-indigo-600'}`}>
                <BookOpen className="w-10 h-10" />
              </div>
              <span className={`text-[11px] font-black uppercase tracking-[0.4em] transition-colors ${isDarkMode ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-indigo-600'}`}>Siguiente Capítulo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bible;
