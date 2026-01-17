
import React, { useState } from 'react';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { feedback } from '../services/audioFeedback';

const Auth: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [imgError, setImgError] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLoginClick = () => {
    feedback.playClick();
    
    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (!validateEmail(email)) {
      setError('El formato del correo electrónico no es válido.');
      return;
    }

    // Si todo está bien, limpiar error e iniciar sesión
    setError('');
    onLogin();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background with responsive height and improved centering */}
      <div className="absolute top-0 left-0 w-full h-[50%] sm:h-[45%] bg-[#1A3A63] rounded-b-[80px] flex flex-col items-center justify-center p-8 text-white text-center shadow-[0_20px_50px_rgba(26,58,99,0.3)] transition-all duration-700">
        
        {/* Glow behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative mb-8 group">
          {/* Main Logo Container - Larger and more prominent */}
          <div className="bg-white p-6 rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex items-center justify-center min-w-[180px] min-h-[180px] sm:min-w-[220px] sm:min-h-[220px] transition-transform duration-500 group-hover:scale-105 border-4 border-white/10">
            {!imgError ? (
              <img 
                src="LOGO.png" 
                alt="Jóvenes con Cristo Logo" 
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-sm"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-36 h-36 flex flex-col items-center justify-center text-[#1A3A63] font-black tracking-tighter">
                <span className="text-5xl mb-2">✝️</span>
                <span className="text-lg">JÓVENES</span>
                <span className="text-[#B91C1C] text-sm">CON CRISTO</span>
              </div>
            )}
          </div>
          
          {/* Animated decorative elements */}
          <div className="absolute -top-4 -right-4 bg-red-500 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 bg-indigo-500 w-6 h-6 rounded-full animate-pulse shadow-md" />
        </div>
        
        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-white drop-shadow-md">Comunidad Ignite</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-8 bg-white/30" />
            <p className="text-base sm:text-lg font-black uppercase tracking-[0.3em] text-indigo-300">Jóvenes con Cristo</p>
            <div className="h-[1px] w-8 bg-white/30" />
          </div>
        </div>
      </div>

      {/* Login Card - Repositioned for better balance */}
      <div className="flex-1 flex items-center justify-center px-6 z-10 w-full pt-[45vh] sm:pt-[10vh] mb-10">
        <div className="bg-white rounded-[48px] p-8 sm:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] space-y-8 border border-slate-100 w-full max-w-lg transition-all">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">¡Hola de nuevo!</h2>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">Tu camino espiritual te espera</p>
          </div>
          
          <div className="space-y-5">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2 ml-4">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) setError(''); // Limpiar error al escribir
                }}
                placeholder="tu@email.com" 
                className={`w-full bg-slate-50 border-2 rounded-[24px] px-6 py-4 text-slate-700 focus:bg-white transition-all outline-none text-sm font-semibold shadow-inner ${
                  error ? 'border-red-400 focus:border-red-500' : 'border-transparent focus:border-[#1A3A63]'
                }`}
              />
              {error && (
                <div className="flex items-center gap-2 mt-2 ml-4 text-red-500 animate-in fade-in slide-in-from-top-1 duration-300">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">{error}</span>
                </div>
              )}
            </div>
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2 ml-4">Contraseña</label>
              <input 
                type="password" 
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] px-6 py-4 text-slate-700 focus:bg-white focus:border-[#1A3A63] transition-all outline-none text-sm font-semibold shadow-inner"
              />
            </div>
          </div>

          <button 
            onClick={handleLoginClick}
            className="w-full bg-[#1A3A63] text-white font-black py-5 rounded-[24px] shadow-[0_20px_40px_-10px_rgba(26,58,99,0.4)] flex items-center justify-center gap-3 hover:bg-[#152e4f] hover:-translate-y-1 active:scale-95 transition-all group uppercase tracking-widest text-xs sm:text-sm"
          >
            ENTRAR A LA COMUNIDAD
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">O conéctate con</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleLoginClick}
              className="flex items-center justify-center gap-3 py-4 px-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Google</span>
            </button>
            <button 
              onClick={handleLoginClick}
              className="flex items-center justify-center gap-3 py-4 px-4 bg-[#1877F2] text-white rounded-2xl hover:bg-[#166fe5] transition-all active:scale-95 group shadow-lg shadow-blue-500/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
            </button>
          </div>

          <div className="flex justify-center pt-2">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              ¿No tienes cuenta? <span className="text-[#1A3A63] cursor-pointer hover:underline font-black">Únete ahora</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
