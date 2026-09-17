import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
    const status = err.statusCode ?? 500;
    console.error("[ERROR]", err.message);
    res.status(status).json({ success: false, message: err.message ?? "Internal Server Error" });
}
