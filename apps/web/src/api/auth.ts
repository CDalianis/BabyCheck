import type { AuthResponse, LoginInput, RegisterInput, User } from "@babycheck/shared";
import { apiFetch } from "./client";

export function register(input: RegisterInput) {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getMe() {
  return apiFetch<{ user: User }>("/api/auth/me");
}
