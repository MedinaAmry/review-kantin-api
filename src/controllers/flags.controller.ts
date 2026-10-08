import { Request, Response } from 'express';
import * as flagService from '../services/flags.service';
import { sendSuccess, sendError } from '../utils/response';

const ALLOWED_STATUS = ['pending', 'reviewed', 'rejected'];

const parseId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const getFlags = async (req: Request, res: Response) => {
  try {
    const filters: { status?: string; reviewId?: number } = {};

    if (req.query.status !== undefined) {
      const status = String(req.query.status);
      if (!ALLOWED_STATUS.includes(status)) {
        return sendError(res, 'status harus pending, reviewed, atau rejected', 400);
      }
      filters.status = status;
    }
    if (req.query.reviewId !== undefined) {
      const reviewId = parseId(req.query.reviewId);
      if (!reviewId) return sendError(res, 'reviewId tidak valid', 400);
      filters.reviewId = reviewId;
    }

    const data = await flagService.getFlags(filters);
    return sendSuccess(res, data, 200, 'Data flags berhasil diambil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data flags', 500);
  }
};

export const getFlagById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

    const flag = await flagService.getFlagById(id);
    if (!flag) return sendError(res, 'Flag tidak ditemukan', 404);

    return sendSuccess(res, flag, 200, 'Data flag berhasil diambil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data flag', 500);
  }
};

export const updateFlagStatus = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

    const { status } = req.body ?? {};
    if (!status) return sendError(res, 'status wajib diisi', 400);
    if (!ALLOWED_STATUS.includes(status)) {
      return sendError(res, 'status harus pending, reviewed, atau rejected', 400);
    }

    const existing = await flagService.getFlagById(id);
    if (!existing) return sendError(res, 'Flag tidak ditemukan', 404);

    const updated = await flagService.updateFlagStatus(id, status);
    return sendSuccess(res, updated, 200, 'Status flag berhasil diperbarui');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal memperbarui status flag', 500);
  }
};