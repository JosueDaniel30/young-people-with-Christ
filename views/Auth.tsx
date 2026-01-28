
import React, { useState } from 'react';
import { AlertCircle, Loader2, User, Zap, Mail, Lock, Ghost } from 'lucide-react';
import { feedback } from '../services/audioFeedback.ts';
import { auth, db } from '../services/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  updateProfile 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { saveDB, loadDB } from '../store/db';
import { INITIAL_USER } from '../constants';

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = async () => {
    feedback.playClick();
    if (isRegister && !name.trim()) { setError('Dinos tu nombre, hijo mío'); return; }
    if (!email || !pass) { setError('Faltan credenciales para entrar al hogar'); return; }
    
    setError('');
    setIsLoading(true);

    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(userCredential.user, { displayName: name });
        
        const newUser = {
          ...INITIAL_USER,
          id: userCredential.user.uid,
          name: name,
          email: email,
          lastLoginDate: new Date().toISOString()
        };
        await setDoc(doc(db, "users", userCredential.user.uid), newUser);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, pass);
      }

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const state = loadDB();
      state.user = userDoc.exists() ? userDoc.data() as any : { ...INITIAL_USER, id: userCredential.user.uid, name: userCredential.user.displayName || 'Joven' };
      saveDB(state);

      feedback.playSuccess();
      onLogin();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('Este correo ya tiene un hogar Ignite.');
      else if (err.code === 'auth/wrong-password') setError('La llave no coincide con el candado.');
      else if (err.code === 'auth/user-not-found') setError('No encontramos este correo en el rebaño.');
      else setError('Hubo un error en la conexión espiritual.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    feedback.playClick();
    setError('');
    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;
      
      const userDocRef = doc(db, "users", uid);
      let userData;

      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          userData = userDoc.data();
        } else {
          userData = { 
            ...INITIAL_USER, 
            id: uid, 
            name: 'Invitado Sabio',
            isGuest: true,
            lastLoginDate: new Date().toISOString()
          };
          setDoc(userDocRef, userData).catch(() => {});
        }
      } catch (docErr) {
        // Silencio para evitar advertencias de offline innecesarias
        userData = { ...INITIAL_USER, id: uid, name: 'Invitado (Offline)' };
      }

      const state = loadDB();
      state.user = userData as any;
      saveDB(state);
      
      feedback.playSuccess();
      onLogin();
    } catch (e: any) {
      console.error("Error en login anónimo:", e);
      setError('La puerta está trabada. Revisa tu internet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-amber-600/20 blur-[180px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-orange-600/10 blur-[150px] rounded-full" />
      
      <div className="w-full max-w-md relative z-10 space-y-10">
        <div className="text-center space-y-4">
          <Zap className="w-16 h-16 text-amber-500 mx-auto fill-current animate-bounce-slow" />
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase font-heading">IGNITE</h1>
        </div>

        <div className="glass p-10 rounded-[3.5rem] border border-white/10 shadow-2xl space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black text-amber-50 uppercase tracking-tight">
              {isRegister ? 'Nueva Alianza' : 'Entrar al Hogar'}
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/60">
              {isRegister ? 'Comienza tu viaje espiritual' : 'Continúa tu camino de fe'}
            </p>
          </div>
          
          <div className="space-y-5">
            {isRegister && (
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Tu nombre o apodo" 
                  className="w-full bg-black/40 border border-white/5 rounded-3xl pl-16 pr-8 py-5 text-white focus:border-amber-500 outline-none transition-all placeholder:text-white/20" 
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Correo electrónico" 
                className="w-full bg-black/40 border border-white/5 rounded-3xl pl-16 pr-8 py-5 text-white focus:border-amber-500 outline-none transition-all placeholder:text-white/20" 
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="password" 
                value={pass} 
                onChange={e => setPass(e.target.value)} 
                placeholder="Contraseña" 
                className="w-full bg-black/40 border border-white/5 rounded-3xl pl-16 pr-8 py-5 text-white focus:border-amber-500 outline-none transition-all placeholder:text-white/20" 
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400 text-xs font-bold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleAuthAction} 
              disabled={isLoading} 
              className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white font-black py-6 rounded-3xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="uppercase tracking-[0.2em] text-[10px]">{isRegister ? 'Comenzar Pacto' : 'Entrar en Comunión'}</span>
              )}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">O también</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <button 
              onClick={handleGuestLogin} 
              disabled={isLoading}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/10 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <Ghost className="w-4 h-4 text-amber-500" />}
              <span className="text-[10px] uppercase tracking-widest">Entrar como Invitado</span>
            </button>
          </div>

          <button 
            onClick={() => { feedback.playClick(); setIsRegister(!isRegister); }} 
            className="w-full text-amber-700/60 text-[9px] font-black uppercase tracking-[0.4em] hover:text-amber-500 transition-colors"
          >
            {isRegister ? '¿Ya eres parte de Ignite? Entra' : '¿Aún no tienes cuenta? Únete'}
          </button>
        </div>
      </div>
    </div>
  );
}
