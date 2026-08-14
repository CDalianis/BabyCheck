import type { Request, Response, NextFunction } from "express";
import type { CreateBabyInput, UpdateBabyInput } from "@babycheck/shared";
import * as babiesService from "../services/babies.service.js";
import { AppError } from "../utils/errors.js";
import { getParam } from "../utils/params.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const babies = await babiesService.listBabies(req.user!.userId);
    res.json({ data: babies });
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const baby = await babiesService.getBaby(req.user!.userId, getParam(req, "id"));
    res.json({ baby });
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as CreateBabyInput;
    const baby = await babiesService.createBaby(req.user!.userId, input);
    res.status(201).json({ baby });
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as UpdateBabyInput;
    const baby = await babiesService.updateBaby(
      req.user!.userId,
      getParam(req, "id"),
      input
    );
    res.json({ baby });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await babiesService.deleteBaby(req.user!.userId, getParam(req, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function uploadPhoto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const babyId = getParam(req, "id");
    if (!req.file) {
      return next(new AppError(400, "No photo file provided"));
    }

    const baby = await babiesService.setBabyPhoto(
      req.user!.userId,
      babyId,
      req.file.filename
    );
    res.json({ baby });
  } catch (error) {
    if (req.file?.filename) {
      babiesService.cleanupUploadedPhoto(req.file.filename);
    }
    next(error);
  }
}

export async function deletePhoto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const baby = await babiesService.removeBabyPhoto(
      req.user!.userId,
      getParam(req, "id")
    );
    res.json({ baby });
  } catch (error) {
    next(error);
  }
}
