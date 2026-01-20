
import React, { useState } from 'react';
import { Sparkles, AlertCircle, Loader2, Mail, Lock, User, Zap, ArrowRight, ShieldAlert } from 'lucide-react';
import { feedback } from '../services/audioFeedback.ts';
import { auth } from '../services/firebaseConfig.ts';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { syncUserToFirebase, loadDB, saveDB } from '../store/db.ts';

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = async () => {
    feedback.playClick();
    if (isRegister && !name.trim()) { setError('Dinos tu nombre, guerrero'); return; }
    if (!email || !pass) { setError('Faltan credenciales'); return; }
    
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(userCredential.user, { displayName: name });
        const state = loadDB();
        await syncUserToFirebase({ ...state.user, name, email });
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
      
      feedback.playSuccess();
      onLogin();
    } catch (err: any) {
      console.error(err);
      setError('Error al conectar con el Altar. Intenta Modo Invitado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    feedback.playSuccess();
    // Simular un login local exitoso
    const state = loadDB();
    state.user.id = 'guest_' + Date.now();
    state.user.name = 'Guerrero Invitado';
    saveDB(state);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-violet-600/20 blur-[180px] rounded-full animate-pulse" />
      
      <div className="w-full max-w-md relative z-10 space-y-10">
        <div className="text-center space-y-4">
          <Zap className="w-16 h-16 text-white mx-auto fill-current animate-bounce" />
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase font-heading">IGNITE</h1>
        </div>

        <div className="glass p-10 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black text-white uppercase">{isRegister ? 'Nueva Alianza' : 'Acceso Guerrero'}</h2>
          </div>
          
          <div className="space-y-5">
            {isRegister && (
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Tu Nombre" 
                className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-5 text-white focus:border-violet-500 outline-none transition-all" 
              />
            )}
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Email" 
              className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-5 text-white focus:border-violet-500 outline-none transition-all" 
            />
            <input 
              type="password" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              placeholder="Password" 
              className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-5 text-white focus:border-violet-500 outline-none transition-all" 
            />
            {error && (
              <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleAuthAction} 
              disabled={isLoading} 
              className="w-full bg-gradient-to-r from-violet-600 to-rose-600 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl shadow-violet-500/20"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isRegister ? 'Registrarse' : 'Entrar')}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[9px] font-black text-slate-500 uppercase">o también</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button 
              onClick={handleGuestLogin} 
              className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/10"
            >
              <User className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest">Entrar como Invitado</span>
            </button>
          </div>

          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className="w-full text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] hover:text-white transition-colors"
          >
            {isRegister ? '¿Ya tienes cuenta? Entra' : '¿Eres nuevo? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
