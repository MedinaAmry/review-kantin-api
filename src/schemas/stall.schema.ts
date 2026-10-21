import { z } from 'zod';

export const idParam = z.object({
  id: z.coerce.number({ message: 'id harus angka' })
    .int('id harus bilangan bulat').gt(0, 'id harus lebih dari 0'),
});

export const listQuery = z.object({
  search: z.string().trim().max(100, 'search maksimal 100 karakter').optional(),
  category: z.string().trim().max(50, 'category maksimal 50 karakter').optional(),
  location: z.string().trim().max(100, 'location maksimal 100 karakter').optional(),
  page: z.coerce.number().int('page harus bilangan bulat').min(1, 'page minimal 1').default(1),
  limit: z.coerce.number().int('limit harus bilangan bulat')
    .min(1, 'limit minimal 1').max(100, 'limit maksimal 100').default(10),
  sortBy: z.enum(['id', 'name', 'avgRating', 'createdAt']).default('id'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const createBody = z.object({
  name: z.string({ message: 'name wajib diisi' }).trim()
    .min(3, 'name minimal 3 karakter').max(100, 'name maksimal 100 karakter'),
  category: z.string().trim().max(50, 'category maksimal 50 karakter').optional(),
  location: z.string().max(100, 'location maksimal 100 karakter').optional(),
  description: z.string().max(1000, 'description maksimal 1000 karakter').optional(),
});

export const updateBody = createBody.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: 'Minimal satu field harus diisi' },
);