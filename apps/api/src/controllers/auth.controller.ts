import type { Request, Response, NextFunction } from "express";
import type { LoginInput, RegisterInput } from "@babycheck/shared";
import { signToken } from "../middleware/auth.js";
import * as authService from "../services/auth.service.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = req.body as RegisterInput;
    const user = await authService.registerUser(input);
    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as LoginInput;
    const user = await authService.loginUser(input);
    const token = signToken({ userId: user.id, email: user.email });
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getUserById(req.user!.userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}
