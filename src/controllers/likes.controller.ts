import { Request, Response } from 'express';
import * as likeService from '../services/likes.service';
import { sendSuccess, sendError } from '../utils/response';

const parseId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const createLike = async (req: Request, res: Response) => {
  try {
    const reviewIdNumber = parseId(req.body?.reviewId);
    if (!reviewIdNumber) {
      return sendError(res, 'reviewId wajib diisi dan harus berupa angka', 400);
    }
    const userIdNumber = req.user!.id;

    if (!(await likeService.reviewExists(reviewIdNumber))) {
      return sendError(res, 'Review tidak ditemukan', 404);
    }
    if (await likeService.findLike(reviewIdNumber, userIdNumber)) {
      return sendError(res, 'User ini sudah menyukai review tersebut', 409);
    }

    const created = await likeService.createLike(reviewIdNumber, userIdNumber);
    return sendSuccess(res, created, 201, 'Like berhasil ditambahkan');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal menambahkan like', 500);
  }
};

export const deleteLike = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

    const existing = await likeService.getLikeById(id);
    if (!existing) return sendError(res, 'Like tidak ditemukan', 404);

    if (req.user!.role !== 'admin' && existing.userId !== req.user!.id) {
      return sendError(res, 'Anda hanya boleh menghapus like milik sendiri', 403);
    }

    await likeService.deleteLike(id, existing.reviewId);
    return sendSuccess(res, null, 200, 'Like berhasil dihapus');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal menghapus like', 500);
  }
};