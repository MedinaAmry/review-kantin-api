import { randomBytes, scryptSync } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../schema';

// Kolom yang boleh ditampilkan (password_hash sengaja tidak ikut)
const publicColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  createdAt: users.createdAt,
};

const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const getAllUsers = async () => {
  return db.select(publicColumns).from(users);
};

export const findUserByEmail = async (email: string) => {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));
  return rows[0];
};

export const createUser = async (input: {
  name?: string;
  email: string;
  password: string;
  role: string;
}) => {
  await db.insert(users).values({
    name: input.name,
    email: input.email,
    passwordHash: hashPassword(input.password),
    role: input.role,
  });

  const rows = await db
    .select(publicColumns)
    .from(users)
    .where(eq(users.email, input.email));
  return rows[0];
};