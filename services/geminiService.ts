
import { GoogleGenAI, Modality, Type } from "@google/genai";

// Función auxiliar para obtener la instancia de AI justo antes de usarla.
// Esto evita que la aplicación se bloquee si process.env no está definido al cargar el módulo.
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const analyzeVerse = async (verse: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analiza este versículo bíblico (Reina Valera 1960) para un público joven. Explica su significado práctico y cómo aplicarlo hoy: "${verse}"`,
    config: {
      temperature: 0.7,
    }
  });
  return response.text;
};

export interface BibleSearchParams {
  query?: string;
  book?: string;
  chapter?: number;
  verse?: number;
}

export const searchBible = async (params: string | BibleSearchParams) => {
  const ai = getAI();
  let prompt = "";
  if (typeof params === 'string') {
    prompt = `Como buscador RVR1960, encuentra 5 versículos clave sobre: "${params}". Devuelve JSON con campos: book, chapter, verse, text.`;
  } else {
    const { book, chapter, verse } = params;
    if (book && chapter && !verse) {
      prompt = `Devuelve todos los versículos del capítulo ${chapter} de ${book} (Biblia Reina Valera 1960). Sé preciso. Responde estrictamente en formato JSON ARRAY.`;
    } else {
      prompt = `Busca en RVR1960: ${book || ''} ${chapter || ''} ${verse || ''} ${params.query || ''}. Responde JSON ARRAY con campos: book, chapter, verse, text.`;
    }
  }

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
            text: { type: Type.STRING }
          },
          required: ["book", "chapter", "verse", "text"]
        }
      }
    }
  });
  
  try {
    return JSON.parse(response.text?.trim() || '[]');
  } catch (e) {
    console.error("Error al parsear Biblia", e);
    return [];
  }
};

export const playAudio = async (text: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
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
    console.error("Audio error", error);
  }
};

export const createBibleChat = () => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'Eres un mentor Ignite para jóvenes. Usas RVR60. Tono: inspirador, moderno, profundo. Respuestas breves pero sólidas.',
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
