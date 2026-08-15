import { Router } from "express";
import { createBabySchema, updateBabySchema } from "@babycheck/shared";
import * as babiesController from "../controllers/babies.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { babyPhotoUpload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import * as babiesService from "../services/babies.service.js";
import { getParam } from "../utils/params.js";
import * as eventsController from "../controllers/events.controller.js";
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

router.use("/:babyId/events", eventsRoutes);
router.get("/:babyId/stats/today", eventsController.todayStats);

export default router;
