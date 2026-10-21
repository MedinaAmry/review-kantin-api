import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../schema';

export const findByEmail = async (email: string) =>
  (await db.select().from(users).where(eq(users.email, email)))[0];

export const findById = async (id: number) =>
  (await db.select().from(users).where(eq(users.id, id)))[0];

export const register = async (name: string, email: string, password: string) => {
  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, passwordHash, role: 'customer' });
  const u = (await findByEmail(email))!;
  return { id: u.id, name: u.name, email: u.email, role: u.role };
};

export const verifyLogin = async (email: string, password: string) => {
  const user = await findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return jwt.sign(
    { sub: String(user.id), role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn'] },
  );
};