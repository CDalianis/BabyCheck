import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { isAppError } from "../utils/errors.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (isAppError(err)) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5 MB or smaller"
        : err.message;
    return res.status(400).json({ error: message });
  }

  if (err instanceof Error && err.message.includes("JPEG, PNG")) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.flatten(),
    });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
