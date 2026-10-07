import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: unknown,
  status = 200,
  message = 'Success',
  meta?: unknown,
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
};

export const sendError = (res: Response, message: string, status = 500) => {
  return res.status(status).json({ success: false, message });
};