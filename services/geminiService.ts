
import { GoogleGenAI, Modality, Type } from "@google/genai";

// Always use a single instance initialized with the environment variable API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeVerse = async (verse: string) => {
  // Use the singleton instance for content generation
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analiza este versículo bíblico (Reina Valera 1960) para un público joven. Explica su significado práctico y cómo aplicarlo hoy: "${verse}"`,
    config: {
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 0 }
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
  let prompt = "";
  if (typeof params === 'string') {
    prompt = `Actúa como un buscador de la Biblia Reina Valera 1960. Encuentra los 5 versículos más relevantes para la búsqueda: "${params}". Responde en formato JSON.`;
  } else {
    const { query, book, chapter, verse } = params;
    prompt = `Actúa como un buscador experto de la Biblia Reina Valera 1960.
    Busca versículos con los siguientes criterios:
    ${book ? `- Libro: ${book}` : ''}
    ${chapter ? `- Capítulo: ${chapter}` : ''}
    ${verse ? `- Versículo: ${verse}` : ''}
    ${query ? `- Palabras clave: ${query}` : ''}
    
    Si se proporciona una referencia específica (libro, capítulo, versículo), devuélvela exactamente.
    Si solo hay palabras clave, busca los 5 más relevantes.
    Responde estrictamente en formato JSON siguiendo el esquema proporcionado.`;
  }

  // Use the singleton instance for content generation with JSON response
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
    // Extract text safely and parse JSON
    return JSON.parse(response.text?.trim() || '[]');
  } catch (e) {
    console.error("Error parsing search results", e);
    return [];
  }
};

export const playAudio = async (text: string) => {
  try {
    // Generate speech using the specific TTS model and modality
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Lee con voz inspiradora y clara: ${text}` }] }],
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
    // Use manually implemented decode and decodeAudioData functions as per guidelines
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1,
    );
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (error) {
    console.error("Error generating audio", error);
  }
};

// New Bible Chat initialization
export const createBibleChat = () => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'Eres un mentor espiritual para jóvenes de una iglesia cristiana. Respondes preguntas sobre la Biblia (Reina Valera 1960), fe, vida cristiana y dudas sobre la iglesia con un tono empático, moderno, esperanzador y bíblico. Tus respuestas deben ser breves pero profundas, usando un lenguaje que un adolescente o joven adulto entienda.',
    },
  });
};

// Manually implemented decoding functions following the provided guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
