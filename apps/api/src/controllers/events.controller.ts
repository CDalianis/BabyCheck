import type { Request, Response, NextFunction } from "express";
import type {
  CreateEventInput,
  ListEventsQuery,
  UpdateEventInput,
} from "@babycheck/shared";
import * as eventsService from "../services/events.service.js";
import { getParam } from "../utils/params.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.validatedQuery as ListEventsQuery;
    const result = await eventsService.listEvents(
      req.user!.userId,
      getParam(req, "babyId"),
      query
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventsService.getEvent(req.user!.userId, getParam(req, "id"));
    res.json({ event });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as CreateEventInput;
    const event = await eventsService.createEvent(
      req.user!.userId,
      getParam(req, "babyId"),
      input
    );
    res.status(201).json({ event });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as UpdateEventInput;
    const event = await eventsService.updateEvent(
      req.user!.userId,
      getParam(req, "id"),
      input
    );
    res.json({ event });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await eventsService.deleteEvent(req.user!.userId, getParam(req, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function todayStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await eventsService.getTodayStats(
      req.user!.userId,
      getParam(req, "babyId")
    );
    res.json({ stats });
  } catch (error) {
    next(error);
  }
}
