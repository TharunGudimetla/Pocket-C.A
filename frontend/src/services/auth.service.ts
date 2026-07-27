import { api } from './api';
import { AuthResponse } from '../types/auth';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiEnvelope<AuthResponse>>('/auth/register', {
      name,
      email,
      password,
    });
    return data.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return data.data;
  },
};
