import { z } from 'zod';

export const registerBody = z.object({
  name: z.string({ message: 'name wajib diisi' }).trim()
    .min(3, 'name minimal 3 karakter').max(100, 'name maksimal 100 karakter'),
  email: z.string({ message: 'email wajib diisi' }).trim().toLowerCase()
    .email('format email tidak valid').max(150, 'email maksimal 150 karakter'),
  password: z.string({ message: 'password wajib diisi' })
    .min(8, 'password minimal 8 karakter').max(72, 'password maksimal 72 karakter'),
});

export const loginBody = z.object({
  email: z.string({ message: 'email wajib diisi' }).trim().toLowerCase()
    .email('format email tidak valid'),
  password: z.string({ message: 'password wajib diisi' }).min(1, 'password wajib diisi'),
});