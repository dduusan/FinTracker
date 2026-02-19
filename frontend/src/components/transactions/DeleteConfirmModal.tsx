import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, loading }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Obriši transakciju">
      <p className="text-sm text-gray-600 mb-6">
        Da li si siguran da želiš da obrišeš ovu transakciju? Ova akcija se ne može poništiti.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Otkaži
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">
          Obriši
        </Button>
      </div>
    </Modal>
  );
}
