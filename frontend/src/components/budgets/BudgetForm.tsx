import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { BudgetCreate, BudgetSummaryItem } from "../../api/budgets";
import type { Category } from "../../api/categories";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface FormData {
  category_id: string;
  amount: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetCreate) => Promise<void>;
  editData?: BudgetSummaryItem | null;
  categories: Category[];
  existingCategoryIds: number[];
  currentMonth: string;
  loading?: boolean;
}

export default function BudgetForm({
  isOpen,
  onClose,
  onSubmit,
  editData,
  categories,
  existingCategoryIds,
  currentMonth,
  loading,
}: Props) {
  const isEdit = !!editData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        reset({
          category_id: String(editData.category_id),
          amount: String(editData.budgeted),
        });
      } else {
        reset({ category_id: "", amount: "" });
      }
    }
  }, [isOpen, editData, reset]);

  // Filtriraj samo expense kategorije koje jos nemaju budzet
  const availableCategories = categories.filter(
    (c) => c.type === "expense" && !existingCategoryIds.includes(c.id)
  );

  async function handleFormSubmit(data: FormData) {
    await onSubmit({
      category_id: isEdit ? editData!.category_id : Number(data.category_id),
      amount: Number(data.amount),
      month: currentMonth,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Izmeni budžet" : "Novi budžet"}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Kategorija */}
        {isEdit ? (
          <Input
            id="category_display"
            label="Kategorija"
            value={editData?.category_name ?? ""}
            disabled
          />
        ) : (
          <div className="w-full">
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kategorija
            </label>
            <select
              id="category_id"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              {...register("category_id", { required: "Kategorija je obavezna" })}
            >
              <option value="">Izaberi kategoriju...</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.icon ?? "📂"} {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
            )}
          </div>
        )}

        <Input
          id="amount"
          label="Planirani iznos (RSD)"
          type="number"
          step="0.01"
          min="1"
          placeholder="Npr. 15000"
          error={errors.amount?.message}
          {...register("amount", {
            required: "Iznos je obavezan",
            min: { value: 1, message: "Iznos mora biti pozitivan" },
          })}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Otkaži
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {isEdit ? "Sačuvaj" : "Dodaj"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
