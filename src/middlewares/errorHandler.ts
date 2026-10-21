import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const notFound = (_req: Request, res: Response) =>
  sendError(res, 'Route tidak ditemukan', 404);

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.type === 'entity.parse.failed') return sendError(res, 'JSON tidak valid', 400);
  console.error(err);
  return sendError(res, 'Terjadi kesalahan pada server', 500);
};