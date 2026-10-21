import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return sendError(res, 'Token tidak ditemukan, silakan login', 401);
  }
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    req.user = { id: Number(p.sub), role: p.role };
    next();
  } catch {
    return sendError(res, 'Token tidak valid atau kedaluwarsa', 401);
  }
};