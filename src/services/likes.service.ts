import { and, count, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { likes, reviews, users } from '../schema';

type Executor = Pick<typeof db, 'select' | 'update'>;

// Hitung ulang jumlah like milik sebuah review
const syncLikeCount = async (executor: Executor, reviewId: number) => {
  const [row] = await executor
    .select({ total: count() })
    .from(likes)
    .where(eq(likes.reviewId, reviewId));

  await executor
    .update(reviews)
    .set({ likeCount: Number(row.total) })
    .where(eq(reviews.id, reviewId));
};

export const reviewExists = async (reviewId: number) => {
  const rows = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.id, reviewId));
  return rows.length > 0;
};

export const userExists = async (userId: number) => {
  const rows = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
  return rows.length > 0;
};

export const findLike = async (reviewId: number, userId: number) => {
  const rows = await db
    .select()
    .from(likes)
    .where(and(eq(likes.reviewId, reviewId), eq(likes.userId, userId)));
  return rows[0];
};

export const getLikeById = async (id: number) => {
  const rows = await db.select().from(likes).where(eq(likes.id, id));
  return rows[0];
};

export const createLike = async (reviewId: number, userId: number) => {
  await db.transaction(async (tx) => {
    await tx.insert(likes).values({ reviewId, userId });
    await syncLikeCount(tx, reviewId);
  });

  const rows = await db
    .select()
    .from(likes)
    .where(and(eq(likes.reviewId, reviewId), eq(likes.userId, userId)))
    .orderBy(desc(likes.id))
    .offset(0)
    .fetch(1);

  const [review] = await db
    .select({ likeCount: reviews.likeCount })
    .from(reviews)
    .where(eq(reviews.id, reviewId));

  return { ...rows[0], reviewLikeCount: review.likeCount };
};

export const deleteLike = async (id: number, reviewId: number) => {
  await db.transaction(async (tx) => {
    await tx.delete(likes).where(eq(likes.id, id));
    await syncLikeCount(tx, reviewId);
  });
};