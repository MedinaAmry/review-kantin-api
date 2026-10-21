import { Response } from 'express';

export type FieldError = { field: string; message: string };

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

export const sendError = (
  res: Response,
  message: string,
  status = 500,
  errors: FieldError[] = [],
) => {
  return res.status(status).json({
    status: status >= 500 ? 'error' : 'fail',
    message,
    errors,
  });
};