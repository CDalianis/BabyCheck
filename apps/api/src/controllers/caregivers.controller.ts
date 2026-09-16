import type { Request, Response, NextFunction } from "express";
import type { InviteCaregiverInput } from "@babycheck/shared";
import * as caregiversService from "../services/caregivers.service.js";
import { getParam } from "../utils/params.js";

export async function listMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await caregiversService.listMembers(
      req.user!.userId,
      getParam(req, "id")
    );
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function listInvites(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await caregiversService.listInvites(
      req.user!.userId,
      getParam(req, "id")
    );
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function invite(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await caregiversService.inviteCaregiver(
      req.user!.userId,
      getParam(req, "id"),
      req.body as InviteCaregiverInput
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function removeMember(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await caregiversService.removeMember(
      req.user!.userId,
      getParam(req, "id"),
      getParam(req, "memberUserId")
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function revokeInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await caregiversService.revokeInvite(
      req.user!.userId,
      getParam(req, "id"),
      getParam(req, "inviteId")
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listMyInvites(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await caregiversService.listMyPendingInvites(req.user!.userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
}

export async function acceptInvite(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await caregiversService.acceptInvite(
      req.user!.userId,
      getParam(req, "inviteId")
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}
