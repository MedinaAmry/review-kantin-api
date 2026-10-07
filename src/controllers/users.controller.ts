import { Request, Response } from 'express';
import * as userService from '../services/users.service';
import { sendSuccess, sendError } from '../utils/response';

const ALLOWED_ROLES = ['admin', 'owner', 'student'];

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const data = await userService.getAllUsers();
    return sendSuccess(res, data, 200, 'Data users berhasil diambil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data users', 500);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body ?? {};

    if (!email || !password || !role) {
      return sendError(res, 'email, password, dan role wajib diisi', 400);
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return sendError(res, 'role harus admin, owner, atau student', 400);
    }

    const existing = await userService.findUserByEmail(email);
    if (existing) {
      return sendError(res, 'Email sudah terdaftar', 409);
    }

    const created = await userService.createUser({ name, email, password, role });
    return sendSuccess(res, created, 201, 'User berhasil dibuat');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal membuat user', 500);
  }
};