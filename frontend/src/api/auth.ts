import { api } from './client';
import type { ApiSuccess, User } from '../types';

export const login = (email: string, password: string) =>
  api.post<ApiSuccess<{ token: string }>>('/auth/login', { email, password }).then((r) => r.data.data.token);

export const register = (name: string, email: string, password: string) =>
  api.post<ApiSuccess<User>>('/auth/register', { name, email, password }).then((r) => r.data.data);

export const getMe = () => api.get<ApiSuccess<User>>('/auth/me').then((r) => r.data.data);
