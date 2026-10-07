import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { menuItems, stalls } from '../schema';

// Kolom yang ditampilkan: data menu + data kedai (hasil JOIN)
const selectWithStall = {
  id: menuItems.id,
  name: menuItems.name,
  price: menuItems.price,
  isAvailable: menuItems.isAvailable,
  stall: {
    id: stalls.id,
    name: stalls.name,
    category: stalls.category,
    location: stalls.location,
  },
};

export const getMenuItems = async (filters: {
  stallId?: number;
  isAvailable?: boolean;
}) => {
  const conditions = [];
  if (filters.stallId !== undefined) {
    conditions.push(eq(menuItems.stallId, filters.stallId));
  }
  if (filters.isAvailable !== undefined) {
    conditions.push(eq(menuItems.isAvailable, filters.isAvailable));
  }

  return db
    .select(selectWithStall)
    .from(menuItems)
    .innerJoin(stalls, eq(menuItems.stallId, stalls.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(menuItems.id));
};

export const getMenuItemById = async (id: number) => {
  const rows = await db
    .select(selectWithStall)
    .from(menuItems)
    .innerJoin(stalls, eq(menuItems.stallId, stalls.id))
    .where(eq(menuItems.id, id));
  return rows[0];
};

export const stallExists = async (stallId: number) => {
  const rows = await db
    .select({ id: stalls.id })
    .from(stalls)
    .where(eq(stalls.id, stallId));
  return rows.length > 0;
};

export const createMenuItem = async (input: {
  stallId: number;
  name: string;
  price: number;
  isAvailable?: boolean;
}) => {
  await db.insert(menuItems).values({
    stallId: input.stallId,
    name: input.name,
    price: input.price,
    isAvailable: input.isAvailable ?? true,
  });

  // Ambil menu yang baru dibuat (id terbesar di kedai ini)
  const rows = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(eq(menuItems.stallId, input.stallId))
    .orderBy(desc(menuItems.id))
    .offset(0)
    .fetch(1);
  return getMenuItemById(rows[0].id);
};

export const updateMenuItem = async (
  id: number,
  input: { name?: string; price?: number; isAvailable?: boolean },
) => {
  const values: Record<string, unknown> = {};
  if (input.name !== undefined) values.name = input.name;
  if (input.price !== undefined) values.price = input.price;
  if (input.isAvailable !== undefined) values.isAvailable = input.isAvailable;

  await db.update(menuItems).set(values).where(eq(menuItems.id, id));
  return getMenuItemById(id);
};

export const deleteMenuItem = async (id: number) => {
  await db.delete(menuItems).where(eq(menuItems.id, id));
};