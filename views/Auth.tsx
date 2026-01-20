
import React, { useState } from 'react';
import { Sparkles, AlertCircle, Loader2, Mail, Lock, User, Zap, ArrowRight } from 'lucide-react';
import { feedback } from '../services/audioFeedback.ts';
import { auth } from '../services/firebaseConfig.ts';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { syncUserToFirebase, loadDB } from '../store/db.ts';

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
    
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(userCredential.user, { displayName: name });
        // Sincronizar perfil inicial
        const state = loadDB();
        await syncUserToFirebase({ ...state.user, name, email });
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
      
      feedback.playSuccess();
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
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
                placeholder="Nombre" 
                className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-5 text-white focus:border-violet-500 outline-none" 
              />
            )}
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Email" 
              className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-5 text-white focus:border-violet-500 outline-none" 
            />
            <input 
              type="password" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              placeholder="Password" 
              className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-5 text-white focus:border-violet-500 outline-none" 
            />
            {error && <p className="text-rose-400 text-xs font-bold text-center">{error}</p>}
          </div>

          <button 
            onClick={handleAuthAction} 
            disabled={isLoading} 
            className="w-full bg-gradient-to-r from-violet-600 to-rose-600 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-4 active:scale-95 transition-all"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isRegister ? 'Registrarse' : 'Entrar')}
          </button>

          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className="w-full text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]"
          >
            {isRegister ? '¿Ya tienes cuenta? Entra' : '¿Eres nuevo? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
