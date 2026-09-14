import { Router } from "express";
import {
  createEventSchema,
  createEventsBatchSchema,
  listEventsQuerySchema,
} from "@babycheck/shared";
import * as eventsController from "../controllers/events.controller.js";
import { validate } from "../middleware/validate.js";

const router = Router({ mergeParams: true });

router.get("/", validate(listEventsQuerySchema, "query"), eventsController.list);
router.post("/", validate(createEventSchema), eventsController.create);
router.post(
  "/batch",
  validate(createEventsBatchSchema),
  eventsController.createBatch
);

export default router;
