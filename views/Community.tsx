
import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, Send, User, Sparkles, PlusCircle, CloudCheck, Clock, Loader2, Quote } from 'lucide-react';
import { db, auth } from '../services/firebaseConfig';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  increment 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { loadDB, addFEPoints } from '../store/db';
import { feedback } from '../services/audioFeedback';
import { shareContent } from '../services/shareService';

const Community: React.FC<{ refreshState: () => void }> = ({ refreshState }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  const [newReflectionText, setNewReflectionText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [reflections, setReflections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  // Escuchar reflexiones de Firestore en tiempo real
  useEffect(() => {
    const q = query(collection(db, "reflections"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        // Formatear fecha legible
        timeLabel: d.data().createdAt ? new Date(d.data().createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora'
      }));
      setReflections(docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReflectionText.trim() || isPosting) return;

    setIsPosting(true);
    feedback.playClick();

    try {
      await addDoc(collection(db, "reflections"), {
        userId: auth.currentUser?.uid || 'anon',
        userName: state.user.name,
        userPhoto: state.user.photoUrl,
        verseReference: 'RVR1960', 
        text: newReflectionText,
        createdAt: serverTimestamp(),
        likes: 0
      });

      await addFEPoints(50, 'Compartir reflexión');
      setNewReflectionText('');
      setShowForm(false);
      feedback.playSuccess();
      refreshState();
    } catch (error) {
      console.error("Error publicando:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (id: string) => {
    feedback.playClick();
    const refDoc = doc(db, "reflections", id);
    await updateDoc(refDoc, {
      likes: increment(1)
    });
  };

  return (
    <div className="p-4 sm:p-10 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      
      {/* Header Estilizado */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="text-center sm:text-left">
          <h2 className={`text-4xl sm:text-6xl font-black uppercase tracking-tighter font-heading ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            MURO DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">VIDA</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">La comunidad Ignite conectada</p>
        </div>
        
        <button 
          onClick={() => { feedback.playClick(); setShowForm(!showForm); }}
          className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Nueva Reflexión
        </button>
      </div>

      {/* Formulario de Nueva Reflexión */}
      {showForm && (
        <form onSubmit={handleSubmit} className={`p-8 rounded-[3rem] border-2 animate-in slide-in-from-top duration-500 space-y-6 ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-violet-100 shadow-2xl shadow-violet-100/30'}`}>
          <div className="flex items-center gap-4 mb-2">
             <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
               <Sparkles className="w-5 h-5" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">¿Qué te ha revelado el Espíritu hoy?</p>
          </div>
          
          <textarea 
            value={newReflectionText}
            onChange={(e) => setNewReflectionText(e.target.value)}
            placeholder="Escribe tu reflexión aquí..."
            className={`w-full p-8 rounded-[2rem] h-40 outline-none focus:ring-2 focus:ring-violet-500 transition-all text-lg font-medium leading-relaxed resize-none ${isDarkMode ? 'bg-black/40 text-white border-white/5' : 'bg-slate-50 text-slate-800 border-transparent'}`}
          />
          
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</button>
            <button 
              type="submit" 
              disabled={isPosting || !newReflectionText.trim()}
              className="px-10 py-4 rounded-xl bg-violet-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-lg disabled:opacity-50"
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
              Publicar (+50 XP)
            </button>
          </div>
        </form>
      )}

      {/* Feed de Reflexiones */}
      <div className="space-y-10">
        {isLoading ? (
          <div className="py-40 flex flex-col items-center justify-center space-y-6">
             <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando con el Altar...</p>
          </div>
        ) : reflections.length > 0 ? (
          reflections.map((ref) => (
            <div key={ref.id} className={`p-10 rounded-[3.5rem] border-2 transition-all hover:scale-[1.01] relative group overflow-hidden ${isDarkMode ? 'bg-slate-900 border-white/5 hover:border-violet-500/20' : 'bg-white border-violet-50 shadow-xl shadow-violet-100/20'}`}>
              
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Quote className="w-24 h-24" />
              </div>

              <div className="flex flex-col sm:flex-row gap-8 relative z-10">
                <div className="shrink-0 flex sm:flex-col items-center gap-4">
                  <img src={ref.userPhoto} alt={ref.userName} className="w-16 h-16 rounded-[1.5rem] object-cover border-2 border-violet-500/20 shadow-lg" />
                  <div className="h-px w-8 bg-violet-500/20 hidden sm:block" />
                </div>

                <div className="flex-1 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h4 className={`font-black text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{ref.userName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{ref.timeLabel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20">
                       <CloudCheck className="w-3 h-3" />
                       <span className="text-[8px] font-black uppercase tracking-widest">Verificado Cloud</span>
                    </div>
                  </div>

                  <p className={`text-xl sm:text-2xl leading-relaxed font-medium italic ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    "{ref.text}"
                  </p>

                  <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button onClick={() => handleLike(ref.id)} className="flex items-center gap-3 group/btn">
                        <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-rose-500/10 text-rose-400 group-hover/btn:bg-rose-500/20' : 'bg-rose-50 text-rose-500 group-hover/btn:bg-rose-100'}`}>
                          <Heart className={`w-5 h-5 ${ref.likes > 0 ? 'fill-current' : ''}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-500">{ref.likes}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Amén</span>
                        </div>
                      </button>

                      <button 
                        onClick={() => shareContent(`Reflexión de ${ref.userName}`, ref.text)}
                        className="flex items-center gap-3 group/btn"
                      >
                        <div className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-violet-500/10 text-violet-400 group-hover/btn:bg-violet-500/20' : 'bg-violet-50 text-violet-600 group-hover/btn:bg-violet-100'}`}>
                          <Share2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compartir</span>
                      </button>
                    </div>

                    <div className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-white/5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ref.verseReference}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-40 text-center space-y-6">
             <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto">
               <MessageSquare className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-lg font-bold opacity-30 uppercase tracking-widest">El muro está esperando tu voz</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
