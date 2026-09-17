import { Request, Response, NextFunction } from "express";

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  const error = new Error(`Not Found — ${req.originalUrl}`) as Error & { statusCode: number };
  error.statusCode = 404;
  next(error);
}
