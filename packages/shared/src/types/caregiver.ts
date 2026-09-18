export type CaregiverRole = "owner" | "caregiver";

export interface BabyMember {
  id: string;
  babyId: string;
  userId: string;
  email: string;
  name: string;
  role: CaregiverRole;
  createdAt: string;
}

export interface BabyInvite {
  id: string;
  babyId: string;
  email: string;
  role: CaregiverRole;
  status: "pending" | "accepted" | "revoked";
  invitedByUserId: string;
  createdAt: string;
  expiresAt: string;
}
