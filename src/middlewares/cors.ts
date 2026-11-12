import { Request, Response, NextFunction } from 'express';

// Izinkan frontend (React/Vite) memanggil API dari origin berbeda.
// Atur origin yang diizinkan lewat CORS_ORIGIN di .env (default: Vite dev server).
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const cors = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  // Preflight request dari browser
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
};
