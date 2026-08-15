import { Router } from "express";
import { updateEventSchema } from "@babycheck/shared";
import * as eventsController from "../controllers/events.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import authRoutes from "./auth.routes.js";
import babiesRoutes from "./babies.routes.js";
import todosRoutes from "./todos.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/babies", babiesRoutes);
router.use("/todos", todosRoutes);

router.get("/events/:id", requireAuth, eventsController.get);
router.patch(
  "/events/:id",
  requireAuth,
  validate(updateEventSchema),
  eventsController.update
);
router.delete("/events/:id", requireAuth, eventsController.remove);

export default router;
