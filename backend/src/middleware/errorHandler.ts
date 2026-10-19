import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  const candidate = err?.code === 11000 ? 409 : err?.name === "ValidationError" ? 400 : err?.statusCode;
  const status = Number.isInteger(candidate) && candidate >= 400 && candidate <= 599 ? candidate : 500;
  // Only log server errors (5xx); 4xx are user errors, not system failures.
  if (status >= 500) {
    console.error("[ERROR]", err?.stack ?? err);
  }
  res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal Server Error" : (err.message ?? "An error occurred"),
  });
}
