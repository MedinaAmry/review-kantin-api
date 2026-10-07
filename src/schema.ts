import { sql } from 'drizzle-orm';
import {
  mssqlTable,
  int,
  varchar,
  text,
  datetime,
  bit,
  decimal,
} from 'drizzle-orm/mssql-core';

export const users = mssqlTable('users', {
  id: int().primaryKey().identity(),
  name: varchar({ length: 100 }),
  email: varchar({ length: 150 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar({ length: 20 }).notNull(),
  createdAt: datetime('created_at').default(sql`GETDATE()`),
});

export const stalls = mssqlTable('stalls', {
  id: int().primaryKey().identity(),
  ownerId: int('owner_id').notNull().references(() => users.id),
  name: varchar({ length: 100 }).notNull(),
  category: varchar({ length: 50 }),
  location: varchar({ length: 100 }),
  description: text(),
  avgRating: decimal('avg_rating', { precision: 3, scale: 2 }).default(sql`0`),
  reviewCount: int('review_count').default(0),
  createdAt: datetime('created_at').default(sql`GETDATE()`),
});

export const menuItems = mssqlTable('menu_items', {
  id: int().primaryKey().identity(),
  stallId: int('stall_id').notNull().references(() => stalls.id),
  name: varchar({ length: 100 }).notNull(),
  price: int().notNull(),
  isAvailable: bit('is_available').default(true),
});

export const reviews = mssqlTable('reviews', {
  id: int().primaryKey().identity(),
  stallId: int('stall_id').notNull().references(() => stalls.id),
  userId: int('user_id').notNull().references(() => users.id),
  rating: int().notNull(),
  comment: text(),
  likeCount: int('like_count').default(0),
  createdAt: datetime('created_at').default(sql`GETDATE()`),
  updatedAt: datetime('updated_at').default(sql`GETDATE()`),
});

export const likes = mssqlTable('likes', {
  id: int().primaryKey().identity(),
  reviewId: int('review_id').notNull().references(() => reviews.id),
  userId: int('user_id').notNull().references(() => users.id),
  createdAt: datetime('created_at').default(sql`GETDATE()`),
});

export const flags = mssqlTable('flags', {
  id: int().primaryKey().identity(),
  reviewId: int('review_id').notNull().references(() => reviews.id),
  reportedBy: int('reported_by').notNull().references(() => users.id),
  reason: varchar({ length: 255 }),
  status: varchar({ length: 20 }).default('pending'),
  createdAt: datetime('created_at').default(sql`GETDATE()`),
});

export const auditLogs = mssqlTable('audit_logs', {
  id: int().primaryKey().identity(),
  userId: int('user_id').notNull().references(() => users.id),
  action: varchar({ length: 50 }).notNull(),
  targetTable: varchar('target_table', { length: 50 }).notNull(),
  targetId: int('target_id').notNull(),
  metadata: text(),
  timestamp: datetime().default(sql`GETDATE()`),
});