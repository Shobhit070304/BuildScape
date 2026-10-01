import { NextFunction, Request, RequestHandler, Response } from "express";

// Forward rejected controller promises to the shared error handler.
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => { void handler(req, res, next).catch(next); };
}
