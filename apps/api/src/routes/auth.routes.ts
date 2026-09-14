import { Router } from "express";
import { loginSchema, registerSchema } from "@babycheck/shared";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  authController.register
);
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  authController.login
);
router.get("/me", requireAuth, authController.me);

export default router;
