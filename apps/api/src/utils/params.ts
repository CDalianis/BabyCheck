import type { Request } from "express";
import { AppError } from "./errors.js";

export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !value) {
    throw new AppError(400, `Missing route parameter: ${name}`);
  }
  return value;
}
