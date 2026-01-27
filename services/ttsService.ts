
import { feedback } from "./audioFeedback";

/**
 * ttsService.ts - Sistema de Audio Nativo de Alta Fidelidad
 * Optimizado para dispositivos móviles y voces naturales.
 */

class TTSService {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (!this.synth) return;

    const loadVoices = () => {
      this.voices = this.synth!.getVoices();
      this.isInitialized = true;
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Asegura que las voces estén cargadas antes de intentar hablar.
   */
  private async ensureVoices(): Promise<void> {
    if (this.isInitialized && this.voices.length > 0) return;
    
    return new Promise((resolve) => {
      const check = () => {
        if (this.synth?.getVoices().length) {
          this.voices = this.synth.getVoices();
          this.isInitialized = true;
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  /**
   * Selecciona la mejor voz disponible para el dispositivo actual.
   */
  private getBestVoice() {
    const spanishVoices = this.voices.filter(v => v.lang.startsWith('es'));
    
    // Prioridad 1: Voces Premium/Siri en iOS
    const premium = spanishVoices.find(v => v.name.includes('Premium') || v.name.includes('Enhanced'));
    if (premium) return premium;

    // Prioridad 2: Voces de Google (Android) que son muy naturales
    const google = spanishVoices.find(v => v.name.includes('Google'));
    if (google) return google;

    // Prioridad 3: Voces por defecto del sistema
    const defaults = spanishVoices.find(v => v.default);
    if (defaults) return defaults;

    return spanishVoices[0] || null;
  }

  public async play(text: string) {
    if (!this.synth) return;

    // Esperar a que el sistema móvil esté listo
    await this.ensureVoices();
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getBestVoice();

    if (voice) {
      utterance.voice = voice;
      // Ajustar parámetros según la voz para máxima naturalidad
      const isEnhanced = voice.name.includes('Premium') || voice.name.includes('Google');
      utterance.rate = isEnhanced ? 0.9 : 0.85; // Un poco más lento si la voz es básica
    }

    utterance.lang = 'es-ES';
    utterance.pitch = 1.05; // Un tono ligeramente más cálido
    utterance.volume = 1.0;

    // Fix para móvil: Evitar que el GC limpie la instancia durante lecturas largas
    this.currentUtterance = utterance;

    // Manejo de eventos para UI
    utterance.onstart = () => {
      console.log("Iniciando lectura natural...");
    };

    utterance.onend = () => {
      this.currentUtterance = null;
    };

    utterance.onerror = (event) => {
      console.error("Error de audio nativo:", event);
      this.currentUtterance = null;
    };

    this.synth.speak(utterance);
    feedback.playClick();
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const tts = new TTSService();
