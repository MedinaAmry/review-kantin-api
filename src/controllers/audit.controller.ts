import { Request, Response } from 'express';
import * as auditService from '../services/audit.service';
import { sendSuccess, sendError } from '../utils/response';

const parseId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const filters: { userId?: number; action?: string; targetTable?: string } = {};

    if (req.query.userId !== undefined) {
      const userId = parseId(req.query.userId);
      if (!userId) return sendError(res, 'userId tidak valid', 400);
      filters.userId = userId;
    }
    if (req.query.action) filters.action = String(req.query.action);
    if (req.query.targetTable) filters.targetTable = String(req.query.targetTable);

    const data = await auditService.getAuditLogs(filters);
    return sendSuccess(res, data, 200, 'Data audit log berhasil diambil');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal mengambil data audit log', 500);
  }
};

export const createAuditLog = async (req: Request, res: Response) => {
  try {
    const { action, targetTable, targetId, metadata } = req.body ?? {};
    const userIdNumber = req.user!.id;

    if (!action || !targetTable || !targetId) {
      return sendError(res, 'action, targetTable, dan targetId wajib diisi', 400);
    }
    const targetIdNumber = parseId(targetId);
    if (!targetIdNumber) {
      return sendError(res, 'targetId harus berupa angka', 400);
    }
    if (typeof action !== 'string' || action.length > 50) {
      return sendError(res, 'action harus berupa teks maksimal 50 karakter', 400);
    }
    if (typeof targetTable !== 'string' || targetTable.length > 50) {
      return sendError(res, 'targetTable harus berupa teks maksimal 50 karakter', 400);
    }

    let metadataText: string | undefined;
    if (metadata !== undefined) {
      metadataText = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
    }

    const created = await auditService.createAuditLog({
      userId: userIdNumber,
      action,
      targetTable,
      targetId: targetIdNumber,
      metadata: metadataText,
    });
    return sendSuccess(res, created, 201, 'Audit log berhasil dibuat');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Gagal membuat audit log', 500);
  }
};