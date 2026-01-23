
/**
 * API Service - Producción Ready.
 * NOTA: La aplicación actualmente usa LocalStorage para máxima velocidad.
 * Antes de lanzar a miles de usuarios, implementa este servicio con un backend real
 * para evitar pérdida de datos si el usuario limpia su navegador.
 */

class ApiService {
  private isDevelopment = true;

  constructor() {
    if (this.isDevelopment) {
      console.warn("Ignite Youth: Usando persistencia local. Se recomienda migrar a Supabase/Firebase para producción.");
    }
  }

  async syncData(data: any) {
    // Aquí iría tu lógica de sincronización con el servidor
    return null;
  }
}

export const api = new ApiService();
