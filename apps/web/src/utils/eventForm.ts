import type { CreateEventInput, EventType } from "@babycheck/shared";

export function fieldName(prefix: string | undefined, name: string): string {
  return prefix ? `${prefix}-${name}` : name;
}

function getFormValue(form: FormData, prefix: string | undefined, name: string) {
  return form.get(fieldName(prefix, name));
}

export function toLocalDateTimeInput(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function buildPayloadFromForm(
  type: EventType,
  form: FormData,
  fieldPrefix?: string
): CreateEventInput["payload"] {
  switch (type) {
    case "feeding":
      return {
        method: getFormValue(form, fieldPrefix, "method") as
          | "breast"
          | "bottle"
          | "mixed",
        amountMl: getFormValue(form, fieldPrefix, "amountMl")
          ? Number(getFormValue(form, fieldPrefix, "amountMl"))
          : undefined,
        side:
          (getFormValue(form, fieldPrefix, "side") as
            | "left"
            | "right"
            | "both") || undefined,
      };
    case "diaper":
      return {
        wet: getFormValue(form, fieldPrefix, "wet") === "on",
        dirty: getFormValue(form, fieldPrefix, "dirty") === "on",
      };
    case "sleep":
      return {
        durationMinutes: Number(getFormValue(form, fieldPrefix, "durationMinutes")),
      };
    case "weight":
      return { weightKg: Number(getFormValue(form, fieldPrefix, "weightKg")) };
    case "medication":
      return {
        name: getFormValue(form, fieldPrefix, "name") as string,
        dose: getFormValue(form, fieldPrefix, "dose") as string,
      };
    case "pumping":
      return {
        amountMl: Number(getFormValue(form, fieldPrefix, "amountMl")),
        side:
          (getFormValue(form, fieldPrefix, "side") as
            | "left"
            | "right"
            | "both") || undefined,
      };
  }
}
