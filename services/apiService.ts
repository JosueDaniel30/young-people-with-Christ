
/**
 * API Service - Cliente unificado para comunicación con el Backend.
 * Reemplaza la URL base con la de tu servidor real (Express, Supabase, Firebase, etc.)
 */
const BASE_URL = 'https://api.ignite-church.com/v1'; // URL Hipotética

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('ignite_auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    // Simulamos latencia de red real para la experiencia de usuario
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // En un entorno real, descomentarías el fetch:
      // const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
      // if (!response.ok) throw new Error('Error en el servidor');
      // return await response.json();

      // MOCK LOGIC: Simulamos comportamiento de backend mientras no hay URL activa
      console.log(`[API ${options.method || 'GET'}] ${endpoint}`);
      return null; 
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get(endpoint: string) { return this.request(endpoint, { method: 'GET' }); }
  async post(endpoint: string, data: any) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  async patch(endpoint: string, data: any) { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }); }
}

export const api = new ApiService();
