export const SLEEP_DURATION_STEP_MINUTES = 15;
export const SLEEP_DURATION_MIN_MINUTES = 15;
export const SLEEP_DURATION_MAX_MINUTES = 12 * 60;

export function buildSleepDurationOptions(): number[] {
  const options: number[] = [];
  for (
    let minutes = SLEEP_DURATION_MIN_MINUTES;
    minutes <= SLEEP_DURATION_MAX_MINUTES;
    minutes += SLEEP_DURATION_STEP_MINUTES
  ) {
    options.push(minutes);
  }
  return options;
}

export function formatSleepDurationMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
  const hourLabel = hours === 1 ? "1 hr" : `${hours} hr`;
  return `${hourLabel} ${mins} min`;
}

/** Includes a legacy value when editing an event logged outside 15-min steps. */
export function sleepDurationOptionsForValue(current?: number): number[] {
  const options = buildSleepDurationOptions();
  if (current != null && current > 0 && !options.includes(current)) {
    return [...options, current].sort((a, b) => a - b);
  }
  return options;
}
