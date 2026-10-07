import { Request, Response } from 'express';
import * as reviewService from '../services/reviews.service';
import { sendSuccess, sendError } from '../utils/response';

const parseId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const filters: { stallId?: number; userId?: number } = {};

    if (req.query.stallId !== undefined) {
      const stallId = parseId(req.query.stallId);
      if (!stallId) return sendError(res, 'stallId tidak valid', 400);
      filters.stallId = stallId;
    }
    if (req.query.userId !== undefined) {
      const userId = parseId(req.query.userId);
      if (!userId) return sendError(res, 'userId tidak valid', 400);
      filters.userId = userId;
    }

    const data = await reviewService.getReviews(filters);
    return sendSuccess(res, data, 200, 'Data reviews berhasil diambil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data reviews', 500);
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

    const review = await reviewService.getReviewById(id);
    if (!review) return sendError(res, 'Review tidak ditemukan', 404);

    return sendSuccess(res, review, 200, 'Data review berhasil diambil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data review', 500);
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { stallId, userId, rating, comment } = req.body ?? {};

    if (!stallId || !userId || rating === undefined) {
      return sendError(res, 'stallId, userId, dan rating wajib diisi', 400);
    }
    const stallIdNumber = parseId(stallId);
    const userIdNumber = parseId(userId);
    if (!stallIdNumber || !userIdNumber) {
      return sendError(res, 'stallId dan userId harus berupa angka', 400);
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return sendError(res, 'rating harus berupa angka bulat 1 sampai 5', 400);
    }
    if (comment !== undefined && typeof comment !== 'string') {
      return sendError(res, 'comment harus berupa teks', 400);
    }

    if (!(await reviewService.stallExists(stallIdNumber))) {
      return sendError(res, 'Stall tidak ditemukan', 404);
    }
    if (!(await reviewService.userExists(userIdNumber))) {
      return sendError(res, 'User tidak ditemukan', 404);
    }

    const created = await reviewService.createReview({
      stallId: stallIdNumber,
      userId: userIdNumber,
      rating,
      comment,
    });
    return sendSuccess(res, created, 201, 'Review berhasil dibuat');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal membuat review', 500);
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

    const existing = await reviewService.getReviewById(id);
    if (!existing) return sendError(res, 'Review tidak ditemukan', 404);

    await reviewService.deleteReview(id, existing.stallId);
    return sendSuccess(res, null, 200, 'Review berhasil dihapus');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal menghapus review', 500);
  }
};