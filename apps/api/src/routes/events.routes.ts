import { Router } from "express";
import {
  createEventSchema,
  listEventsQuerySchema,
  updateEventSchema,
} from "@babycheck/shared";
import * as eventsController from "../controllers/events.controller.js";
import { validate } from "../middleware/validate.js";

const router = Router({ mergeParams: true });

router.get("/", validate(listEventsQuerySchema, "query"), eventsController.list);
router.post("/", validate(createEventSchema), eventsController.create);

export default router;
