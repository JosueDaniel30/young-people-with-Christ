
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Bot, Trash2, Volume2, MessageSquare, Share2, Copy, FileText, Check, PlayCircle } from 'lucide-react';
import { createBibleChat, playAudio } from '../services/geminiService';
import { loadDB } from '../store/db';
import { feedback } from '../services/audioFeedback';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Sub-componente para renderizar un mensaje individual
const MessageItem: React.FC<{ 
  message: Message, 
  isDarkMode: boolean, 
  onPlay: (text: string) => void 
}> = ({ message, isDarkMode, onPlay }) => {
  const isUser = message.sender === 'user';
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    setIsPlaying(true);
    feedback.playClick();
    await onPlay(message.text);
    // Como playAudio no tiene un evento de finalización sencillo, 
    // reseteamos el estado visual después de un tiempo razonable o lo dejamos estático
    setTimeout(() => setIsPlaying(false), 2000);
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <div className={`flex gap-4 max-w-[92%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xl transition-transform hover:scale-110 ${
          isUser 
            ? 'bg-[#1A3A63] border border-white/20' 
            : 'bg-[#B91C1C] border border-white/10'
        }`}>
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </div>

        {/* Bubble */}
        <div className={`relative group p-6 rounded-[32px] shadow-sm border transition-all ${
          isUser 
            ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-indigo-500/30 rounded-tr-none' 
            : isDarkMode 
              ? 'bg-slate-800/80 text-slate-200 border-slate-700/50 rounded-tl-none backdrop-blur-sm' 
              : 'bg-white text-slate-800 border-slate-100 rounded-tl-none shadow-indigo-100/50'
        }`}>
          <p className={`text-base leading-relaxed ${!isUser ? 'font-serif-italic text-lg italic' : 'font-medium'}`}>
            {message.text}
          </p>
          
          <div className={`flex items-center justify-between mt-5 pt-3 border-t ${isUser ? 'flex-row-reverse border-white/10' : isDarkMode ? 'border-slate-700/50' : 'border-slate-50'}`}>
            <span className={`text-[9px] font-black uppercase tracking-widest opacity-40`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {!isUser && (
              <button 
                onClick={handlePlay}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 ${
                  isPlaying 
                    ? 'bg-indigo-500 text-white animate-pulse' 
                    : isDarkMode 
                      ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
                title="Escuchar sabiduría"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">Escuchar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-componente para sugerencias rápidas
const ChatSuggestions: React.FC<{ 
  onSelect: (text: string) => void, 
  isDarkMode: boolean 
}> = ({ onSelect, isDarkMode }) => {
  const suggestions = [
    "¿Cómo puedo orar mejor?",
    "Explícame Romanos 8:28",
    "Consejos para mi fe",
    "¿Qué dice la Biblia del estrés?"
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
      {suggestions.map((s, i) => (
        <button 
          key={i}
          onClick={() => { feedback.playClick(); onSelect(s); }}
          className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all active:scale-95 shadow-sm ${
            isDarkMode 
              ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50' 
              : 'bg-white border-indigo-50 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
};

const AIChat: React.FC = () => {
  const state = loadDB();
  const isDarkMode = state.user.theme === 'dark';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inicializar chat solo una vez
  useEffect(() => {
    if (!chatRef.current) {
      chatRef.current = createBibleChat();
      
      // Mensaje de bienvenida inicial
      setMessages([
        {
          id: 'welcome',
          text: `¡Hola ${state.user.name.split(' ')[0]}! Soy tu mentor espiritual Ignite. Estoy aquí para acompañarte en tu caminar con Cristo. ¿En qué puedo fortalecer tu fe hoy?`,
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [state.user.name]);

  // Autoscroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend || isLoading) return;

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
        text: response.text || "Lo siento, hubo una interrupción en mi conexión celestial. ¿Podemos intentarlo de nuevo?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Parece que hay una interferencia. La Palabra dice que Dios es nuestra fortaleza en tiempos de prueba; intentémoslo en un momento.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    feedback.playClick();
    setMessages([
      {
        id: Date.now().toString(),
        text: `Conversación reiniciada. ¿Tienes una nueva pregunta o versículo para analizar hoy?`,
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    chatRef.current = createBibleChat();
  };

  const handleShareChat = () => {
    feedback.playClick();
    const chatText = messages.map(m => `${m.sender === 'user' ? 'Yo' : 'Mentor'}: ${m.text}`).join('\n\n');
    if (navigator.share) {
      navigator.share({
        title: 'Conversación con Mentor Ignite',
        text: chatText,
      }).catch(console.error);
    }
  };

  const handleCopyChat = () => {
    feedback.playClick();
    setCopying(true);
    const chatText = messages.map(m => `${m.sender === 'user' ? 'Yo' : 'Mentor'}: ${m.text}`).join('\n\n');
    navigator.clipboard.writeText(chatText).then(() => {
      setTimeout(() => setCopying(false), 2000);
    });
  };

  const handleSavePDF = () => {
    feedback.playClick();
    window.print();
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col p-4 sm:p-10 space-y-6 animate-in slide-in-from-bottom duration-700">
      {/* Header del Chat */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-3xl ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h2 className={`text-3xl sm:text-4xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Mentor Espiritual</h2>
            <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1 ${isDarkMode ? 'text-indigo-400' : 'text-slate-400'}`}>Guiado por la Palabra • RVR60</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className={`p-4 rounded-full transition-all group ${isDarkMode ? 'bg-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-400/10' : 'bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
          title="Reiniciar Mentoría"
        >
          <Trash2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Area de Mensajes */}
      <div className={`flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 rounded-[56px] border shadow-inner transition-all scrollbar-hide ${isDarkMode ? 'bg-[#1e293b]/30 border-slate-700/50 shadow-indigo-500/5' : 'bg-white border-slate-100'}`}>
        {messages.map((m) => (
          <MessageItem 
            key={m.id} 
            message={m} 
            isDarkMode={isDarkMode} 
            onPlay={playAudio} 
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#B91C1C] animate-pulse shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className={`p-6 rounded-[32px] rounded-tl-none flex items-center gap-4 border ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-indigo-400' : 'bg-slate-50 border-slate-100 text-indigo-600'}`}>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                </div>
                <span className="text-xs font-black uppercase tracking-widest opacity-60">Consultando sabiduría...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Botones de Acción Post-Conversación */}
      {messages.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0 animate-in slide-in-from-top-4 duration-500">
          <button 
            onClick={handleShareChat}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-indigo-400 hover:border-indigo-500' : 'bg-white border-indigo-50 text-indigo-600 hover:border-indigo-200'}`}
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
          <button 
            onClick={handleCopyChat}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100'}`}
          >
            {copying ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copying ? 'Copiado' : 'Copiar Todo'}
          </button>
          <button 
            onClick={handleSavePDF}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100'}`}
          >
            <FileText className="w-4 h-4" />
            Guardar PDF
          </button>
        </div>
      )}

      {/* Controles de Entrada */}
      <div className="shrink-0 space-y-4">
        {!isLoading && messages.length < 15 && (
          <ChatSuggestions onSelect={setInput} isDarkMode={isDarkMode} />
        )}

        <div className="flex gap-4 p-2">
          <div className="relative flex-1 group">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregunta sobre la fe, la Biblia o tu propósito..."
              className={`w-full px-10 py-6 rounded-[40px] text-base sm:text-lg focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all shadow-2xl border-2 ${
                isDarkMode 
                  ? 'bg-slate-800 text-white placeholder:text-slate-500 border-slate-700 hover:border-slate-600' 
                  : 'bg-white text-slate-800 placeholder:text-slate-400 border-slate-100 hover:border-indigo-100 shadow-indigo-100/50'
              }`}
            />
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-full transition-colors ${isDarkMode ? 'bg-indigo-500/50 group-focus-within:bg-indigo-400' : 'bg-indigo-100 group-focus-within:bg-indigo-600'}`} />
          </div>
          
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-6 rounded-full shadow-2xl transition-all active:scale-90 disabled:opacity-50 disabled:scale-100 border-2 border-transparent ${
              isDarkMode 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40' 
                : 'bg-[#1A3A63] hover:bg-[#152e4f] text-white shadow-indigo-900/20'
            }`}
          >
            <Send className="w-8 h-8 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
