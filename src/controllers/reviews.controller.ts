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

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

    const existing = await reviewService.getReviewById(id);
    if (!existing) return sendError(res, 'Review tidak ditemukan', 404);

    if (req.user!.role !== 'admin' && existing.user.id !== req.user!.id) {
      return sendError(res, 'Anda hanya boleh menghapus review milik sendiri', 403);
    }

    await reviewService.deleteReview(id, existing.stallId);
    return sendSuccess(res, null, 200, 'Review berhasil dihapus');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal menghapus review', 500);
  }
};