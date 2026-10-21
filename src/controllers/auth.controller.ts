import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.validated.body;
    if (await authService.findByEmail(email)) {
      return sendError(res, 'Email sudah terdaftar', 409, [{ field: 'email', message: 'email sudah dipakai' }]);
    }
    const data = await authService.register(name, email, password);
    return sendSuccess(res, data, 201, 'Registrasi berhasil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal registrasi', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.validated.body;
    const token = await authService.verifyLogin(email, password);
    if (!token) return sendError(res, 'Email atau password salah', 401);
    return sendSuccess(res, { token }, 200, 'Login berhasil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal login', 500);
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const u = await authService.findById(req.user!.id);
    if (!u) return sendError(res, 'User tidak ditemukan', 401);
    return sendSuccess(res, { id: u.id, name: u.name, email: u.email, role: u.role }, 200, 'Data user');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data user', 500);
  }
};