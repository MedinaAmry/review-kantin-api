import axios from 'axios';

const TOKEN_KEY = 'rk_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Dipanggil saat backend membalas 401 padahal user membawa token (token kedaluwarsa/tidak valid)
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

// Base URL dikelola lewat .env (VITE_API_URL), default "/api" via proxy Vite
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Pasang JWT otomatis di setiap request
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tangani 401 secara global: hapus token, reset state login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginCall = String(error?.config?.url ?? '').includes('/auth/login');
    if (axios.isAxiosError(error) && error.response?.status === 401 && !isLoginCall && tokenStore.get()) {
      tokenStore.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
