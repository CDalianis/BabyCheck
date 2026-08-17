const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function resolveBabyPhotoUrl(
  photoUrl: string | null,
  cacheKey?: string
): string | null {
  if (!photoUrl) return null;
  const base = photoUrl.startsWith("http") ? photoUrl : `${API_BASE}${photoUrl}`;
  if (!cacheKey) return base;
  return `${base}?v=${encodeURIComponent(cacheKey)}`;
}
