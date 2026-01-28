
import React, { useState, useEffect, useRef } from 'react';
import { Play, Sparkles, GraduationCap, Star, Zap, RefreshCw, Quote, Trophy, Headphones, Music, Volume2, Pause, Loader2, BookOpen, Plus, X, ArrowRight, User as UserIcon, FileText, Paperclip, Download, Eye, ChevronRight } from 'lucide-react';
import { BibleVerse, User, Playlist, Lesson } from '../types';
import { getRandomVerse } from '../services/bibleService';
import { tts } from '../services/ttsService';
import { loadDB, fetchGlobalLeaderboard, subscribeToLessons, addLesson, addFEPoints } from '../store/db';
import { feedback } from '../services/audioFeedback';

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
  const [isLoadingVerse, setIsLoadingVerse] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>(state.lessons || []);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({ title: '', content: '', category: 'General' });
  const [selectedFile, setSelectedFile] = useState<{ name: string, type: string, data: string } | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dailyIndex = new Date().getDate() % HERO_IMAGES.length;
  const [heroImageIndex, setHeroImageIndex] = useState(dailyIndex);

  const sharedPlaylists = (state.playlists || []).filter((p: Playlist) => p.shared);

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

    const unsubscribeLessons = subscribeToLessons((data) => {
      setLessons(data);
      setIsLoadingLessons(false);
    });

    const interval = setInterval(() => {
      setIsPlaying(tts.isSpeaking());
    }, 500);

    return () => {
      tts.stop();
      clearInterval(interval);
      unsubscribeLessons();
    };
  }, [user.points]);

  const nextLevelPoints = Math.pow(user.level + 1, 2) * 100;
  const currentLevelStart = Math.pow(user.level, 2) * 100;
  const progress = ((user.points - currentLevelStart) / (nextLevelPoints - currentLevelStart)) * 100;

  const cycleHeroImage = () => {
    feedback.playClick();
    setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  };

  const handlePlayAudio = () => {
    if (!verse) return;
    if (isPlaying) {
      tts.stop();
      setIsPlaying(false);
    } else {
      tts.play(verse.text);
      setIsPlaying(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Por favor, sube solo archivos PDF o DOCX.");
      return;
    }

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedFile({
        name: file.name,
        type: file.type,
        data: base64
      });
      setIsReadingFile(false);
      feedback.playClick();
    };
    reader.readAsDataURL(file);
  };

  const handleAddLesson = async () => {
    if (!newLesson.title.trim() || !newLesson.content.trim()) return;
    feedback.playClick();
    await addLesson({
      ...newLesson,
      attachment: selectedFile || undefined
    });
    setNewLesson({ title: '', content: '', category: 'General' });
    setSelectedFile(null);
    setShowLessonModal(false);
    feedback.playSuccess();
  };

  const handleDownloadFile = (lesson: Lesson) => {
    if (!lesson.attachment) return;
    const link = document.createElement('a');
    link.href = lesson.attachment.data;
    link.download = lesson.attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    feedback.playClick();
    addFEPoints(10, 'Estudio de material compartido');
  };

  const openLessonReader = (lesson: Lesson) => {
    feedback.playClick();
    setSelectedLesson(lesson);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-10 space-y-12 sm:y-16 animate-in fade-in duration-1000 pb-40">
      
      <div className="flex items-center justify-end gap-2 px-2">
         <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Audio Pro Nativo</span>
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
                      <button 
                        onClick={handlePlayAudio} 
                        className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${isPlaying ? 'bg-amber-600 text-white' : 'bg-white text-black hover:scale-105'}`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current animate-pulse" /> : <Play className="w-4 h-4 fill-current" />}
                        {isPlaying ? 'Detener' : 'Oír Palabra'}
                      </button>
                      <button 
                        onClick={() => setShowLessonModal(true)}
                        className="w-full sm:w-auto px-10 py-5 bg-amber-600/20 backdrop-blur-xl border border-amber-500/30 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                      >
                        <GraduationCap className="w-4 h-4" /> Subir Lección
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

      {/* SECCIÓN DE LECCIONES */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl text-white shadow-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter font-heading">Lecciones de Discipulado</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">Sabiduría compartida por la iglesia</p>
            </div>
          </div>
          <button 
            onClick={() => { feedback.playClick(); setShowLessonModal(true); }}
            className={`px-6 py-3 rounded-xl border-2 font-black uppercase text-[9px] tracking-widest transition-all ${isDarkMode ? 'border-amber-500/20 text-amber-500 hover:bg-amber-500/10' : 'border-amber-100 text-amber-600 hover:bg-amber-50'}`}
          >
            Añadir Lección
          </button>
        </div>

        {isLoadingLessons ? (
          <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide px-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`shrink-0 w-80 h-96 rounded-[3rem] animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-amber-50'}`} />
            ))}
          </div>
        ) : (
          <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide px-2">
            {lessons.map((lesson) => (
              <div 
                key={lesson.id}
                onClick={() => openLessonReader(lesson)}
                className={`shrink-0 w-80 rounded-[3rem] p-8 border-2 transition-all hover:scale-[1.03] flex flex-col justify-between group cursor-pointer ${isDarkMode ? 'bg-amber-950/20 border-white/5 shadow-2xl' : 'bg-white border-amber-50 shadow-xl shadow-amber-100/30'}`}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">{lesson.category}</span>
                    {lesson.attachment && (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownloadFile(lesson); }}
                          className="p-2 bg-amber-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black uppercase tracking-tight leading-tight group-hover:text-amber-500 transition-colors line-clamp-2">{lesson.title}</h4>
                    <p className={`text-xs font-medium line-clamp-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{lesson.content}</p>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-amber-500/10 mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={lesson.userPhoto} className="w-8 h-8 rounded-xl object-cover border border-amber-500/20" alt="" />
                    <span className="text-[9px] font-bold text-amber-700/60 uppercase tracking-widest">{lesson.userName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600">
                    <span className="text-[8px] font-black uppercase tracking-widest">Estudiar</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
            {lessons.length === 0 && (
              <div className={`shrink-0 w-full p-20 rounded-[3rem] border-4 border-dashed text-center space-y-4 ${isDarkMode ? 'border-white/5' : 'border-amber-100'}`}>
                <GraduationCap className="w-12 h-12 text-amber-500/20 mx-auto" />
                <p className="text-sm font-black uppercase tracking-widest opacity-30 text-amber-800">Sé el primero en compartir sabiduría.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Playlists, XP, Leaderboard se mantienen igual... */}
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
                  <p className={`text-xs font-bold ${player.id === user.id ? 'text-amber-500' : ''}`}>{player.name}</p>
                </div>
                <span className="text-[10px] font-black text-amber-500">{player.points} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL LECTOR DE LECCIONES */}
      {selectedLesson && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
           <header className="p-6 flex items-center justify-between border-b border-white/5">
              <button onClick={() => setSelectedLesson(null)} className="p-4 bg-white/5 rounded-2xl text-white">
                <X className="w-6 h-6" />
              </button>
              <div className="text-center">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500">{selectedLesson.category}</p>
                 <h3 className="text-white font-black uppercase tracking-tight text-sm">Estudio de Discipulado</h3>
              </div>
              <div className="w-14" />
           </header>
           
           <div className="flex-1 overflow-y-auto p-6 sm:p-20 space-y-12">
              <div className="space-y-6 max-w-4xl mx-auto">
                 <h2 className="text-4xl sm:text-7xl font-black text-white leading-tight tracking-tighter">{selectedLesson.title}</h2>
                 <div className="flex items-center gap-4 p-6 bg-white/5 rounded-[2rem] border border-white/5">
                    <img src={selectedLesson.userPhoto} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Impartida por</p>
                       <p className="text-xl font-black text-white">{selectedLesson.userName}</p>
                    </div>
                 </div>
                 
                 <div className="prose prose-invert max-w-none">
                    <p className="text-lg sm:text-2xl leading-relaxed font-medium text-slate-300 whitespace-pre-wrap">
                      {selectedLesson.content}
                    </p>
                 </div>

                 {selectedLesson.attachment && (
                    <div className="p-10 rounded-[3rem] bg-gradient-to-br from-amber-600/20 to-orange-700/20 border-2 border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-8 mt-12">
                       <div className="flex items-center gap-6">
                          <div className="p-5 bg-amber-600 rounded-3xl text-white shadow-xl">
                            <FileText className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-xl font-black text-white truncate max-w-[200px]">{selectedLesson.attachment.name}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">Material de estudio adicional</p>
                          </div>
                       </div>
                       <button 
                        onClick={() => handleDownloadFile(selectedLesson)}
                        className="w-full sm:w-auto px-12 py-6 bg-amber-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                       >
                          <Download className="w-5 h-5" /> Descargar Guía
                       </button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Modal Nueva Lección se mantiene igual... */}
      {showLessonModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className={`w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl border-2 animate-in zoom-in-95 duration-500 ${isDarkMode ? 'bg-[#0a0502] border-amber-500/20' : 'bg-white border-white'}`}>
            <div className="relative h-44 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 flex flex-col items-center justify-center text-center">
              <GraduationCap className="w-24 h-24 text-white/10 absolute animate-pulse" />
              <h3 className="relative z-10 text-3xl font-black uppercase tracking-tighter text-white">Compartir Enseñanza</h3>
              <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Discipulado Ignite</p>
              <button onClick={() => setShowLessonModal(false)} className="absolute top-8 right-8 p-3 bg-black/20 text-white rounded-full hover:bg-black/40 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 space-y-8 overflow-y-auto max-h-[60vh] scrollbar-hide">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 ml-4">Título de la Lección</label>
                <input 
                  value={newLesson.title} 
                  onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                  placeholder="Ej: La Armadura de Dios en el siglo XXI" 
                  className={`w-full px-8 py-5 rounded-3xl border-2 outline-none font-bold text-sm transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white focus:border-amber-500' : 'bg-slate-50 border-transparent focus:bg-white focus:border-amber-500 shadow-inner'}`}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 ml-4">Categoría</label>
                <div className="flex gap-2 flex-wrap">
                  {['Biblia', 'Doctrina', 'Vida Cristiana', 'Liderazgo'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewLesson({...newLesson, category: cat})}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${newLesson.category === cat ? 'bg-amber-600 border-amber-600 text-white' : 'bg-amber-500/5 text-amber-700/40 border-transparent'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 ml-4">Contenido / Bosquejo</label>
                <textarea 
                  value={newLesson.content} 
                  onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                  placeholder="Desarrolla los puntos clave aquí..." 
                  className={`w-full px-8 py-5 rounded-3xl border-2 outline-none font-medium text-sm h-32 resize-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white focus:border-amber-500' : 'bg-slate-50 border-transparent focus:bg-white focus:border-amber-500 shadow-inner'}`}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 ml-4">Material de Apoyo (Opcional)</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.docx,.doc" 
                  className="hidden" 
                />
                
                {selectedFile ? (
                  <div className={`p-6 rounded-[2rem] border-2 flex items-center justify-between group ${isDarkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-amber-500 rounded-xl text-white shadow-lg">
                         <FileText className="w-5 h-5" />
                       </div>
                       <div className="min-w-0">
                         <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 truncate max-w-[150px]">{selectedFile.name}</p>
                         <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Documento Listo</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => setSelectedFile(null)} 
                      className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isReadingFile}
                    className={`w-full py-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all ${isDarkMode ? 'border-white/10 hover:border-amber-500/30 bg-white/5' : 'border-slate-200 hover:border-amber-300 bg-slate-50'}`}
                  >
                    {isReadingFile ? (
                      <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                    ) : (
                      <>
                        <div className="p-4 rounded-full bg-amber-500/10 text-amber-600">
                          <Plus className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <span className="block text-[10px] font-black uppercase tracking-widest text-amber-700">Adjuntar PDF / DOCX</span>
                          <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Máx. 5MB para la comunidad</span>
                        </div>
                      </>
                    )}
                  </button>
                )}
              </div>

              <button 
                onClick={handleAddLesson}
                disabled={!newLesson.title.trim() || !newLesson.content.trim() || isReadingFile}
                className="w-full py-7 rounded-[2.5rem] bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-amber-600/40 active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-30 disabled:grayscale"
              >
                Publicar Lección (+150 XP) <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
