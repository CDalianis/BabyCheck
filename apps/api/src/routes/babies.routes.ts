import { Router } from "express";
import {
  createBabySchema,
  createMilestoneSchema,
  inviteCaregiverSchema,
  updateBabySchema,
  updateMilestoneSchema,
} from "@babycheck/shared";
import * as babiesController from "../controllers/babies.controller.js";
import * as caregiversController from "../controllers/caregivers.controller.js";
import * as eventsController from "../controllers/events.controller.js";
import * as milestonesController from "../controllers/milestones.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { babyPhotoUpload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import * as babiesService from "../services/babies.service.js";
import { getParam } from "../utils/params.js";
import eventsRoutes from "./events.routes.js";

const router = Router();

router.use(requireAuth);

router.get("/", babiesController.list);
router.post("/", validate(createBabySchema), babiesController.create);
router.get("/:id", babiesController.get);
router.patch("/:id", validate(updateBabySchema), babiesController.update);
router.delete("/:id", babiesController.remove);

router.post(
  "/:id/photo",
  (req, res, next) => {
    babiesService
      .prepareBabyPhotoUpload(req.user!.userId, getParam(req, "id"))
      .then(() => next())
      .catch(next);
  },
  babyPhotoUpload.single("photo"),
  babiesController.uploadPhoto
);
router.delete("/:id/photo", babiesController.deletePhoto);

router.get("/:id/members", caregiversController.listMembers);
router.get("/:id/invites", caregiversController.listInvites);
router.post(
  "/:id/invites",
  validate(inviteCaregiverSchema),
  caregiversController.invite
);
router.delete(
  "/:id/members/:memberUserId",
  caregiversController.removeMember
);
router.delete("/:id/invites/:inviteId", caregiversController.revokeInvite);

router.get("/:babyId/milestones", milestonesController.list);
router.post(
  "/:babyId/milestones",
  validate(createMilestoneSchema),
  milestonesController.create
);

router.use("/:babyId/events", eventsRoutes);
router.get("/:babyId/stats/today", eventsController.todayStats);

export default router;
