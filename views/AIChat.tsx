
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Trash2, Volume2, Share2, Copy, Check, X, AlertTriangle, Loader2, Zap, Brain, Stars, Heart, BookOpen, Flame, Waves } from 'lucide-react';
import { createBibleChat, playAudio } from '../services/geminiService';
import { loadDB, addNotification } from '../store/db';
import { feedback } from '../services/audioFeedback';
import { shareContent } from '../services/shareService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const MessageItem: React.FC<{ 
  message: Message, 
  isDarkMode: boolean, 
  onPlay: (text: string) => void 
}> = ({ message, isDarkMode, onPlay }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    feedback.playClick();
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-in slide-in-from-bottom-2 fade-in duration-300`}>
      <div className={`flex items-end gap-2 max-w-[90%] sm:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar Mini para móvil */}
        <div className={`hidden sm:flex shrink-0 w-8 h-8 rounded-lg items-center justify-center text-[10px] font-bold border ${
          isUser ? 'bg-violet-600 border-white/20 text-white' : 'bg-slate-900 border-violet-500/30 text-violet-400'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
        </div>

        <div className="flex flex-col gap-1">
          {/* Nombre/Etiqueta opcional para Bot */}
          {!isUser && (
            <span className="text-[9px] font-black uppercase tracking-widest text-violet-500 ml-2 mb-1">Mentor Ignite</span>
          )}

          <div className={`relative px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-lg border transition-all ${
            isUser 
              ? 'bg-gradient-to-br from-violet-600 to-indigo-700 border-white/10 text-white rounded-br-none' 
              : isDarkMode 
                ? 'bg-slate-900/90 backdrop-blur-md border-white/5 text-slate-100 rounded-bl-none'
                : 'bg-white border-violet-100 text-slate-800 rounded-bl-none shadow-violet-100'
          }`}>
            <p className="text-sm sm:text-base leading-relaxed font-medium">
              {message.text}
            </p>

            <div className={`flex items-center gap-3 mt-3 pt-2 border-t ${isUser ? 'border-white/10' : 'border-black/5 dark:border-white/5'}`}>
              <span className={`text-[8px] font-bold uppercase tracking-widest opacity-40`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              <div className="flex-1" />

              {!isUser && (
                <div className="flex gap-1">
                  <button onClick={() => { feedback.playClick(); onPlay(message.text); }} className="p-1.5 hover:bg-violet-500/10 rounded-lg text-violet-500 transition-all">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleCopy} className="p-1.5 hover:bg-violet-500/10 rounded-lg text-violet-500 transition-all">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => shareContent("Revelación Ignite", message.text)} className="p-1.5 hover:bg-violet-500/10 rounded-lg text-violet-500 transition-all">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIChat: React.FC = () => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatRef.current) {
      chatRef.current = createBibleChat();
      setMessages([
        {
          id: 'welcome',
          text: `¡Hola ${state.user.name.split(' ')[0]}! Soy tu Mentor Ignite. ¿Qué hay en tu corazón hoy?`,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [state.user.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input.trim();
    if (!textToSend || isLoading) return;

    feedback.playClick();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: textToSend });
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || "La señal espiritual es débil. Intenta reconectar.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      feedback.playNotification();
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Interferencia en el plano espiritual. ¡Intenta de nuevo!",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`h-[calc(100dvh-180px)] flex flex-col relative transition-all overflow-hidden ${isDarkMode ? 'bg-[#030014]/40' : 'bg-transparent'}`}>
      
      {/* Header Compacto */}
      <div className={`sticky top-0 z-30 flex justify-between items-center p-4 border-b backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/60 border-white/5 shadow-2xl' : 'bg-white/80 border-violet-100 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg">
               <Brain className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div className="flex flex-col">
            <h2 className={`text-sm font-black uppercase tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mentor Ignite</h2>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500">En línea</span>
          </div>
        </div>
        <button 
          onClick={() => { feedback.playClick(); setShowDeleteConfirm(true); }} 
          className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Area de Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} isDarkMode={isDarkMode} onPlay={playAudio} />
        ))}
        {isLoading && (
          <div className="flex gap-3 items-center pl-2 pb-8 animate-in fade-in duration-500">
            <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
            <span className="text-[9px] font-black uppercase tracking-widest text-violet-500/60">Escuchando...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input */}
      <div className={`p-4 border-t backdrop-blur-xl ${isDarkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white/90 border-violet-50 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]'}`}>
        {/* Sugerencias Rápidas (Scroll Horizontal) */}
        {!isLoading && messages.length < 5 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide">
             {[
               { t: '¿Cómo orar?', i: <Waves className="w-3 h-3" /> },
               { t: 'Promesa de paz', i: <Heart className="w-3 h-3" /> },
               { t: 'Misión hoy', i: <Flame className="w-3 h-3" /> },
               { t: 'Contexto RVR1960', i: <BookOpen className="w-3 h-3" /> }
             ].map((s, i) => (
               <button 
                key={i} 
                onClick={() => handleSend(s.t)}
                className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all active:scale-95 ${
                  isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-violet-100 text-slate-500 shadow-sm'
                }`}
               >
                 {s.i} {s.t}
               </button>
             ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className={`flex-1 flex items-center px-4 py-1.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-black/40 border-white/10 focus-within:border-violet-500' : 'bg-slate-50 border-violet-100 focus-within:border-violet-500 focus-within:bg-white'}`}>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-transparent py-3 text-sm outline-none font-medium placeholder:text-slate-500"
            />
          </div>

          <button 
            onClick={() => handleSend()} 
            disabled={!input.trim() || isLoading} 
            className="w-12 h-12 shrink-0 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-30"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Modal Confirmación de Borrado */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 space-y-6 text-center border shadow-2xl animate-in slide-in-from-bottom-4 ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-violet-100'}`}>
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase tracking-tight">¿Limpiar historial?</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Esta acción borrará los mensajes actuales del mentor.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setMessages([]); setShowDeleteConfirm(false); feedback.playSuccess(); }} 
                className="w-full bg-rose-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg"
              >
                Confirmar Borrado
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
