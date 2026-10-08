import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { auditLogs, users } from '../schema';

// Data log + data user pelaku (hasil JOIN)
const selectAudit = {
  id: auditLogs.id,
  action: auditLogs.action,
  targetTable: auditLogs.targetTable,
  targetId: auditLogs.targetId,
  metadata: auditLogs.metadata,
  timestamp: auditLogs.timestamp,
  user: {
    id: users.id,
    name: users.name,
  },
};

export const getAuditLogs = async (filters: {
  userId?: number;
  action?: string;
  targetTable?: string;
}) => {
  const conditions = [];
  if (filters.userId !== undefined) conditions.push(eq(auditLogs.userId, filters.userId));
  if (filters.action) conditions.push(eq(auditLogs.action, filters.action));
  if (filters.targetTable) conditions.push(eq(auditLogs.targetTable, filters.targetTable));

  return db
    .select(selectAudit)
    .from(auditLogs)
    .innerJoin(users, eq(auditLogs.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.id));
};

export const getAuditLogById = async (id: number) => {
  const rows = await db
    .select(selectAudit)
    .from(auditLogs)
    .innerJoin(users, eq(auditLogs.userId, users.id))
    .where(eq(auditLogs.id, id));
  return rows[0];
};

export const userExists = async (userId: number) => {
  const rows = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
  return rows.length > 0;
};

export const createAuditLog = async (input: {
  userId: number;
  action: string;
  targetTable: string;
  targetId: number;
  metadata?: string;
}) => {
  await db.insert(auditLogs).values({
    userId: input.userId,
    action: input.action,
    targetTable: input.targetTable,
    targetId: input.targetId,
    metadata: input.metadata,
  });

  // Ambil log yang baru dibuat (id terbesar dari user ini)
  const rows = await db
    .select({ id: auditLogs.id })
    .from(auditLogs)
    .where(eq(auditLogs.userId, input.userId))
    .orderBy(desc(auditLogs.id))
    .offset(0)
    .fetch(1);

  return getAuditLogById(rows[0].id);
};