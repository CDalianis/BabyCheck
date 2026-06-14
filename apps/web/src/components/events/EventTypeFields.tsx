import type { BabyEvent, EventType } from "@babycheck/shared";
import {
  formatSleepDurationMinutes,
  sleepDurationOptionsForValue,
} from "@babycheck/shared";
import { fieldName } from "../../utils/eventForm";
import { inputClass, labelClass } from "../ui/form";

interface EventTypeFieldsProps {
  type: EventType;
  event?: BabyEvent;
  fieldPrefix?: string;
}

export default function EventTypeFields({
  type,
  event,
  fieldPrefix,
}: EventTypeFieldsProps) {
  const p = event?.payload;
  const n = (name: string) => fieldName(fieldPrefix, name);

  if (type === "feeding") {
    const feeding = p as BabyEvent<"feeding">["payload"] | undefined;
    return (
      <>
        <div>
          <label htmlFor={n("method")} className={labelClass}>
            Method
          </label>
          <select
            id={n("method")}
            name={n("method")}
            className={inputClass}
            defaultValue={feeding?.method ?? "bottle"}
            required
          >
            <option value="breast">Breast</option>
            <option value="bottle">Bottle</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
        <div>
          <label htmlFor={n("amountMl")} className={labelClass}>
            Amount (ml)
          </label>
          <input
            id={n("amountMl")}
            name={n("amountMl")}
            className={inputClass}
            type="number"
            defaultValue={feeding?.amountMl ?? ""}
          />
        </div>
      </>
    );
  }

  if (type === "diaper") {
    const diaper = p as BabyEvent<"diaper">["payload"] | undefined;
    return (
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-theme-body">
          <input
            name={n("wet")}
            type="checkbox"
            className="rounded border-theme"
            defaultChecked={diaper?.wet}
          />{" "}
          Wet
        </label>
        <label className="flex items-center gap-2 text-sm text-theme-body">
          <input
            name={n("dirty")}
            type="checkbox"
            className="rounded border-theme"
            defaultChecked={diaper?.dirty}
          />{" "}
          Dirty
        </label>
      </div>
    );
  }

  if (type === "sleep") {
    const sleep = p as BabyEvent<"sleep">["payload"] | undefined;
    const durationOptions = sleepDurationOptionsForValue(sleep?.durationMinutes);
    const defaultDuration =
      sleep?.durationMinutes ?? durationOptions[0] ?? 15;

    return (
      <div>
        <label htmlFor={n("durationMinutes")} className={labelClass}>
          Duration
        </label>
        <select
          id={n("durationMinutes")}
          name={n("durationMinutes")}
          className={inputClass}
          defaultValue={String(defaultDuration)}
          required
        >
          {durationOptions.map((minutes) => (
            <option key={minutes} value={minutes}>
              {formatSleepDurationMinutes(minutes)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "weight") {
    const weight = p as BabyEvent<"weight">["payload"] | undefined;
    return (
      <div>
        <label htmlFor={n("weightKg")} className={labelClass}>
          Weight (kg)
        </label>
        <input
          id={n("weightKg")}
          name={n("weightKg")}
          className={inputClass}
          type="number"
          step="0.01"
          min={0}
          defaultValue={weight?.weightKg ?? ""}
          required
        />
      </div>
    );
  }

  if (type === "medication") {
    const med = p as BabyEvent<"medication">["payload"] | undefined;
    return (
      <>
        <div>
          <label htmlFor={n("name")} className={labelClass}>
            Medication
          </label>
          <input
            id={n("name")}
            name={n("name")}
            className={inputClass}
            defaultValue={med?.name ?? ""}
            required
          />
        </div>
        <div>
          <label htmlFor={n("dose")} className={labelClass}>
            Dose
          </label>
          <input
            id={n("dose")}
            name={n("dose")}
            className={inputClass}
            defaultValue={med?.dose ?? ""}
            required
          />
        </div>
      </>
    );
  }

  if (type === "pumping") {
    const pumping = p as BabyEvent<"pumping">["payload"] | undefined;
    return (
      <div>
        <label htmlFor={n("amountMl")} className={labelClass}>
          Amount (ml)
        </label>
        <input
          id={n("amountMl")}
          name={n("amountMl")}
          className={inputClass}
          type="number"
          min={1}
          defaultValue={pumping?.amountMl ?? ""}
          required
        />
      </div>
    );
  }

  return null;
}
