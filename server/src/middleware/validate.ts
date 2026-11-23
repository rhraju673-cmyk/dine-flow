import type { NextFunction, Request, Response } from 'express';
import { z, type ZodType } from 'zod';
import { Errors } from '../utils/errors.js';

/** Converts Zod issues into { fieldName: "message" } for easy display in forms. */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join('.') : '_form';
    fields[key] ??= issue.message;
  }
  return fields;
}

/**
 * Validates (and cleans) req.body with a Zod schema.
 * Unknown fields are stripped, so clients cannot sneak in extra properties
 * like "role" or "platformRole".
 */
export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) return next(Errors.validation({ fields: formatZodError(result.error) }));
    req.body = result.data;
    next();
  };
}
