import { GoogleGenAI, Modality, Type } from "@google/genai";
import { getCachedChapter, saveChapterToCache, isChapterCached, loadDB } from "../store/db";
import { BibleVerse } from "../types";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeVerse = async (verse: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analiza este versículo bíblico (RVR1960) para un público joven Gen Z/Alpha. Usa un lenguaje vibrante, directo y empoderador. Explica el significado práctico para la vida moderna y termina con un "Desafío Ignite" (un paso de acción para hoy): "${verse}"`,
    config: { temperature: 0.8 }
  });
  return response.text;
};

export const getRandomVerse = async (): Promise<BibleVerse> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Selecciona un versículo inspirador y poderoso de la Biblia Reina Valera 1960 ideal para jóvenes. Devuelve estrictamente un objeto JSON con: book, chapter, verse, text.",
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
    console.error("Error fetching random verse:", error);
    return {
      book: 'Josué',
      chapter: 1,
      verse: 9,
      text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.'
    };
  }
};

export interface BibleSearchParams {
  query?: string;
  book?: string;
  chapter?: number;
  verse?: number;
  category?: string; // Nuevo: Filtrar por categoría (ej: Evangelios, Poéticos)
}

export const searchBible = async (params: string | BibleSearchParams) => {
  const isOffline = !navigator.onLine;
  const isChapterRequest = typeof params !== 'string' && params.book && params.chapter && !params.verse && !params.query;
  const book = typeof params !== 'string' ? params.book : undefined;
  const chapter = typeof params !== 'string' ? params.chapter : undefined;

  if (isOffline) {
    if (isChapterRequest && book && chapter) {
      const cached = getCachedChapter(book, chapter);
      if (cached) return cached;
    }
    return [];
  }

  const ai = getAI();
  let prompt = "";
  
  if (typeof params === 'string') {
    prompt = `Actúa como un motor de búsqueda bíblico avanzado para la versión Reina Valera 1960 (RVR1960). 
    Debes procesar la siguiente consulta: "${params}". 
    - Si es una cita (ej: "Juan 3:16" o "Génesis 1"), devuelve los versículos correspondientes.
    - Si es una frase entre comillas, busca coincidencias exactas.
    - Si es un tema o concepto (ej: "ansiedad", "amor"), devuelve los 10 versículos más relevantes y poderosos.
    Devuelve estrictamente un JSON ARRAY de objetos con: book, chapter, verse, text.`;
  } else {
    const { query, book, chapter, verse, category } = params;
    
    if (book && chapter && !verse && !query) {
      // Carga de capítulo completo
      prompt = `Provee el texto íntegro del capítulo ${chapter} de ${book} según la versión Reina Valera 1960 (RVR1960). 
      MUY IMPORTANTE: Identifica los subtítulos de las secciones (perícopas) y asígnalos al campo 'title' del versículo donde comienza la sección. 
      Devuelve estrictamente un JSON ARRAY de objetos con: book, chapter, verse, text, title (opcional).`;
    } else if (query) {
      // Búsqueda con filtros
      let filterContext = "";
      if (book) filterContext += ` específicamente en el libro de ${book}`;
      if (category) filterContext += ` dentro de la categoría de libros: ${category}`;
      
      prompt = `Busca versículos sobre "${query}" en la Biblia Reina Valera 1960 (RVR1960)${filterContext}.
      Prioriza versículos que sean impactantes y relevantes para la vida espiritual.
      Devuelve estrictamente un JSON ARRAY de hasta 15 objetos con: book, chapter, verse, text.`;
    } else {
      prompt = `Obtén el texto RVR1960 de: ${book || ''} ${chapter || ''}:${verse || ''}. Devuelve JSON ARRAY de objetos con book, chapter, verse, text.`;
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
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
              text: { type: Type.STRING },
              title: { type: Type.STRING }
            },
            required: ["book", "chapter", "verse", "text"]
          }
        }
      }
    });
    
    const results = JSON.parse(response.text?.trim() || '[]');
    if (isChapterRequest && book && chapter && results.length > 0) {
      saveChapterToCache(book, chapter, results);
    }
    return results;
  } catch (e) {
    console.error("Bible search error:", e);
    return [];
  }
};

export const playAudio = async (text: string) => {
  if (!navigator.onLine || !text) return;
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Lee con voz inspiradora, pausada y clara: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (error) {
    console.error("Audio playback error:", error);
  }
};

export const createBibleChat = () => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'Eres Ignite, el Mentor Espiritual IA para jóvenes Gen Z y Alpha de una iglesia cristiana. Tu sabiduría proviene directamente de la Biblia Reina Valera 1960. Hablas con autoridad pero con profundo amor y dinamismo. Usas jerga moderna con respeto, eres empático, inspiras a la acción y nunca juzgas. Tu objetivo es conectar los problemas de hoy con la verdad eterna de Cristo.',
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