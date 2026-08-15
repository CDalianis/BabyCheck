import { Router } from "express";
import { createTodoSchema, updateTodoSchema } from "@babycheck/shared";
import * as todosController from "../controllers/todos.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);

router.get("/", todosController.list);
router.post("/", validate(createTodoSchema), todosController.create);
router.delete("/completed", todosController.clearCompleted);
router.patch("/:id", validate(updateTodoSchema), todosController.update);
router.delete("/:id", todosController.remove);

export default router;
