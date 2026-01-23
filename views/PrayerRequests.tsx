
import React, { useState } from 'react';
import { Heart, Send, Plus, Clock, ShieldCheck, Flame, Waves, Users, Zap } from 'lucide-react';
import { loadDB, addPrayerRequest, joinPrayer } from '../store/db';
import { feedback } from '../services/audioFeedback';

const PrayerRequests: React.FC<{ refreshState: () => void }> = ({ refreshState }) => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  const requests = state.prayerRequests || [];
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ text: '', category: 'Otros' });

  const categories = ['Salud', 'Familia', 'Estudios', 'Provisión', 'Guía', 'Otros'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.text.trim()) return;

    feedback.playClick();
    addPrayerRequest(newRequest);
    setNewRequest({ text: '', category: 'Otros' });
    setShowForm(false);
    feedback.playSuccess();
    refreshState();
  };

  return (
    <div className="p-4 sm:p-10 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-40">
      <section className="relative overflow-hidden rounded-[3.5rem] p-10 sm:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-yellow-600 opacity-90 animate-gradient-xy" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
               <Waves className="w-4 h-4 text-white animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Altar de Clamor</span>
             </div>
             <h2 className="text-4xl sm:text-7xl font-black text-white tracking-tighter font-heading leading-tight">
               FUEGO DE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">INTERCESIÓN</span>
             </h2>
          </div>
          <button 
            onClick={() => { feedback.playClick(); setShowForm(!showForm); }}
            className="px-10 py-6 bg-white text-orange-700 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-4"
          >
            <Plus className="w-6 h-6" /> Abrir Petición
          </button>
        </div>
      </section>

      {showForm && (
        <form onSubmit={handleSubmit} className={`p-10 rounded-[3rem] border-2 animate-in slide-in-from-top duration-500 space-y-8 ${isDarkMode ? 'bg-amber-950/20 border-amber-500/10' : 'bg-white border-amber-100 shadow-2xl shadow-amber-100/30'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-4">Categoría</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat} type="button"
                    onClick={() => setNewRequest({...newRequest, category: cat})}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newRequest.category === cat ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-amber-50 dark:bg-white/5 border-transparent text-amber-700/60'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-4">Tu Necesidad</label>
               <textarea 
                value={newRequest.text}
                onChange={(e) => setNewRequest({...newRequest, text: e.target.value})}
                placeholder="Dinos tu carga, hijo mío..."
                className={`w-full p-6 rounded-[2rem] h-32 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium ${isDarkMode ? 'bg-black/40 text-white border-white/5' : 'bg-amber-50/50 text-amber-950 border-transparent'}`}
               />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => setShowForm(false)} className="text-[10px] font-black uppercase text-amber-700/40">Cancelar</button>
            <button type="submit" className="px-10 py-4 bg-amber-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl shadow-amber-600/20">
              <Send className="w-4 h-4" /> Enviar al Altar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div key={req.id} className={`group p-8 rounded-[3.5rem] border-2 transition-all relative overflow-hidden ${isDarkMode ? 'bg-amber-950/20 border-white/5' : 'bg-white border-amber-50 shadow-xl shadow-amber-100/10'}`}>
              <div className="flex items-center gap-4 mb-6">
                <img src={req.userPhoto} className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/20" alt="" />
                <div>
                  <h4 className="font-black text-sm uppercase text-amber-950 dark:text-amber-50">{req.userName}</h4>
                  <span className="text-[8px] text-amber-700/40 font-black uppercase">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className={`text-xl font-medium italic mb-8 ${isDarkMode ? 'text-amber-100/80' : 'text-amber-900/80'}`}>"{req.request}"</p>
              <div className="flex items-center justify-between pt-6 border-t border-amber-500/10">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-amber-700/40" />
                  <span className="text-xs font-black text-amber-600">{req.prayersCount} Unidoss</span>
                </div>
                <button 
                  onClick={() => { joinPrayer(req.id); refreshState(); }}
                  disabled={req.prayers.includes(state.user.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-[9px] transition-all shadow-md active:scale-95 ${req.prayers.includes(state.user.id) ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-600 text-white shadow-amber-600/20'}`}
                >
                  <Flame className="w-4 h-4" /> {req.prayers.includes(state.user.id) ? 'Estoy Orando' : 'Unirme'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-40 text-center">
             <ShieldCheck className="w-12 h-12 text-amber-200 mx-auto mb-4" />
             <p className="text-lg font-bold opacity-30 uppercase tracking-widest text-amber-800">El Altar de Clamor está listo para recibirte.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerRequests;
