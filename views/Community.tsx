
import React, { useState } from 'react';
import { MessageSquare, Heart, Share2, Send, User, Sparkles, PlusCircle } from 'lucide-react';
import { loadDB, addReflection, likeReflection } from '../store/db';
import { feedback } from '../services/audioFeedback';

const Community: React.FC<{ refreshState: () => void }> = ({ refreshState }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  const [newReflectionText, setNewReflectionText] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReflectionText.trim()) return;

    addReflection({
      userId: state.user.id,
      userName: state.user.name,
      userPhoto: state.user.photoUrl,
      verseReference: 'Filipenses 4:13', // Por defecto el del día
      text: newReflectionText,
    });

    setNewReflectionText('');
    setShowForm(false);
    refreshState();
  };

  const handleLike = (id: string) => {
    likeReflection(id);
    refreshState();
  };

  return (
    <div className="p-6 sm:p-10 max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Muro de Vida</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Lo que Dios está hablando hoy</p>
        </div>
        <button 
          onClick={() => { feedback.playClick(); setShowForm(!showForm); }}
          className={`p-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-[#1A3A63] text-white'}`}
        >
          <PlusCircle className="w-6 h-6" />
          <span className="hidden sm:inline font-black text-xs uppercase tracking-widest">Nueva Reflexión</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`p-8 rounded-[40px] border-2 animate-in zoom-in duration-300 space-y-4 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-indigo-50 shadow-lg'}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Reflexión sobre:</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${isDarkMode ? 'bg-slate-700 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>Filipenses 4:13</span>
          </div>
          <textarea 
            value={newReflectionText}
            onChange={(e) => setNewReflectionText(e.target.value)}
            placeholder="¿Qué te enseñó Dios hoy a través de su Palabra?"
            className={`w-full p-6 rounded-3xl h-32 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-base ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}
          />
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'}`}
            >
              <Send className="w-4 h-4" />
              Publicar (+50 XP)
            </button>
          </div>
        </form>
      )}

      <div className="space-y-8">
        {state.reflections.map((ref) => (
          <div key={ref.id} className={`p-8 rounded-[48px] border-2 shadow-sm transition-all hover:shadow-xl group ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-100'}`}>
            <div className="flex gap-5">
              <img 
                src={ref.userPhoto} 
                alt={ref.userName} 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/20" 
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{ref.userName}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{ref.timestamp}</span>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    {ref.verseReference}
                  </span>
                </div>
                
                <p className={`mt-5 text-lg leading-relaxed font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  "{ref.text}"
                </p>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-6">
                  <button 
                    onClick={() => handleLike(ref.id)}
                    className="flex items-center gap-2 group/btn"
                  >
                    <div className={`p-2.5 rounded-full transition-all ${isDarkMode ? 'bg-red-500/10 text-red-400 group-hover/btn:bg-red-500/20' : 'bg-red-50 text-red-500 group-hover/btn:bg-red-100'}`}>
                      <Heart className={`w-4 h-4 ${ref.likes > 15 ? 'fill-current' : ''}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ref.likes} Amén</span>
                  </button>
                  <button className="flex items-center gap-2 group/btn">
                    <div className={`p-2.5 rounded-full transition-all ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 group-hover/btn:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 group-hover/btn:bg-indigo-100'}`}>
                      <Share2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compartir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
