
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-10 animate-in slide-in-from-bottom-6 fade-in duration-700`}>
      <div className={`flex gap-5 max-w-[96%] sm:max-w-[88%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar with Animation */}
        <div className={`relative shrink-0 ${!isUser ? 'animate-bounce-slow' : ''}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 border-2 transition-transform hover:scale-110 ${
            isUser 
              ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 border-white/20 text-white' 
              : 'bg-[#0f172a] border-violet-500/40 text-violet-400'
          }`}>
            {isUser ? <User className="w-6 h-6" /> : <Zap className="w-6 h-6 fill-current animate-pulse" />}
          </div>
          {!isUser && (
            <div className="absolute inset-0 bg-violet-500/30 blur-xl rounded-full animate-pulse scale-150" />
          )}
        </div>

        <div className="space-y-2">
          {/* Message Bubble */}
          <div className={`relative p-6 sm:p-8 rounded-[2.5rem] shadow-2xl border-2 transition-all ${
            isUser 
              ? 'bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 border-white/10 text-white rounded-tr-none' 
              : isDarkMode 
                ? 'bg-gradient-to-br from-violet-900/40 to-indigo-950/60 backdrop-blur-3xl border-violet-500/20 text-slate-100 rounded-tl-none shadow-violet-500/10'
                : 'bg-gradient-to-br from-white to-violet-50/50 border-violet-200 text-slate-800 rounded-tl-none shadow-violet-200/50'
          }`}>
            {/* Spiritual Tech Decorations for Bot */}
            {!isUser && (
              <div className="absolute top-4 right-4 opacity-10">
                <Sparkles className="w-8 h-8 rotate-12" />
              </div>
            )}

            <p className="text-sm sm:text-lg leading-relaxed font-medium relative z-10">
              {message.text}
            </p>

            <div className={`flex items-center gap-4 mt-6 pt-4 border-t ${isUser ? 'border-white/10' : 'border-violet-500/10'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${isUser ? 'bg-white' : 'bg-violet-500'} animate-pulse`} />
                <span className={`text-[9px] font-black uppercase tracking-widest opacity-50`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex-1" />

              {!isUser && (
                <div className="flex gap-2">
                  <button onClick={() => { feedback.playClick(); onPlay(message.text); }} className="p-2.5 bg-violet-500/10 hover:bg-violet-500/20 rounded-xl text-violet-500 transition-all active:scale-90">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button onClick={handleCopy} className="p-2.5 bg-violet-500/10 hover:bg-violet-500/20 rounded-xl text-violet-500 transition-all active:scale-90">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => shareContent("Revelación Ignite", message.text)} className="p-2.5 bg-violet-500/10 hover:bg-violet-500/20 rounded-xl text-violet-500 transition-all active:scale-90">
                    <Share2 className="w-4 h-4" />
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
          text: `¡Saludos, ${state.user.name.split(' ')[0]}! Soy tu Mentor Ignite. Mi sabiduría emana del Altar Celestial. ¿Qué misterio de la Palabra exploraremos hoy?`,
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
        text: response.text || "La señal espiritual es débil. Intenta reconectar con la fuente.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      feedback.playNotification();
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Interferencia en el plano espiritual. ¡Intenta de nuevo, guerrero!",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`h-[calc(100vh-200px)] flex flex-col p-4 sm:p-10 space-y-6 max-w-5xl mx-auto rounded-[3.5rem] relative overflow-hidden transition-all ${isDarkMode ? 'bg-[#030014]/60' : 'bg-white/40 shadow-2xl'}`}>
      
      {/* Dynamic Background Decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/30 blur-[120px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/30 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className={`relative z-10 flex justify-between items-center shrink-0 p-6 rounded-[2.5rem] border-2 shadow-2xl backdrop-blur-3xl ${isDarkMode ? 'bg-slate-900/80 border-violet-500/20 shadow-violet-900/20' : 'bg-white/80 border-violet-100 shadow-violet-100'}`}>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-2xl ring-4 ring-white/10">
               <Brain className="w-8 h-8 fill-current" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg" />
          </div>
          <div>
            <h2 className={`text-2xl font-black uppercase tracking-tighter font-heading leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mentor <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Ignite</span></h2>
            <div className="flex items-center gap-2 mt-1.5">
               <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Canal Profético Activo</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => { feedback.playClick(); setShowDeleteConfirm(true); }} 
          className={`p-4 rounded-2xl transition-all shadow-lg active:scale-90 ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-rose-500 border border-white/10' : 'bg-slate-50 text-slate-500 hover:bg-rose-50 border border-violet-50'}`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 space-y-2 scrollbar-hide py-4">
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} isDarkMode={isDarkMode} onPlay={playAudio} />
        ))}
        {isLoading && (
          <div className="flex gap-5 items-center pl-6 pb-12 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="relative">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <Sparkles className="absolute inset-0 w-8 h-8 text-fuchsia-500 opacity-30 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-500">Analizando Pergaminos...</span>
              <div className="flex gap-1 mt-1">
                 <div className="w-1 h-1 rounded-full bg-violet-500 animate-bounce" />
                 <div className="w-1 h-1 rounded-full bg-violet-500 animate-bounce [animation-delay:0.2s]" />
                 <div className="w-1 h-1 rounded-full bg-violet-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative z-20 shrink-0 p-4">
        <div className={`relative flex gap-4 p-4 rounded-[3rem] border-2 shadow-2xl transition-all backdrop-blur-3xl group ${isDarkMode ? 'bg-slate-900/60 border-white/10 focus-within:border-violet-500 shadow-black' : 'bg-white/80 border-violet-100 focus-within:border-violet-500 shadow-violet-200'}`}>
          <div className="absolute inset-0 bg-violet-500/5 rounded-[3rem] opacity-0 group-focus-within:opacity-100 transition-opacity" />
          
          <div className={`shrink-0 flex items-center justify-center pl-4 text-violet-500`}>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Dime un versículo o pide guía espiritual..."
            className="flex-1 bg-transparent py-4 text-base outline-none font-bold placeholder:text-slate-500 relative z-10"
          />

          <button 
            onClick={() => handleSend()} 
            disabled={!input.trim() || isLoading} 
            className={`w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-center shadow-xl active:scale-90 transition-all disabled:opacity-30 relative z-10 hover:shadow-violet-500/30 group/btn`}
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 -rotate-12 group-hover/btn:rotate-0 transition-transform" />}
          </button>
        </div>

        {/* Suggestion Chips */}
        {!isLoading && messages.length < 3 && (
          <div className="flex gap-3 mt-6 justify-center animate-in slide-in-from-bottom-2 duration-700">
             {[
               { t: '¿Cómo vencer la ansiedad?', i: <Waves className="w-3.5 h-3.5" /> },
               { t: 'Dame un Salmo de paz', i: <Heart className="w-3.5 h-3.5" /> },
               { t: 'Misión del Reino', i: <Flame className="w-3.5 h-3.5" /> }
             ].map((s, i) => (
               <button 
                key={i} 
                onClick={() => handleSend(s.t)}
                className={`px-5 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${
                  isDarkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:border-violet-500' : 'bg-white border-violet-100 text-slate-500 hover:border-violet-300 shadow-sm'
                }`}
               >
                 {s.i} {s.t}
               </button>
             ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in">
          <div className={`w-full max-w-md rounded-[4rem] p-12 space-y-10 text-center border-2 shadow-2xl animate-in zoom-in-95 duration-500 ${isDarkMode ? 'bg-slate-900 border-white/10 shadow-black' : 'bg-white border-violet-100 shadow-violet-200'}`}>
            <div className="relative mx-auto w-24 h-24">
               <div className="absolute inset-0 bg-rose-500/20 blur-3xl animate-pulse rounded-full" />
               <div className="relative w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center text-rose-500 border-2 border-rose-500/20">
                  <AlertTriangle className="w-12 h-12" />
               </div>
            </div>
            
            <div className="space-y-4">
              <h3 className={`text-3xl font-black uppercase tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Purificar Conversación</h3>
              <p className="text-slate-500 font-medium leading-relaxed">¿Estás seguro de que deseas eliminar este diálogo espiritual? Los mensajes se desvanecerán en la eternidad.</p>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { setMessages([]); setShowDeleteConfirm(false); feedback.playSuccess(); }} 
                className="w-full bg-rose-600 text-white py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-rose-500/40 hover:brightness-110 active:scale-95 transition-all"
              >
                Eliminar Registro
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className={`w-full py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Mantener Diálogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
