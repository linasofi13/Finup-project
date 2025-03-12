import axios from 'axios';

// Create an axios instance with the proper base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
});

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    // Create form data instead of JSON
    const formData = new URLSearchParams();
    formData.append('username', credentials.email); // Map email to username
    formData.append('password', credentials.password);
    
    const response = await api.post('/auth/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
  },
  
  // Rest of your code is fine
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  validateToken: async () => {
    // Cambiando la ruta a /api/auth/validate que es la correcta
    const response = await axios.get('/api/auth/validate');
    if (!response.data) {
      throw new Error('No se pudo validar el token');
    }
    return response.data;
  },

  logout: async () => {
    // Cierra sesión en el cliente (no requiere llamada al backend)
    return Promise.resolve();
  }
};
