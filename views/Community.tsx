
import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, Send, Sparkles, PlusCircle, Clock, Quote, Lamp, Zap, RefreshCw, BookOpen } from 'lucide-react';
import { loadDB, addReflection, likeReflection } from '../store/db';
import { feedback } from '../services/audioFeedback';
import { shareContent } from '../services/shareService';
import { BibleVerse } from '../types';

const Community: React.FC<{ refreshState: () => void }> = ({ refreshState }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  const [newReflectionText, setNewReflectionText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const reflections = state.reflections || [];
  
  const [dailyVerse, setDailyVerse] = useState<BibleVerse | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem('ignite_daily_verse');
    if (cached) {
      setDailyVerse(JSON.parse(cached));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReflectionText.trim()) return;

    feedback.playClick();
    addReflection({ 
      text: newReflectionText,
      verseReference: dailyVerse ? `${dailyVerse.book} ${dailyVerse.chapter}:${dailyVerse.verse}` : 'RVR1960'
    });
    setNewReflectionText('');
    setShowForm(false);
    feedback.playSuccess();
    refreshState();
  };

  const handleLike = (id: string) => {
    feedback.playClick();
    likeReflection(id);
    refreshState();
  };

  return (
    <div className="p-4 sm:p-10 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      
      {/* Header del Muro */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="text-center sm:text-left">
          <h2 className={`text-4xl sm:text-6xl font-black uppercase tracking-tighter font-heading ${isDarkMode ? 'text-white' : 'text-amber-950'}`}>
            MURO DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">VIDA</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600/60 mt-2">Sabiduría Compartida</p>
        </div>
        
        <button 
          onClick={() => { feedback.playClick(); setShowForm(!showForm); }}
          className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Nueva Reflexión
        </button>
      </div>

      {/* Tarjeta de Inspiración Diaria */}
      {dailyVerse && !showForm && (
        <section className={`p-8 rounded-[3rem] border-2 relative overflow-hidden group transition-all ${isDarkMode ? 'bg-amber-950/20 border-amber-500/10' : 'bg-amber-50 border-amber-100'}`}>
           <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
              <Zap className="w-40 h-40 text-amber-500 fill-current" />
           </div>
           <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex-1 space-y-3 text-center sm:text-left">
                 <div className="flex items-center justify-center sm:justify-start gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">Inspiración de hoy</span>
                 </div>
                 <p className={`text-lg font-bold italic ${isDarkMode ? 'text-amber-100' : 'text-amber-900'}`}>"{dailyVerse.text}"</p>
                 <span className="block text-[10px] font-black uppercase tracking-widest opacity-40">{dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse}</span>
              </div>
              <button 
                onClick={() => { feedback.playClick(); setShowForm(true); }}
                className="px-6 py-3 rounded-xl bg-amber-600 text-white font-black uppercase text-[9px] tracking-widest shadow-lg shadow-amber-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                Reflexionar
              </button>
           </div>
        </section>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className={`p-8 rounded-[3rem] border-2 animate-in slide-in-from-top duration-500 space-y-6 ${isDarkMode ? 'bg-amber-950/20 border-amber-500/10 shadow-2xl shadow-amber-900/10' : 'bg-white border-amber-100 shadow-2xl shadow-amber-100/30'}`}>
          <div className="flex items-center gap-4 mb-2">
             <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
               <Sparkles className="w-5 h-5" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">¿Qué te ha revelado el Padre hoy?</p>
          </div>
          
          <textarea 
            value={newReflectionText}
            onChange={(e) => setNewReflectionText(e.target.value)}
            placeholder="Escribe tu revelación aquí..."
            className={`w-full p-8 rounded-[2rem] h-40 outline-none focus:ring-2 focus:ring-amber-500 transition-all text-lg font-medium leading-relaxed resize-none ${isDarkMode ? 'bg-black/40 text-white border-white/5' : 'bg-amber-50/50 text-amber-950 border-transparent'}`}
          />
          
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-amber-700/40">Cancelar</button>
            <button 
              type="submit" 
              className="px-10 py-4 rounded-xl bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl"
            >
              Publicar Altar (+50 XP)
            </button>
          </div>
        </form>
      )}

      <div className="space-y-10">
        {reflections.length > 0 ? (
          reflections.map((ref) => (
            <div key={ref.id} className={`p-10 rounded-[3.5rem] border-2 transition-all hover:scale-[1.01] relative group overflow-hidden ${isDarkMode ? 'bg-amber-950/10 border-white/5 shadow-amber-900/5' : 'bg-white border-amber-50 shadow-xl shadow-amber-100/20'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-5 text-amber-500">
                <Quote className="w-24 h-24 fill-current" />
              </div>
              <div className="flex flex-col sm:flex-row gap-8 relative z-10">
                <div className="shrink-0 flex sm:flex-col items-center gap-4">
                  <img src={ref.userPhoto} alt={ref.userName} className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-amber-500/20 shadow-lg" />
                </div>
                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-black text-xl tracking-tight ${isDarkMode ? 'text-amber-50' : 'text-amber-950'}`}>{ref.userName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-amber-700/40" />
                        <span className="text-[9px] text-amber-700/40 font-black uppercase tracking-widest">{new Date(ref.timestamp).toLocaleDateString()}</span>
                        {ref.verseReference && (
                          <span className="text-[8px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-black uppercase tracking-widest">{ref.verseReference}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={`text-xl sm:text-2xl leading-relaxed font-medium italic ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>"{ref.text}"</p>
                  <div className="pt-8 border-t border-amber-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button onClick={() => handleLike(ref.id)} className="flex items-center gap-3 group/btn">
                        <Heart className={`w-5 h-5 text-orange-500 ${ref.likes > 0 ? 'fill-current' : ''}`} />
                        <span className="text-sm font-black text-amber-700/60">{ref.likes}</span>
                      </button>
                      <button onClick={() => shareContent(`Reflexión`, ref.text)} className="flex items-center gap-3">
                        <Share2 className="w-5 h-5 text-amber-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700/40">Compartir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-40 text-center space-y-6">
             <MessageSquare className="w-12 h-12 text-amber-200 mx-auto" />
             <p className="text-lg font-bold opacity-30 uppercase tracking-widest text-amber-800">El muro está esperando tu voz, hijo mío.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
