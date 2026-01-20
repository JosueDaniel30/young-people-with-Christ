import { feedback } from "./audioFeedback";
import { loadDB, saveDB } from "../store/db";

/**
 * Intento de copia al portapapeles con fallback para entornos con restricciones de permisos.
 */
const copyToClipboard = async (text: string) => {
  // Intento 1: API moderna de portapapeles
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("Clipboard API falló, usando fallback...", err);
    }
  }

  // Intento 2: Fallback usando un elemento textarea invisible (compatible con más entornos)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Asegurarse de que el elemento no sea visible pero esté en el DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (!successful) throw new Error("execCommand('copy') no tuvo éxito");
    return true;
  } catch (err) {
    console.error("Fallback de copia falló también:", err);
    return false;
  }
};

/**
 * Servicio unificado para compartir contenido.
 * Intenta usar navigator.share y cae en copia al portapapeles como respaldo.
 */
export const shareContent = async (title: string, text: string, url?: string) => {
  feedback.playClick();
  const shareUrl = url || window.location.href;
  const shareData = { title, text, url: shareUrl };

  // 1. Intentar compartir nativo (Mobile/System Share)
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return false;
      console.warn('Share API falló, intentando portapapeles...', err);
    }
  }

  // 2. Fallback: Copiar al portapapeles
  const fullText = `${title}\n\n${text}\n\nMira más en: ${shareUrl}`;
  const wasCopied = await copyToClipboard(fullText);

  if (wasCopied) {
    // Notificar al usuario a través del sistema de la app
    const db = loadDB();
    db.notifications.unshift({
      id: Date.now().toString(),
      title: '¡Copiado!',
      message: 'Contenido guardado en el portapapeles para compartir.',
      time: 'Ahora',
      read: false,
      type: 'info'
    });
    saveDB(db);
    feedback.playNotification();
    return true;
  }

  return false;
};