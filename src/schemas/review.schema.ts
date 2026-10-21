import { z } from 'zod';

export const reviewBody = z.object({
  rating: z.number({ message: 'rating wajib berupa angka' })
    .int('rating harus bilangan bulat').min(1, 'rating minimal 1').max(5, 'rating maksimal 5'),
  comment: z.string().trim().max(1000, 'comment maksimal 1000 karakter').optional(),
});