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
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Transaction">
      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to delete this transaction? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">
          Delete
        </Button>
      </div>
    </Modal>
  );
}
