import { Request, Response } from 'express';
import * as userService from '../services/users.service';
import { sendSuccess, sendError } from '../utils/response';

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const data = await userService.getAllUsers();
    return sendSuccess(res, data, 200, 'Data users berhasil diambil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data users', 500);
  }
};