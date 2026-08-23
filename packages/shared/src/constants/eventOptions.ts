export const FEEDING_METHODS = ["breast", "bottle", "mixed"] as const;
export type FeedingMethod = (typeof FEEDING_METHODS)[number];

export const FEEDING_METHOD_LABELS: Record<FeedingMethod, string> = {
  breast: "Breast",
  bottle: "Bottle",
  mixed: "Mixed",
};

export const DIAPER_FILTER_OPTIONS = ["wet", "dirty", "both"] as const;
export type DiaperFilterOption = (typeof DIAPER_FILTER_OPTIONS)[number];

export const DIAPER_FILTER_LABELS: Record<DiaperFilterOption, string> = {
  wet: "Wet only",
  dirty: "Dirty only",
  both: "Wet & dirty",
};

export const PUMPING_SIDES = ["left", "right", "both"] as const;
export type PumpingSide = (typeof PUMPING_SIDES)[number];

export const PUMPING_SIDE_LABELS: Record<PumpingSide, string> = {
  left: "Left",
  right: "Right",
  both: "Both sides",
};
