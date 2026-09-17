import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const started = Date.now();
  res.on("finish", () => {
    const entry = {
      level: res.statusCode >= 500 ? "error" : "info",
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - started,
      userId: req.user?.userId,
    };
    console.log(JSON.stringify(entry));
  });

  next();
}
