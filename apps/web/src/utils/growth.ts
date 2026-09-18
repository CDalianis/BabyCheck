export interface GrowthReference {
  month: number;
  p3: number;
  median: number;
  p97: number;
}

const BOYS_MEDIAN = [3.3, 4.5, 5.6, 6.4, 7, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6];
const GIRLS_MEDIAN = [3.2, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 7.6, 7.9, 8.2, 8.5, 8.7, 8.9];

export function ageInMonths(birthDate: string, at = new Date()): number {
  const birth = new Date(`${birthDate}T00:00:00`);
  return Math.max(0, Math.min(12, Math.floor((at.getTime() - birth.getTime()) / 2_629_746_000)));
}

export function getWeightReference(gender: string | null, month: number): GrowthReference {
  const index = Math.max(0, Math.min(12, Math.round(month)));
  const median = (gender ?? "").toLowerCase() === "girl" ? GIRLS_MEDIAN[index] : BOYS_MEDIAN[index];
  return {
    month: index,
    median,
    p3: Number((median * 0.76).toFixed(1)),
    p97: Number((median * 1.27).toFixed(1)),
  };
}
