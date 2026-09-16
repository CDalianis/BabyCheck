import type { Request, Response, NextFunction } from "express";
import type {
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from "@babycheck/shared";
import * as milestonesService from "../services/milestones.service.js";
import { getParam } from "../utils/params.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await milestonesService.listMilestones(
      req.user!.userId,
      getParam(req, "babyId")
    );
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const milestone = await milestonesService.createMilestone(
      req.user!.userId,
      getParam(req, "babyId"),
      req.body as CreateMilestoneInput
    );
    res.status(201).json({ milestone });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const milestone = await milestonesService.updateMilestone(
      req.user!.userId,
      getParam(req, "id"),
      req.body as UpdateMilestoneInput
    );
    res.json({ milestone });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await milestonesService.deleteMilestone(
      req.user!.userId,
      getParam(req, "id")
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
