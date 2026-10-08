import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { flags, reviews, users } from '../schema';

// Data flag + data review + data pelapor (hasil JOIN)
const selectFlags = {
  id: flags.id,
  reason: flags.reason,
  status: flags.status,
  createdAt: flags.createdAt,
  review: {
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
  },
  reporter: {
    id: users.id,
    name: users.name,
  },
};

export const getFlags = async (filters: { status?: string; reviewId?: number }) => {
  const conditions = [];
  if (filters.status) conditions.push(eq(flags.status, filters.status));
  if (filters.reviewId !== undefined) conditions.push(eq(flags.reviewId, filters.reviewId));

  return db
    .select(selectFlags)
    .from(flags)
    .innerJoin(reviews, eq(flags.reviewId, reviews.id))
    .innerJoin(users, eq(flags.reportedBy, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(flags.id));
};

export const getFlagById = async (id: number) => {
  const rows = await db
    .select(selectFlags)
    .from(flags)
    .innerJoin(reviews, eq(flags.reviewId, reviews.id))
    .innerJoin(users, eq(flags.reportedBy, users.id))
    .where(eq(flags.id, id));
  return rows[0];
};

export const updateFlagStatus = async (id: number, status: string) => {
  await db.update(flags).set({ status }).where(eq(flags.id, id));
  return getFlagById(id);
};