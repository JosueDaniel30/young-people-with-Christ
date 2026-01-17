
import React, { useState } from 'react';
import { ArrowRight, Sparkles, AlertCircle, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { feedback } from '../services/audioFeedback';

const Auth: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('joven123@gmial.com');
  const [pass, setPass] = useState('Dios12345');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAuthAction = async () => {
    feedback.playClick();
    
    if (isRegister && !name.trim()) {
      setError('Por favor, ingresa tu nombre completo.');
      return;
    }

    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (!validateEmail(email)) {
      setError('El formato del correo electrónico no es válido.');
      return;
    }

    if (pass.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  const handleSocialLogin = (provider: string) => {
    feedback.playClick();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-[45%] sm:h-[40%] bg-[#1A3A63] rounded-b-[80px] flex flex-col items-center justify-center p-8 text-white text-center shadow-[0_20px_50px_rgba(26,58,99,0.3)] transition-all duration-700`}>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative mb-6 group">
          <div className="bg-white p-4 rounded-[32px] shadow-2xl flex items-center justify-center min-w-[140px] min-h-[140px] sm:min-w-[180px] sm:min-h-[180px] transition-transform duration-500 group-hover:scale-105 border-4 border-white/10">
            <div className="flex flex-col items-center text-[#1A3A63] font-black">
              <span className="text-6xl sm:text-7xl">
              <img src="LOGOJOV.png" alt="Logo" className="w-40 h-40 rounded-full object-cover border-4 border-white dark:border-slate-800" />
              </span>
              <span className="text-xs uppercase tracking-[0.3em] mt-2">Jóvenes con Cristo</span>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase text-white">Comunidad Ignite</h1>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-indigo-300">Encendiendo el fuego de la fe</p>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 z-10 w-full pt-[40vh] sm:pt-[35vh] pb-10">
        <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] space-y-6 border border-slate-100 w-full max-w-md animate-in slide-in-from-bottom-8 duration-500">
          
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {isRegister ? 'Crea tu cuenta' : '¡Bienvenido de nuevo!'}
            </h2>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
              {isRegister ? 'Únete a la nueva generación' : 'Tu camino espiritual continúa'}
            </p>
          </div>
          
          <div className="space-y-4">
            {isRegister && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-4">Nombre Completo</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Tu nombre real" 
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3.5 text-slate-700 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-semibold shadow-inner"
                />
              </div>
            )}

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-4">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="correo@ejemplo.com" 
                className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-3.5 text-slate-700 focus:bg-white transition-all outline-none text-sm font-semibold shadow-inner ${
                  error && !email ? 'border-red-400' : 'border-transparent focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-4">Contraseña</label>
              <input 
                type="password" 
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="Contraseña segura" 
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-3.5 text-slate-700 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-semibold shadow-inner"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-xl animate-in shake duration-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wide leading-tight">{error}</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleAuthAction}
            disabled={isLoading}
            className="w-full bg-[#1A3A63] text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-[#152e4f] active:scale-95 transition-all group uppercase tracking-widest text-[10px] disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isRegister ? 'Registrarme' : 'Entrar'}
                {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              </>
            )}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">O continúa con</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleSocialLogin('Google')} disabled={isLoading} className="flex items-center justify-center gap-2 py-3.5 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Google</span>
            </button>
            <button onClick={() => handleSocialLogin('Facebook')} disabled={isLoading} className="flex items-center justify-center gap-2 py-3.5 bg-[#1877F2] text-white rounded-2xl hover:bg-[#166fe5] transition-all active:scale-95 disabled:opacity-50">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-[9px] font-black uppercase tracking-widest text-white">Facebook</span>
            </button>
          </div>

          <div className="flex justify-center pt-2">
            <button 
              onClick={() => {
                feedback.playClick();
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
            >
              {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
              <span className="text-[#1A3A63] font-black underline">
                {isRegister ? 'Inicia sesión' : 'Únete ahora'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
