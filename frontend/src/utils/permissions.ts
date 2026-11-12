import type { Stall, User } from '../types';

// Catatan: ini hanya untuk mengatur TAMPILAN. Keputusan akhir tetap di backend (401/403).
export const canCreateStall = (user: User | null) => user?.role === 'admin' || user?.role === 'owner';

export const canEditStall = (user: User | null, stall: Stall) =>
  !!user && (user.role === 'admin' || (user.role === 'owner' && stall.ownerId === user.id));

export const canDeleteStall = (user: User | null) => user?.role === 'admin';

export const roleLabel: Record<string, string> = {
  admin: 'Admin',
  owner: 'Owner',
  customer: 'Customer',
};
