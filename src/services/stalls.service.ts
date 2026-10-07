import { and, asc, count, desc, eq, like } from 'drizzle-orm';
import { db } from '../db';
import { stalls, users } from '../schema';

export type StallFilters = {
  category?: string;
  location?: string;
  search?: string;
};

export type StallInput = {
  name?: string;
  category?: string;
  location?: string;
  description?: string;
};

// Kolom yang boleh dipakai untuk mengurutkan
const sortColumns = {
  id: stalls.id,
  name: stalls.name,
  avgRating: stalls.avgRating,
  createdAt: stalls.createdAt,
};

const buildWhere = (filters: StallFilters) => {
  const conditions = [];
  if (filters.category) conditions.push(eq(stalls.category, filters.category));
  if (filters.location) conditions.push(like(stalls.location, `%${filters.location}%`));
  if (filters.search) conditions.push(like(stalls.name, `%${filters.search}%`));
  return conditions.length ? and(...conditions) : undefined;
};

export const getStalls = async (
  filters: StallFilters,
  page: number,
  limit: number,
  sortBy: string,
  order: string,
) => {
  const where = buildWhere(filters);
  const sortColumn = sortColumns[sortBy as keyof typeof sortColumns] ?? stalls.id;
  const direction = order === 'desc' ? desc : asc;

  const data = await db
    .select()
    .from(stalls)
    .where(where)
    .orderBy(direction(sortColumn))
    .offset((page - 1) * limit)
    .fetch(limit);

  const [row] = await db.select({ total: count() }).from(stalls).where(where);

  return { data, total: Number(row.total) };
};

export const getStallById = async (id: number) => {
  const rows = await db.select().from(stalls).where(eq(stalls.id, id));
  return rows[0];
};

export const ownerExists = async (ownerId: number) => {
  const rows = await db.select({ id: users.id }).from(users).where(eq(users.id, ownerId));
  return rows.length > 0;
};

export const createStall = async (input: {
  ownerId: number;
  name: string;
  category?: string;
  location?: string;
  description?: string;
}) => {
  await db.insert(stalls).values({
    ownerId: input.ownerId,
    name: input.name,
    category: input.category,
    location: input.location,
    description: input.description,
  });

  // Ambil kedai yang baru dibuat (id terbesar milik owner ini)
  const rows = await db
    .select()
    .from(stalls)
    .where(eq(stalls.ownerId, input.ownerId))
    .orderBy(desc(stalls.id))
    .offset(0)
    .fetch(1);
  return rows[0];
};

export const updateStall = async (id: number, input: StallInput) => {
  const values: Record<string, unknown> = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.category !== undefined) values.category = input.category;
  if (input.location !== undefined) values.location = input.location;
  if (input.description !== undefined) values.description = input.description;

  await db.update(stalls).set(values).where(eq(stalls.id, id));
  return getStallById(id);
};

export const deleteStall = async (id: number) => {
  await db.delete(stalls).where(eq(stalls.id, id));
};