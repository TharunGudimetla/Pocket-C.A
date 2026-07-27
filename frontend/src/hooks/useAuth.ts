import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import { AuthUser } from '../types/auth';

const TOKEN_KEY = 'pocketca_token';
const USER_KEY = 'pocketca_user';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setInitializing(false);
  }, []);

  const persist = (authResponse: { user: AuthUser; token: string }) => {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
    setUser(authResponse.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      persist(res);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (err?.code === 'ERR_NETWORK' || !err?.response
          ? 'Backend server unreachable. Ensure backend is running on http://localhost:5000'
          : 'Could not log in. Please check your credentials.');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(name, email, password);
      persist(res);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (err?.code === 'ERR_NETWORK' || !err?.response
          ? 'Backend server unreachable. Ensure backend is running on http://localhost:5000'
          : 'Could not create your account. Please try again.');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return { user, initializing, loading, error, login, register, logout };
}
