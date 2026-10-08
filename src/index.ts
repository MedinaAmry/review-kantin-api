import 'dotenv/config';
import express from 'express';
import { sql } from 'drizzle-orm';
import { db } from './db';
import usersRouter from './routes/users.routes';
import stallsRouter from './routes/stalls.routes';
import menuItemsRouter from './routes/menu-items.routes';
import reviewsRouter from './routes/reviews.routes';
import likesRouter from './routes/likes.routes';
import flagsRouter from './routes/flags.routes';
import auditRouter from './routes/audit.routes';


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
app.use('/api/menu-items', menuItemsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/likes', likesRouter);
app.use('/api/flags', flagsRouter);
app.use('/api/audit', auditRouter);


const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server jalan di http://localhost:${port}`);
});