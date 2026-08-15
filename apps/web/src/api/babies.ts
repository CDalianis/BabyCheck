import type { Baby, CreateBabyInput, UpdateBabyInput } from "@babycheck/shared";
import { apiFetch } from "./client";

export function listBabies() {
  return apiFetch<{ data: Baby[] }>("/api/babies");
}

export function getBaby(id: string) {
  return apiFetch<{ baby: Baby }>(`/api/babies/${id}`);
}

export function createBaby(input: CreateBabyInput) {
  return apiFetch<{ baby: Baby }>("/api/babies", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateBaby(id: string, input: UpdateBabyInput) {
  return apiFetch<{ baby: Baby }>(`/api/babies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function uploadBabyPhoto(id: string, file: File) {
  const form = new FormData();
  form.append("photo", file);
  return apiFetch<{ baby: Baby }>(`/api/babies/${id}/photo`, {
    method: "POST",
    body: form,
  });
}

export function deleteBabyPhoto(id: string) {
  return apiFetch<{ baby: Baby }>(`/api/babies/${id}/photo`, {
    method: "DELETE",
  });
}
