import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import type { Role } from '../types/auth';

export const authorize = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return sendError(res, 'Anda tidak memiliki akses ke resource ini', 403);
  }
  next();
};