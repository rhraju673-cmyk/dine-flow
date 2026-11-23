/**
 * Consistent API errors.
 *
 * Every error response has the same JSON shape:
 *   { "error": { "code": "SOME_CODE", "message": "Human readable", "details"?: ... } }
 *
 * Throw an AppError anywhere in a route/service and the global error
 * handler (middleware/errorHandler.ts) turns it into that response.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Errors = {
  badRequest: (message = 'Bad request', details?: unknown) =>
    new AppError(400, 'BAD_REQUEST', message, details),
  validation: (details: unknown) =>
    new AppError(400, 'VALIDATION_ERROR', 'Some fields are invalid', details),
  unauthorized: (message = 'You need to sign in to continue') =>
    new AppError(401, 'UNAUTHORIZED', message),
  invalidCredentials: () =>
    new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect'),
  forbidden: (message = 'You do not have permission to do this', code = 'FORBIDDEN') =>
    new AppError(403, code, message),
  notFound: (message = 'Not found', code = 'NOT_FOUND') => new AppError(404, code, message),
  conflict: (message: string, code = 'CONFLICT') => new AppError(409, code, message),
  tooManyRequests: (message = 'Too many attempts. Please try again later.') =>
    new AppError(429, 'TOO_MANY_REQUESTS', message),
};
