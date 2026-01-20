
import React, { useState, useEffect } from 'react';
import { Heart, Send, User, Sparkles, Plus, Loader2, Clock, ShieldCheck, Flame, Waves, Users, Zap } from 'lucide-react';
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
  increment,
  arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { loadDB, addFEPoints, addNotification } from '../store/db';
import { feedback } from '../services/audioFeedback';

const PrayerRequests: React.FC<{ refreshState: () => void }> = ({ refreshState }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  const [newRequest, setNewRequest] = useState({
    text: '',
    category: 'Otros'
  });

  const categories = ['Salud', 'Familia', 'Estudios', 'Provisión', 'Guía', 'Otros'];

  useEffect(() => {
    const q = query(collection(db, "prayer_requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timeLabel: d.data().createdAt ? new Date(d.data().createdAt.seconds * 1000).toLocaleDateString() : 'Ahora'
      }));
      setRequests(docs);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.text.trim() || isPosting) return;

    setIsPosting(true);
    feedback.playClick();

    try {
      await addDoc(collection(db, "prayer_requests"), {
        userId: auth.currentUser?.uid || 'anon',
        userName: state.user.name,
        userPhoto: state.user.photoUrl,
        request: newRequest.text,
        category: newRequest.category,
        createdAt: serverTimestamp(),
        prayersCount: 0,
        prayers: []
      });

      await addFEPoints(30, 'Pedir oración');
      setNewRequest({ text: '', category: 'Otros' });
      setShowForm(false);
      feedback.playSuccess();
      refreshState();
    } catch (error) {
      console.error("Error posting prayer:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleJoinPrayer = async (requestId: string, requesterName: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    feedback.playSuccess();
    const reqDoc = doc(db, "prayer_requests", requestId);
    
    await updateDoc(reqDoc, {
      prayersCount: increment(1),
      prayers: arrayUnion(userId)
    });

    addNotification('¡Guerrero en Acción!', `Te has unido en oración por ${requesterName}`, 'info');
  };

  return (
    <div className="p-4 sm:p-10 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-40">
      
      {/* Header Interactivo */}
      <section className="relative overflow-hidden rounded-[3.5rem] p-10 sm:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 opacity-90 animate-gradient-xy" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
               <Waves className="w-4 h-4 text-white animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Atmósfera de Gloria</span>
             </div>
             <h2 className="text-4xl sm:text-7xl font-black text-white tracking-tighter font-heading leading-tight">
               ALTAR DE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">INTERCESIÓN</span>
             </h2>
             <p className="text-white/70 font-medium max-w-sm italic">"Donde dos o tres se ponen de acuerdo..." Tu petición es nuestro clamor.</p>
          </div>

          <button 
            onClick={() => { feedback.playClick(); setShowForm(!showForm); }}
            className="group px-10 py-6 bg-white text-blue-600 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            Clamar por algo
          </button>
        </div>
      </section>

      {/* Formulario de Petición */}
      {showForm && (
        <form onSubmit={handleSubmit} className={`p-10 rounded-[3rem] border-2 animate-in slide-in-from-top duration-500 space-y-8 ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-blue-50 shadow-2xl shadow-blue-100/30'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-4">Categoría del Clamor</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewRequest({...newRequest, category: cat as any})}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newRequest.category === cat ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-500'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-4">Tu Necesidad</label>
               <textarea 
                value={newRequest.text}
                onChange={(e) => setNewRequest({...newRequest, text: e.target.value})}
                placeholder="Describe tu petición con fe..."
                className={`w-full p-6 rounded-[2rem] h-32 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium ${isDarkMode ? 'bg-black/40 text-white border-white/5' : 'bg-slate-50 text-slate-800'}`}
               />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setShowForm(false)} className="text-[10px] font-black uppercase text-slate-400">Cancelar</button>
            <button 
              type="submit" 
              disabled={isPosting || !newRequest.text.trim()}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl disabled:opacity-50"
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar al Altar
            </button>
          </div>
        </form>
      )}

      {/* Lista de Peticiones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Abriendo los Cielos...</p>
          </div>
        ) : requests.length > 0 ? (
          requests.map((req) => {
            const alreadyPraying = req.prayers?.includes(auth.currentUser?.uid);
            return (
              <div key={req.id} className={`group p-8 rounded-[3.5rem] border-2 transition-all hover:scale-[1.02] relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-white/5 shadow-2xl shadow-blue-900/10' : 'bg-white border-blue-50 shadow-xl shadow-blue-100/20'}`}>
                
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img src={req.userPhoto} className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/20" alt={req.userName} />
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight">{req.userName}</h4>
                      <div className="flex items-center gap-2">
                         <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>{req.category}</span>
                         <span className="text-[8px] text-slate-400 font-bold uppercase">{req.timeLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <Zap className="w-4 h-4 text-blue-500 fill-current animate-pulse" />
                  </div>
                </div>

                <p className={`text-xl font-medium leading-relaxed italic mb-8 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  "{req.request}"
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-blue-500">{req.prayersCount} <span className="text-[9px] text-slate-400 uppercase tracking-widest ml-1">Orando</span></span>
                  </div>

                  <button 
                    onClick={() => handleJoinPrayer(req.id, req.userName)}
                    disabled={alreadyPraying}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all ${
                      alreadyPraying 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30 active:scale-95'
                    }`}
                  >
                    <Flame className={`w-4 h-4 ${alreadyPraying ? 'animate-pulse' : ''}`} />
                    {alreadyPraying ? 'Estoy Orando' : 'Unirme en Oración'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-40 text-center space-y-6">
             <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto">
               <ShieldCheck className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-lg font-bold opacity-30 uppercase tracking-widest">El altar está listo para recibir tu clamor</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerRequests;
