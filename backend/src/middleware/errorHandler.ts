import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  const status = err.statusCode ?? 500;
  // Only log server errors (5xx); 4xx are user errors, not system failures.
  if (status >= 500) {
    console.error("[ERROR]", err);
  }
  res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal Server Error" : (err.message ?? "An error occurred"),
  });
}
