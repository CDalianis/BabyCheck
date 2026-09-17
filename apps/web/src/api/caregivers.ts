import type {
  BabyInvite,
  BabyMember,
  InviteCaregiverInput,
  Milestone,
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from "@babycheck/shared";
import { apiFetch } from "./client";

export function listMembers(babyId: string) {
  return apiFetch<{ data: BabyMember[] }>(`/api/babies/${babyId}/members`);
}

export function listBabyInvites(babyId: string) {
  return apiFetch<{ data: BabyInvite[] }>(`/api/babies/${babyId}/invites`);
}

export function inviteCaregiver(babyId: string, input: InviteCaregiverInput) {
  return apiFetch<{
    invite: BabyInvite;
    autoAccepted: boolean;
  }>(`/api/babies/${babyId}/invites`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function removeMember(babyId: string, memberUserId: string) {
  return apiFetch<void>(`/api/babies/${babyId}/members/${memberUserId}`, {
    method: "DELETE",
  });
}

export function revokeInvite(babyId: string, inviteId: string) {
  return apiFetch<void>(`/api/babies/${babyId}/invites/${inviteId}`, {
    method: "DELETE",
  });
}

export function listMyInvites() {
  return apiFetch<{
    data: Array<BabyInvite & { babyName: string }>;
  }>("/api/invites");
}

export function acceptInvite(inviteId: string) {
  return apiFetch<{ babyId: string }>(`/api/invites/${inviteId}/accept`, {
    method: "POST",
  });
}

export function listMilestones(babyId: string) {
  return apiFetch<{ data: Milestone[] }>(
    `/api/babies/${babyId}/milestones`
  );
}

export function createMilestone(babyId: string, input: CreateMilestoneInput) {
  return apiFetch<{ milestone: Milestone }>(
    `/api/babies/${babyId}/milestones`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export function updateMilestone(id: string, input: UpdateMilestoneInput) {
  return apiFetch<{ milestone: Milestone }>(`/api/milestones/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteMilestone(id: string) {
  return apiFetch<void>(`/api/milestones/${id}`, {
    method: "DELETE",
  });
}
