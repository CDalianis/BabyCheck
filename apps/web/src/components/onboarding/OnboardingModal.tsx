import { useState } from "react";
import { useBaby } from "../../context/BabyContext";
import { useBabyProfileModal } from "../../context/BabyProfileModalContext";
import { btnPrimaryClass, btnSecondaryClass } from "../ui/form";
import Modal from "../ui/Modal";

const STORAGE_KEY = "babycheck-onboarding-seen";

export default function OnboardingModal() {
  const { activeBaby, loading } = useBaby();
  const { open: openProfile } = useBabyProfileModal();
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );
  const open = !loading && !activeBaby && !dismissed;
  const steps = [
    ["Welcome to BabyCheck", "Keep feeding, sleep, diaper and growth records in one calm place."],
    ["Create a baby profile", "Add a name and birth date so insights can be personalized."],
    ["Log the first event", "Use Quick Log or tap any diary hour to start tracking."],
  ];

  function close() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }

  return (
    <Modal open={open} onClose={close} title={steps[step][0]} subtitle={`Step ${step + 1} of 3`}>
      <p className="text-sm text-theme-muted">{steps[step][1]}</p>
      <div className="mt-5 flex gap-2">
        {step > 0 && (
          <button type="button" className={btnSecondaryClass} onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}
        {step === 1 ? (
          <button type="button" className={btnPrimaryClass} onClick={() => { close(); openProfile(); }}>
            Open profile
          </button>
        ) : (
          <button
            type="button"
            className={btnPrimaryClass}
            onClick={() => (step === 2 ? close() : setStep((s) => s + 1))}
          >
            {step === 2 ? "Get started" : "Next"}
          </button>
        )}
      </div>
    </Modal>
  );
}
