import { Router } from "express";
import {
  updateEventSchema,
  updateMilestoneSchema,
} from "@babycheck/shared";
import * as caregiversController from "../controllers/caregivers.controller.js";
import * as eventsController from "../controllers/events.controller.js";
import * as milestonesController from "../controllers/milestones.controller.js";
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

router.get("/invites", requireAuth, caregiversController.listMyInvites);
router.post(
  "/invites/:inviteId/accept",
  requireAuth,
  caregiversController.acceptInvite
);

router.patch(
  "/milestones/:id",
  requireAuth,
  validate(updateMilestoneSchema),
  milestonesController.update
);
router.delete("/milestones/:id", requireAuth, milestonesController.remove);

router.get("/events/:id", requireAuth, eventsController.get);
router.patch(
  "/events/:id",
  requireAuth,
  validate(updateEventSchema),
  eventsController.update
);
router.delete("/events/:id", requireAuth, eventsController.remove);
router.post("/events/:id/restore", requireAuth, eventsController.restore);

export default router;
