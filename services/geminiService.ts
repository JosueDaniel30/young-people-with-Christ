
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { loadDB, getCachedChapter } from "../store/db";
import { BibleVerse } from "../types";
import { fetchFullChapter, searchLocalBible } from "./bibleRepository";

let sharedAudioContext: AudioContext | null = null;

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeVerse = async (verse: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analiza este versículo (RVR1960) para un joven Gen Z. Sé directo, usa lenguaje moderno pero respetuoso. 
    Estructura: 
    1. ¿Qué significa esto hoy?
    2. Un "Desafío Ignite" práctico.
    Versículo: "${verse}"`,
    config: { 
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 0 } 
    }
  });
  return response.text;
};

export const getRandomVerse = async (): Promise<BibleVerse> => {
  const fallbacks = [
    { book: 'Josué', chapter: 1, verse: 9, text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.' },
    { book: 'Salmos', chapter: 23, verse: 1, text: 'Jehová es mi pastor; nada me faltará.' },
    { book: 'Juan', chapter: 3, verse: 16, text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.' }
  ];
  
  if (!navigator.onLine) return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Genera un versículo RVR1960 inspirador al azar. JSON: book, chapter, verse, text.",
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
    return fallbacks[0];
  }
};

export const searchBible = async (params: any) => {
  // 1. Caso: Solicitud de Capítulo Completo
  // Si tenemos libro y capítulo, usamos el repositorio estructurado (que tiene caché integrado)
  if (params.book && params.chapter && !params.verse && !params.query) {
    const results = await fetchFullChapter(params.book, params.chapter);
    
    // Si por alguna razón fetchFullChapter devolvió vacío (ej. offline y no cacheado),
    // intentamos una última búsqueda directa en el caché de la DB por si acaso.
    if (results.length === 0) {
      return getCachedChapter(params.book, params.chapter) || [];
    }
    return results;
  }

  // 2. Caso: Búsqueda Offline
  if (!navigator.onLine) {
    const query = typeof params === 'string' ? params : (params.query || '');
    return searchLocalBible(query);
  }

  // 3. Caso: Búsqueda Semántica con IA (Online)
  const ai = getAI();
  const queryText = typeof params === 'string' ? params : params.query;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Busca versículos RVR1960 relacionados con: "${queryText}". 
      IMPORTANTE: No resumas ni omitas versículos. Devuelve el texto completo de los resultados más relevantes. 
      JSON ARRAY [book, chapter, verse, text]`,
      config: {
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
      }
    });
    const aiResults = JSON.parse(response.text?.trim() || '[]');
    return aiResults;
  } catch (e) {
    // Si la IA falla, buscar en lo que el usuario ya ha leído (integrado)
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

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
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

export const createBibleChat = () => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Eres un Mentor Espiritual de Ignite Youth. Usas la Reina Valera 1960. 
      Tu objetivo es guiar a jóvenes en sus dudas, problemas y crecimiento. 
      Habla con autoridad pero con mucho amor. Usa emojis de vez en cuando. 
      Formatea tus respuestas con negritas para versículos y listas para consejos.`,
      thinkingConfig: { thinkingBudget: 0 }
    },
  });
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
