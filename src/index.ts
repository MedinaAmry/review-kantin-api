import 'dotenv/config';
import express from 'express';
import { sql } from 'drizzle-orm';
import { db } from './db';
import usersRouter from './routes/users.routes';
import stallsRouter from './routes/stalls.routes';

const app = express();
app.use(express.json());

// Endpoint tes koneksi
app.get('/health', async (_req, res) => {
  try {
    const result = await db.execute(sql`SELECT COUNT(*) AS total FROM users`);
    res.status(200).json({ status: 'ok', data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: String(err) });
  }
});

app.use('/api/users', usersRouter);
app.use('/api/stalls', stallsRouter);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server jalan di http://localhost:${port}`);
});