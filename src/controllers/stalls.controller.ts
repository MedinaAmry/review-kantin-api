import { Request, Response } from 'express';
import * as stallService from '../services/stalls.service';
import * as reviewService from '../services/reviews.service';
import { sendSuccess, sendError } from '../utils/response';
import { isForeignKeyError } from '../utils/db-errors';

export const getStalls = async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, order, category, location, search } = req.validated.query;
    const { data, total } = await stallService.getStalls(
      { category, location, search }, page, limit, sortBy, order,
    );
    const meta = { page, limit, total, totalPages: Math.ceil(total / limit) };
    return sendSuccess(res, data, 200, 'Data stalls berhasil diambil', meta);
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data stalls', 500);
  }
};

export const getStallById = async (req: Request, res: Response) => {
  try {
    const stall = await stallService.getStallById(req.validated.params.id);
    if (!stall) return sendError(res, 'Stall tidak ditemukan', 404);
    return sendSuccess(res, stall, 200, 'Data stall berhasil diambil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data stall', 500);
  }
};

export const createStall = async (req: Request, res: Response) => {
  try {
    const created = await stallService.createStall({
      ...req.validated.body,
      ownerId: req.user!.id,
    });
    return sendSuccess(res, created, 201, 'Stall berhasil dibuat');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal membuat stall', 500);
  }
};

export const updateStall = async (req: Request, res: Response) => {
  try {
    const { id } = req.validated.params;
    const existing = await stallService.getStallById(id);
    if (!existing) return sendError(res, 'Stall tidak ditemukan', 404);

    if (req.user!.role === 'owner' && existing.ownerId !== req.user!.id) {
      return sendError(res, 'Anda bukan pemilik stall ini', 403);
    }
    const updated = await stallService.updateStall(id, req.validated.body);
    return sendSuccess(res, updated, 200, 'Stall berhasil diperbarui');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal memperbarui stall', 500);
  }
};

export const deleteStall = async (req: Request, res: Response) => {
  try {
    const { id } = req.validated.params;
    const existing = await stallService.getStallById(id);
    if (!existing) return sendError(res, 'Stall tidak ditemukan', 404);

    await stallService.deleteStall(id);
    return sendSuccess(res, null, 200, 'Stall berhasil dihapus');
  } catch (err) {
    if (isForeignKeyError(err)) {
      return sendError(res, 'Stall tidak bisa dihapus karena masih punya menu atau review', 409);
    }
    console.error(err);
    return sendError(res, 'Gagal menghapus stall', 500);
  }
};

export const addReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.validated.params;
    if (!(await stallService.getStallById(id))) return sendError(res, 'Stall tidak ditemukan', 404);

    const created = await reviewService.createReview({
      stallId: id,
      userId: req.user!.id,
      rating: req.validated.body.rating,
      comment: req.validated.body.comment,
    });
    return sendSuccess(res, created, 201, 'Review berhasil dibuat');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal membuat review', 500);
  }
};