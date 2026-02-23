import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Category, CategoryCreate } from "../../api/categories";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface FormData {
  name: string;
  type: "income" | "expense";
  icon: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryCreate) => Promise<void>;
  editData?: Category | null;
  loading?: boolean;
}

const COMMON_ICONS = [
  "💰", "💳", "🏦", "📈", "🎁", "💻", "🏠", "🚗", "🍔", "🛒",
  "👗", "💊", "📚", "🎮", "✈️", "🎵", "🏋️", "🐾", "⚡", "📱",
];

export default function CategoryForm({ isOpen, onClose, onSubmit, editData, loading }: Props) {
  const isEdit = !!editData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { type: "expense", icon: "💰", name: "" },
  });

  const selectedType = watch("type");
  const selectedIcon = watch("icon");

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        reset({
          name: editData.name,
          type: editData.type,
          icon: editData.icon ?? "💰",
        });
      } else {
        reset({ type: "expense", icon: "💰", name: "" });
      }
    }
  }, [isOpen, editData, reset]);

  async function handleFormSubmit(data: FormData) {
    await onSubmit({
      name: data.name,
      type: data.type,
      icon: data.icon || undefined,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Category" : "New Category"}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex gap-2">
            {(["expense", "income"] as const).map((t) => (
              <label
                key={t}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                  selectedType === t
                    ? t === "expense"
                      ? "bg-red-50 border-red-400 text-red-700"
                      : "bg-green-50 border-green-400 text-green-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <input type="radio" value={t} {...register("type")} className="hidden" />
                {t === "expense" ? "Expense" : "Income"}
              </label>
            ))}
          </div>
        </div>

        {/* Name */}
        <Input
          id="name"
          label="Name"
          placeholder="e.g. Food, Salary..."
          error={errors.name?.message}
          {...register("name", { required: "Name is required" })}
        />

        {/* Icon — quick pick */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setValue("icon", icon)}
                className={`text-xl p-1.5 rounded-lg border transition-colors ${
                  selectedIcon === icon
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          <Input
            id="icon"
            placeholder="Or type an emoji..."
            {...register("icon")}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {isEdit ? "Save" : "Add"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
