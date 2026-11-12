export type Role = 'admin' | 'owner' | 'customer';

export interface User {
  id: number;
  name: string | null;
  email: string;
  role: Role;
}

export interface Stall {
  id: number;
  ownerId: number;
  name: string;
  category: string | null;
  location: string | null;
  description: string | null;
  avgRating: number | string | null;
  reviewCount: number | null;
  createdAt: string | null;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PageMeta;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface StallInput {
  name?: string;
  category?: string;
  location?: string;
  description?: string;
}

export type SortBy = 'id' | 'name' | 'avgRating' | 'createdAt';

export interface StallQuery {
  search?: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: SortBy;
  order?: 'asc' | 'desc';
}
