import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export function validate<T>(schema: ZodSchema<T>, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[part]);

    if (part === "body") {
      req.body = parsed;
    } else if (part === "query") {
      req.validatedQuery = parsed;
    } else {
      req.validatedParams = parsed;
    }

    next();
  };
}
