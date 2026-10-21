import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../src/db';
import { users } from '../src/schema';

const accounts = [
  { name: 'Admin Kantin', email: 'admin@test.com', role: 'admin' },
  { name: 'Owner Satu', email: 'owner1@test.com', role: 'owner' },
  { name: 'Owner Dua', email: 'owner2@test.com', role: 'owner' },
  { name: 'Customer Satu', email: 'customer@test.com', role: 'customer' },
];

(async () => {
  const passwordHash = await bcrypt.hash('password123', 10);
  for (const a of accounts) {
    const [exist] = await db.select().from(users).where(eq(users.email, a.email));
    if (exist) await db.update(users).set({ passwordHash, role: a.role }).where(eq(users.email, a.email));
    else await db.insert(users).values({ ...a, passwordHash });
  }
  console.log('Seed selesai. Password semua akun: password123');
  process.exit(0);
})();