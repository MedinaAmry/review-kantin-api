import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { Loading } from './Feedback';
import Forbidden from '../pages/ForbiddenPage';

// Belum login -> ke /login (ingat halaman tujuan). Login tapi role tidak cukup -> halaman 403.
export default function ProtectedRoute({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading text="Memeriksa sesi login..." />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search, reason: 'login-required' }} />;
  }
  if (roles && !roles.includes(user.role)) return <Forbidden />;
  return <>{children}</>;
}

// Halaman login/register: kalau sudah login, tidak perlu lagi ke sana
export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading text="Memeriksa sesi login..." />;
  if (user) return <Navigate to="/stalls" replace />;
  return <>{children}</>;
}
