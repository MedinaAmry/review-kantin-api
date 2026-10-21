import type { Role } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: Role };
      validated: any;
    }
  }
}
export {};