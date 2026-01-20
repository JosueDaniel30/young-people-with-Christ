
import { loadDB } from "../store/db";

class NotificationService {
  /**
   * Solicita permiso para mostrar notificaciones.
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn("Este navegador no soporta notificaciones de escritorio");
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Envía una notificación local usando el Service Worker (si está activo).
   */
  async sendLocalNotification(title: string, body: string, data?: any) {
    const db = loadDB();
    if (!db.user.notificationsEnabled || Notification.permission !== 'granted') return;

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      // Fixed: Cast the options object to 'any' to avoid TypeScript errors regarding the 'vibrate' property in NotificationOptions
      registration.showNotification(title, {
        body,
        icon: 'https://api.dicebear.com/7.x/shapes/png?seed=Ignite&backgroundColor=7c3aed',
        badge: 'https://api.dicebear.com/7.x/shapes/png?seed=Ignite&backgroundColor=7c3aed',
        vibrate: [200, 100, 200],
        data: data || { url: window.location.origin },
        tag: 'ignite-alert'
      } as any);
    } else {
      new Notification(title, { body });
    }
  }

  /**
   * Comprueba el estado actual de los permisos.
   */
  getPermissionStatus(): string {
    return Notification.permission;
  }
}

export const notificationService = new NotificationService();
