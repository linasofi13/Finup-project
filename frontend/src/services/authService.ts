import axios from "axios";

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
    const response = await axios.post("/api/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await axios.post("/api/auth/register", data);
    return response.data;
  },

  validateToken: async (token: string) => {
    const response = await axios.get("/api/auth/validate", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
