
/**
 * Servicio de notificaciones nativas del navegador mejorado.
 */
class NotificationService {
  /**
   * Solicita permiso para mostrar notificaciones.
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn("Este navegador no soporta notificaciones de escritorio");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.error("Error al solicitar permisos de notificación:", e);
      return false;
    }
  }

  /**
   * Envía una notificación local usando el Service Worker.
   */
  async sendLocalNotification(title: string, body: string, enabled: boolean, data?: any) {
    // Si las notificaciones globales no están habilitadas por el usuario o permiso denegado, salir
    if (!enabled || Notification.permission !== 'granted') return;

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body,
          icon: 'https://api.dicebear.com/7.x/shapes/png?seed=Zap&backgroundColor=d97706',
          badge: 'https://api.dicebear.com/7.x/shapes/png?seed=Zap&backgroundColor=d97706',
          vibrate: [200, 100, 200],
          data: data || { url: window.location.origin },
          tag: 'ignite-alert',
          silent: false
        } as any);
      } catch (e) {
        console.warn("Service Worker no listo para notificaciones, usando fallback.");
        new Notification(title, { body, icon: 'https://api.dicebear.com/7.x/shapes/png?seed=Zap&backgroundColor=d97706' });
      }
    } else {
      new Notification(title, { body, icon: 'https://api.dicebear.com/7.x/shapes/png?seed=Zap&backgroundColor=d97706' });
    }
  }

  getPermissionStatus(): string {
    return 'Notification' in window ? Notification.permission : 'denied';
  }
}

export const notificationService = new NotificationService();
