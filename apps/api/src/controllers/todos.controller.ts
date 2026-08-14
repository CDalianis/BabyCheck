import type { Request, Response, NextFunction } from "express";
import type { CreateTodoInput, UpdateTodoInput } from "@babycheck/shared";
import * as todosService from "../services/todos.service.js";
import { getParam } from "../utils/params.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await todosService.listTodos(req.user!.userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as CreateTodoInput;
    const todo = await todosService.createTodo(req.user!.userId, input);
    res.status(201).json({ todo });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as UpdateTodoInput;
    const todo = await todosService.updateTodo(
      req.user!.userId,
      getParam(req, "id"),
      input
    );
    res.json({ todo });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await todosService.deleteTodo(req.user!.userId, getParam(req, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function clearCompleted(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await todosService.clearCompletedTodos(req.user!.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
