
import { feedback } from "./audioFeedback";
import { addNotification } from "../store/db";

/**
 * Intento de copia al portapapeles con máxima compatibilidad.
 */
const copyToClipboard = async (text: string) => {
  // Intento 1: API moderna
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("Clipboard API falló:", err);
    }
  }

  // Intento 2: Fallback manual con textarea (El más compatible)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Error crítico en copiado:", err);
    return false;
  }
};

/**
 * Servicio unificado para compartir contenido "Bulletproof".
 */
export const shareContent = async (title: string, text: string, url?: string) => {
  feedback.playClick();
  
  // Limpiar textos de posibles caracteres problemáticos
  const cleanTitle = title.trim();
  const cleanText = text.trim();
  
  // Asegurar URL absoluta y válida
  let shareUrl = url || window.location.href;
  if (shareUrl.startsWith('./')) {
    shareUrl = window.location.origin + shareUrl.substring(1);
  } else if (!shareUrl.startsWith('http')) {
    shareUrl = window.location.origin + (shareUrl.startsWith('/') ? '' : '/') + shareUrl;
  }

  const shareData = { 
    title: cleanTitle, 
    text: cleanText, 
    url: shareUrl 
  };

  // 1. Intentar Share Nativo
  if (navigator.share) {
    try {
      // Validamos si la URL es realmente compartible para evitar el error "Invalid URL"
      new URL(shareUrl); 
      await navigator.share(shareData);
      return true;
    } catch (err) {
      // Si falla por URL inválida, intentamos sin URL
      if ((err as Error).name !== 'AbortError') {
        try {
          await navigator.share({ title: cleanTitle, text: cleanText });
          return true;
        } catch (innerErr) {
          console.warn('Share Nativo falló completamente, usando portapapeles.');
        }
      } else {
        return false; // El usuario canceló
      }
    }
  }

  // 2. Respaldo: Copiar al portapapeles
  const fullText = `${cleanTitle}\n\n"${cleanText}"\n\nDescubre más en: ${shareUrl}`;
  const wasCopied = await copyToClipboard(fullText);

  if (wasCopied) {
    addNotification('¡Copiado!', 'Contenido guardado. Ya puedes pegarlo en tus redes.', 'info');
    feedback.playNotification();
    return true;
  }

  return false;
};
