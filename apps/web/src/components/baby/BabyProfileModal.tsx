import { useAuth } from "../../context/AuthContext";
import { useBabyProfileModal } from "../../context/BabyProfileModalContext";
import Modal from "../ui/Modal";
import BabyProfileForm from "./BabyProfileForm";

export default function BabyProfileModal() {
  const { isOpen, close } = useBabyProfileModal();
  const { user } = useAuth();

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title="Baby profile"
      subtitle={user ? `Signed in as ${user.name}` : undefined}
    >
      <BabyProfileForm
        onSuccess={() => {
          close();
        }}
      />
    </Modal>
  );
}
