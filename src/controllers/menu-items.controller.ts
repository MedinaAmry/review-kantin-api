import { Request, Response } from 'express';
import * as menuService from '../services/menu-items.service';
import { sendSuccess, sendError } from '../utils/response';

const parseId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const isValidPrice = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const filters: { stallId?: number; isAvailable?: boolean } = {};

    if (req.query.stallId !== undefined) {
      const stallId = parseId(req.query.stallId);
      if (!stallId) return sendError(res, 'stallId tidak valid', 400);
      filters.stallId = stallId;
    }
    if (req.query.isAvailable !== undefined) {
      const value = String(req.query.isAvailable);
      if (value !== 'true' && value !== 'false') {
        return sendError(res, 'isAvailable harus true atau false', 400);
      }
      filters.isAvailable = value === 'true';
    }

    const data = await menuService.getMenuItems(filters);
    return sendSuccess(res, data, 200, 'Data menu berhasil diambil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data menu', 500);
  }
};

export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

    const item = await menuService.getMenuItemById(id);
    if (!item) return sendError(res, 'Menu tidak ditemukan', 404);

    return sendSuccess(res, item, 200, 'Data menu berhasil diambil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data menu', 500);
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { stallId, name, price, isAvailable } = req.body ?? {};

    if (!stallId || !name || price === undefined) {
      return sendError(res, 'stallId, name, dan price wajib diisi', 400);
    }
    const stallIdNumber = parseId(stallId);
    if (!stallIdNumber) return sendError(res, 'stallId harus berupa angka', 400);
    if (!isValidPrice(price)) {
      return sendError(res, 'price harus berupa angka bulat 0 atau lebih', 400);
    }
    if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
      return sendError(res, 'isAvailable harus true atau false', 400);
    }

    if (!(await menuService.stallExists(stallIdNumber))) {
      return sendError(res, 'Stall tidak ditemukan', 404);
    }

    const created = await menuService.createMenuItem({
      stallId: stallIdNumber,
      name,
      price,
      isAvailable,
    });
    return sendSuccess(res, created, 201, 'Menu berhasil dibuat');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal membuat menu', 500);
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

    const { name, price, isAvailable } = req.body ?? {};
    if (name === undefined && price === undefined && isAvailable === undefined) {
      return sendError(res, 'Minimal satu field harus diisi (name, price, isAvailable)', 400);
    }
    if (price !== undefined && !isValidPrice(price)) {
      return sendError(res, 'price harus berupa angka bulat 0 atau lebih', 400);
    }
    if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
      return sendError(res, 'isAvailable harus true atau false', 400);
    }

    const existing = await menuService.getMenuItemById(id);
    if (!existing) return sendError(res, 'Menu tidak ditemukan', 404);

    const updated = await menuService.updateMenuItem(id, { name, price, isAvailable });
    return sendSuccess(res, updated, 200, 'Menu berhasil diperbarui');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal memperbarui menu', 500);
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 'ID tidak valid', 400);

    const existing = await menuService.getMenuItemById(id);
    if (!existing) return sendError(res, 'Menu tidak ditemukan', 404);

    await menuService.deleteMenuItem(id);
    return sendSuccess(res, null, 200, 'Menu berhasil dihapus');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal menghapus menu', 500);
  }
};