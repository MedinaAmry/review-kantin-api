import { Request, Response } from 'express';
import * as stallService from '../services/stalls.service';
import { sendSuccess, sendError } from '../utils/response';
import { isForeignKeyError } from '../utils/db-errors';

const parseId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const getStalls = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1), 50);
    const sortBy = String(req.query.sortBy ?? 'id');
    const order = String(req.query.order ?? 'asc').toLowerCase();

    const filters = {
      category: req.query.category ? String(req.query.category) : undefined,
      location: req.query.location ? String(req.query.location) : undefined,
      search: req.query.search ? String(req.query.search) : undefined,
    };

    const { data, total } = await stallService.getStalls(filters, page, limit, sortBy, order);
    const meta = { page, limit, total, totalPages: Math.ceil(total / limit) };

    return sendSuccess(res, data, 200, 'Data stalls berhasil diambil', meta);
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data stalls', 500);
  }
};

export const getStallById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

    const stall = await stallService.getStallById(id);
    if (!stall) return sendError(res, 'Stall tidak ditemukan', 404);

    return sendSuccess(res, stall, 200, 'Data stall berhasil diambil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data stall', 500);
  }
};

export const createStall = async (req: Request, res: Response) => {
  try {
    const { ownerId, name, category, location, description } = req.body ?? {};

    if (!ownerId || !name) {
      return sendError(res, 'ownerId dan name wajib diisi', 400);
    }
    const ownerIdNumber = parseId(ownerId);
    if (!ownerIdNumber) return sendError(res, 'ownerId harus berupa angka', 400);

    if (!(await stallService.ownerExists(ownerIdNumber))) {
      return sendError(res, 'Owner tidak ditemukan', 404);
    }

    const created = await stallService.createStall({
      ownerId: ownerIdNumber,
      name,
      category,
      location,
      description,
    });
    return sendSuccess(res, created, 201, 'Stall berhasil dibuat');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal membuat stall', 500);
  }
};

export const updateStall = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

    const { name, category, location, description } = req.body ?? {};
    if (
      name === undefined &&
      category === undefined &&
      location === undefined &&
      description === undefined
    ) {
      return sendError(res, 'Minimal satu field harus diisi (name, category, location, description)', 400);
    }

    const existing = await stallService.getStallById(id);
    if (!existing) return sendError(res, 'Stall tidak ditemukan', 404);

    const updated = await stallService.updateStall(id, { name, category, location, description });
    return sendSuccess(res, updated, 200, 'Stall berhasil diperbarui');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal memperbarui stall', 500);
  }
};

export const deleteStall = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

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