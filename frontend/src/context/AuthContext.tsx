import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { setUnauthorizedHandler, tokenStore } from '../api/client';
import * as authApi from '../api/auth';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: User | null;
  loading: boolean; // true selama sesi lama sedang diverifikasi lewat GET /auth/me
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthCtx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!tokenStore.get());

  // Jika backend membalas 401 (token kedaluwarsa), interceptor memanggil handler ini
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      toast.info('Sesi berakhir, silakan login lagi.');
    });
    return () => setUnauthorizedHandler(null);
  }, [toast]);

  // Saat aplikasi dibuka: kalau ada token tersimpan, verifikasi ke backend
  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    let active = true;
    authApi
      .getMe()
      .then((u) => {
        if (active) setUser(u);
      })
      .catch(() => {
        /* 401: token sudah dibersihkan interceptor. Error jaringan: user dianggap belum login. */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const token = await authApi.login(email, password);
    tokenStore.set(token);
    try {
      const me = await authApi.getMe();
      setUser(me);
      return me;
    } catch (e) {
      tokenStore.clear();
      throw e;
    }
  }, []);

  const register = useCallback((name: string, email: string, password: string) => authApi.register(name, email, password), []);

  // Backend memakai JWT stateless (tidak ada endpoint logout), jadi logout = buang token di klien
  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
