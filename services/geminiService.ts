
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { getCachedChapter } from "../store/db";
import { BibleVerse } from "../types";
import { fetchFullChapter, searchLocalBible } from "./bibleRepository";

const QUOTA_KEY = 'ignite_ai_daily_quota';
const MAX_DAILY_QUOTA = 10;

/**
 * Gestiona el límite de 10 consultas diarias
 */
export const getRemainingQuota = () => {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(QUOTA_KEY);
  
  if (!stored) return MAX_DAILY_QUOTA;
  
  const { date, count } = JSON.parse(stored);
  if (date !== today) return MAX_DAILY_QUOTA;
  
  return Math.max(0, MAX_DAILY_QUOTA - count);
};

const incrementQuotaUsage = () => {
  const today = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(QUOTA_KEY);
  let count = 0;
  
  if (stored) {
    const parsed = JSON.parse(stored);
    count = parsed.date === today ? parsed.count : 0;
  }
  
  localStorage.setItem(QUOTA_KEY, JSON.stringify({ date: today, count: count + 1 }));
};

const USE_EXTERNAL_BACKEND = false;
const BACKEND_URL = "/api/ignite-mentor";

let sharedAudioContext: AudioContext | null = null;

const requestAI = async (prompt: any, config: any = {}) => {
  if (getRemainingQuota() <= 0) {
    throw new Error("Has alcanzado tu límite de 10 consultas por hoy. ¡Medita en lo aprendido y vuelve mañana!");
  }

  if (USE_EXTERNAL_BACKEND) {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, config })
    });
    const data = await response.json();
    incrementQuotaUsage();
    return data;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const modelName = config.model || 'gemini-3-flash-preview';
    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        ...config,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    incrementQuotaUsage();
    return result;
  } catch (error: any) {
    console.error("AI Bridge Error:", error);
    throw new Error(error.message?.includes('429') 
      ? "Muchos jóvenes consultando. Intenta en un minuto." 
      : "Error en la conexión espiritual.");
  }
};

export const analyzeVerse = async (verse: string) => {
  const prompt = `Analiza este versículo (RVR1960) para un joven Gen Z. Sé directo, usa lenguaje moderno pero respetuoso. 
    Estructura: 
    1. ¿Qué significa esto hoy?
    2. Un "Desafío Ignite" práctico.
    Versículo: "${verse}"`;
  
  const response = await requestAI([{ parts: [{ text: prompt }] }]);
  return response.text;
};

/**
 * Obtiene un versículo aleatorio sobre TODA la biblia (66 libros).
 * No consume cuota diaria.
 */
export const getRandomVerse = async (): Promise<BibleVerse> => {
  const fallbacks = [
    { book: 'Josué', chapter: 1, verse: 9, text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.' },
    { book: 'Salmos', chapter: 23, verse: 1, text: 'Jehová es mi pastor; nada me faltará.' },
    { book: 'Proverbios', chapter: 3, verse: 5, text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.' }
  ];
  
  if (!navigator.onLine) return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Prompt optimizado para aleatoriedad total
    const prompt = `Selecciona un versículo TOTALMENTE ALEATORIO de cualquiera de los 66 libros de la Biblia Reina Valera 1960. 
    IMPORTANTE: No te limites a los versículos famosos. Puede ser de los Profetas Menores, Epístolas, Libros Históricos o el Pentateuco. 
    Hoy es ${new Date().toDateString()}. Sorpréndenos con una joya oculta de la Escritura.
    Responde UNICAMENTE con este formato JSON: {"book": "Nombre", "chapter": 1, "verse": 1, "text": "Contenido"}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            book: { type: Type.STRING },
            chapter: { type: Type.NUMBER },
            verse: { type: Type.NUMBER },
            text: { type: Type.STRING }
          },
          required: ["book", "chapter", "verse", "text"]
        }
      }
    });
    return JSON.parse(response.text?.trim() || '{}') as BibleVerse;
  } catch (error) {
    console.error("Error obteniendo versículo aleatorio:", error);
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};

export const searchBible = async (params: any) => {
  if (params.book && params.chapter && !params.verse && !params.query) {
    const results = await fetchFullChapter(params.book, params.chapter);
    return results.length === 0 ? (getCachedChapter(params.book, params.chapter) || []) : results;
  }

  const queryText = typeof params === 'string' ? params : params.query;
  if (!navigator.onLine) return searchLocalBible(queryText);
  
  try {
    const response = await requestAI(`Busca versículos RVR1960 relacionados con: "${queryText}". JSON ARRAY [book, chapter, verse, text]`, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            book: { type: Type.STRING },
            chapter: { type: Type.NUMBER },
            verse: { type: Type.NUMBER },
            text: { type: Type.STRING }
          },
          required: ["book", "chapter", "verse", "text"]
        }
      }
    });
    return JSON.parse(response.text?.trim() || '[]');
  } catch (e) {
    return searchLocalBible(queryText);
  }
};

export const playAudio = async (text: string) => {
  if (!navigator.onLine || !text) return;
  try {
    if (!sharedAudioContext) {
      sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (sharedAudioContext.state === 'suspended') await sharedAudioContext.resume();

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const audioBuffer = await decodeAudioData(decode(base64Audio), sharedAudioContext, 24000, 1);
    const source = sharedAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(sharedAudioContext.destination);
    source.start(0);
  } catch (error) {
    console.error("TTS Error:", error);
  }
};

export const createBibleChat = (onMessageSent?: () => void) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Eres un Mentor Espiritual de Ignite Youth. Usas la Biblia RVR1960.
      Guía a los jóvenes con amor, autoridad bíblica y un lenguaje actual pero respetuoso.`,
      thinkingConfig: { thinkingBudget: 0 }
    },
  });

  const originalSendMessage = chat.sendMessage.bind(chat);
  chat.sendMessage = async (args: any) => {
    if (getRemainingQuota() <= 0) {
      throw new Error("Límite diario alcanzado.");
    }
    const response = await originalSendMessage(args);
    incrementQuotaUsage();
    if (onMessageSent) onMessageSent();
    return response;
  };

  return chat;
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
