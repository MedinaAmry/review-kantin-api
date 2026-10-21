import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { sendError, FieldError } from '../utils/response';

type Schemas = { params?: ZodType; query?: ZodType; body?: ZodType };

export const validate = (schemas: Schemas) => (req: Request, res: Response, next: NextFunction) => {
  const errors: FieldError[] = [];
  const validated: Record<string, any> = {};

  for (const source of ['params', 'query', 'body'] as const) {
    const schema = schemas[source];
    if (!schema) continue;
    const result = schema.safeParse((req as any)[source] ?? {});
    if (result.success) validated[source] = result.data;
    else for (const issue of result.error.issues) {
      errors.push({ field: issue.path.map(String).join('.') || source, message: issue.message });
    }
  }

  if (errors.length) return sendError(res, 'Validasi gagal', 400, errors);
  req.validated = validated;
  next();
};