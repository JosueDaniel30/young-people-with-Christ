
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Trash2, Volume2, Share2, Copy, Check, X, AlertTriangle, Loader2, Zap, Brain, Stars, Heart, BookOpen, Flame, Waves, MessageCircle } from 'lucide-react';
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
    feedback.playClick();
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500`}>
      <div className={`flex items-start gap-3 max-w-[92%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-bold border shadow-lg ${
          isUser 
            ? 'bg-amber-700 border-white/20 text-white shadow-amber-900/20' 
            : 'bg-amber-100 dark:bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
        }`}>
          {isUser ? <User className="w-5 h-5" /> : <MessageCircle className="w-5 h-5 fill-current" />}
        </div>

        <div className="flex flex-col gap-2">
          {!isUser && (
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400 ml-1">Abba Mentor</span>
          )}

          <div className={`relative px-6 py-5 rounded-[2.2rem] shadow-xl border transition-all ${
            isUser 
              ? 'bg-gradient-to-br from-amber-600 to-orange-700 border-white/10 text-white rounded-tr-none' 
              : isDarkMode 
                ? 'bg-[#0f0802] border-amber-500/10 text-slate-100 rounded-tl-none'
                : 'bg-white border-amber-100 text-slate-800 rounded-tl-none shadow-amber-100/20'
          }`}>
            <p className="text-sm sm:text-base leading-relaxed font-medium whitespace-pre-wrap">
              {message.text}
            </p>

            <div className={`flex items-center gap-4 mt-5 pt-3 border-t ${isUser ? 'border-white/10' : 'border-amber-500/10'}`}>
              <span className={`text-[8px] font-black uppercase tracking-widest opacity-30`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              <div className="flex-1" />

              {!isUser && (
                <div className="flex gap-2">
                  <button onClick={() => { feedback.playClick(); onPlay(message.text); }} className="p-2 hover:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 transition-all">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button onClick={handleCopy} className="p-2 hover:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 transition-all">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => shareContent("Consejo Paternal", message.text)} className="p-2 hover:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 transition-all">
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

  // Inicialización del chat y detección de prompts pendientes
  useEffect(() => {
    const initChat = async () => {
      if (!chatRef.current) {
        chatRef.current = createBibleChat();
        
        // Mensaje inicial por defecto si no hay historial
        if (messages.length === 0) {
          setMessages([
            {
              id: 'welcome',
              text: `Hijo mío, qué alegría saludarte. Aquí estoy para escucharte y compartir contigo la sabiduría que nuestro Padre Celestial ha puesto en mi camino.\n\n¿Qué es lo que inquieta tu corazón el día de hoy?`,
              sender: 'bot',
              timestamp: new Date()
            }
          ]);
        }
      }

      // Detectar si venimos de un análisis de versículo
      const pending = localStorage.getItem('ignite_pending_prompt');
      if (pending) {
        localStorage.removeItem('ignite_pending_prompt');
        // Pequeño delay para que la UI se asiente antes de enviar
        setTimeout(() => handleSend(pending), 500);
      }
    };

    initChat();
  }, []);

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
      if (!chatRef.current) chatRef.current = createBibleChat();
      const response = await chatRef.current.sendMessage({ message: textToSend });
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text || "La señal espiritual es débil, hijo mío. Intenta reconectar.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      feedback.playNotification();
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Parece que hay un poco de interferencia en este momento. Pidamos guía y vuelve a intentarlo.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`h-[calc(100dvh-180px)] flex flex-col relative transition-all overflow-hidden ${isDarkMode ? 'bg-[#030014]/40' : 'bg-transparent'}`}>
      
      {/* Header Estilo "Estudio Paternal" */}
      <div className={`sticky top-0 z-30 flex justify-between items-center p-6 border-b backdrop-blur-xl ${isDarkMode ? 'bg-[#0a0502]/60 border-white/5 shadow-2xl' : 'bg-white/80 border-amber-50 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
               <MessageCircle className="w-7 h-7 fill-current" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div className="flex flex-col">
            <h2 className={`text-base font-black uppercase tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Abba Mentor</h2>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500 mt-1">Chat Activo</span>
          </div>
        </div>
        <button 
          onClick={() => { feedback.playClick(); setShowDeleteConfirm(true); }} 
          className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Area de Mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} isDarkMode={isDarkMode} onPlay={playAudio} />
        ))}
        {isLoading && (
          <div className="flex gap-4 items-center pl-2 pb-10 animate-in fade-in duration-500">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60">Buscando en la Palabra...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input */}
      <div className={`p-6 border-t backdrop-blur-xl ${isDarkMode ? 'bg-[#0a0502]/80 border-white/5' : 'bg-white/90 border-amber-50 shadow-[0_-15px_30px_rgba(251,191,36,0.05)]'}`}>
        {!isLoading && messages.length < 5 && (
          <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
             {[
               { t: '¿Cómo puedo perdonar?', i: <Heart className="w-3.5 h-3.5" /> },
               { t: 'Dame una palabra de paz', i: <Waves className="w-3.5 h-3.5" /> },
               { t: 'Siento soledad hoy', i: <Stars className="w-3.5 h-3.5" /> },
               { t: 'Consejo para mi futuro', i: <Zap className="w-3.5 h-3.5" /> }
             ].map((s, i) => (
               <button 
                key={i} 
                onClick={() => handleSend(s.t)}
                className={`px-5 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-3 whitespace-nowrap transition-all active:scale-95 ${
                  isDarkMode ? 'bg-white/5 border-white/10 text-amber-400/80' : 'bg-white border-amber-100 text-amber-600 shadow-sm'
                }`}
               >
                 {s.i} {s.t}
               </button>
             ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className={`flex-1 flex items-center px-6 py-2 rounded-[2rem] border-2 transition-all ${isDarkMode ? 'bg-black/40 border-white/5 focus-within:border-amber-500/50' : 'bg-slate-50 border-amber-100 focus-within:border-amber-500 focus-within:bg-white'}`}>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-transparent py-4 text-sm outline-none font-medium placeholder:text-slate-400"
            />
          </div>

          <button 
            onClick={() => handleSend()} 
            disabled={!input.trim() || isLoading} 
            className="w-14 h-14 shrink-0 rounded-[1.8rem] bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xl shadow-orange-500/20 active:scale-90 transition-all disabled:opacity-30"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Modal Confirmación de Borrado */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className={`w-full max-w-sm rounded-[3rem] p-10 space-y-8 text-center border shadow-2xl animate-in slide-in-from-bottom-6 ${isDarkMode ? 'bg-[#0a0502] border-amber-500/20 text-white' : 'bg-white border-amber-100'}`}>
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mx-auto border border-amber-500/20">
              <MessageCircle className="w-10 h-10" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black uppercase tracking-tighter">¿Limpiar consejos?</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Las palabras compartidas volverán al corazón de Dios. El historial se borrará.</p>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { setMessages([]); setShowDeleteConfirm(false); feedback.playSuccess(); }} 
                className="w-full bg-amber-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-600/20"
              >
                Limpiar Chat
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-600'}`}
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
