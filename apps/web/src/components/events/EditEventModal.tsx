import { EVENT_TYPE_LABELS } from "@babycheck/shared";
import { useEventDetailModal } from "../../context/EventDetailModalContext";
import Modal from "../ui/Modal";
import EditEventForm from "./EditEventForm";

export default function EditEventModal() {
  const { event, isOpen, close } = useEventDetailModal();

  if (!event) return null;

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title="Edit event"
      subtitle={EVENT_TYPE_LABELS[event.type]}
    >
      <EditEventForm event={event} onSuccess={close} />
    </Modal>
  );
}
