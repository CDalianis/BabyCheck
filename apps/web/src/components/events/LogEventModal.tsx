import { useLogEventModal } from "../../context/LogEventModalContext";
import { useBaby } from "../../context/BabyContext";
import Modal from "../ui/Modal";
import LogEventForm from "./LogEventForm";

export default function LogEventModal() {
  const { isOpen, defaultDateTime, close } = useLogEventModal();
  const { activeBaby } = useBaby();

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title="Log events"
      subtitle={
        activeBaby
          ? `Log one or more events at the same time for ${activeBaby.name}`
          : undefined
      }
    >
      <LogEventForm defaultDateTime={defaultDateTime} onSuccess={close} />
    </Modal>
  );
}
