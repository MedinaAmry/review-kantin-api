import { and, count, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { flags, likes, reviews, stalls, users } from '../schema';

// Kolom yang ditampilkan: data review + data user (hasil JOIN)
const selectWithUser = {
  id: reviews.id,
  stallId: reviews.stallId,
  rating: reviews.rating,
  comment: reviews.comment,
  likeCount: reviews.likeCount,
  createdAt: reviews.createdAt,
  updatedAt: reviews.updatedAt,
  user: {
    id: users.id,
    name: users.name,
    role: users.role,
  },
};

// Hitung ulang rata-rata rating dan jumlah review milik sebuah kedai
const recalculateStallRating = async (stallId: number) => {
  const [row] = await db
    .select({
      avg: sql<number | null>`AVG(CAST(${reviews.rating} AS DECIMAL(5,2)))`,
      total: count(),
    })
    .from(reviews)
    .where(eq(reviews.stallId, stallId));

  const avg = row.avg === null ? 0 : Math.round(Number(row.avg) * 100) / 100;

  await db
    .update(stalls)
    .set({ avgRating: sql`${avg}`, reviewCount: Number(row.total) })
    .where(eq(stalls.id, stallId));
};

export const getReviews = async (filters: { stallId?: number; userId?: number }) => {
  const conditions = [];
  if (filters.stallId !== undefined) conditions.push(eq(reviews.stallId, filters.stallId));
  if (filters.userId !== undefined) conditions.push(eq(reviews.userId, filters.userId));

  return db
    .select(selectWithUser)
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(reviews.id));
};

export const getReviewById = async (id: number) => {
  const rows = await db
    .select(selectWithUser)
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.id, id));
  return rows[0];
};

export const stallExists = async (stallId: number) => {
  const rows = await db.select({ id: stalls.id }).from(stalls).where(eq(stalls.id, stallId));
  return rows.length > 0;
};

export const userExists = async (userId: number) => {
  const rows = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
  return rows.length > 0;
};

export const createReview = async (input: {
  stallId: number;
  userId: number;
  rating: number;
  comment?: string;
}) => {
  await db.insert(reviews).values({
    stallId: input.stallId,
    userId: input.userId,
    rating: input.rating,
    comment: input.comment,
  });

  // Ambil review yang baru dibuat (id terbesar dari user ini di kedai ini)
  const rows = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.stallId, input.stallId), eq(reviews.userId, input.userId)))
    .orderBy(desc(reviews.id))
    .offset(0)
    .fetch(1);

  await recalculateStallRating(input.stallId);
  return getReviewById(rows[0].id);
};

export const deleteReview = async (id: number, stallId: number) => {
  // Hapus data turunan dulu (flags dan likes), baru review-nya
  await db.transaction(async (tx) => {
    await tx.delete(flags).where(eq(flags.reviewId, id));
    await tx.delete(likes).where(eq(likes.reviewId, id));
    await tx.delete(reviews).where(eq(reviews.id, id));
  });

  await recalculateStallRating(stallId);
};