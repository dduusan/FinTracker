import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Transaction, TransactionCreate } from "../../api/transactions";
import type { Category } from "../../api/categories";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface FormData {
  amount: number;
  type: "income" | "expense";
  category_id: number;
  description: string;
  date: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionCreate) => Promise<void>;
  categories: Category[];
  editData?: Transaction | null;
  loading?: boolean;
}

export default function TransactionForm({ isOpen, onClose, onSubmit, categories, editData, loading }: Props) {
  const isEdit = !!editData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const selectedType = watch("type");
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        reset({
          amount: editData.amount,
          type: editData.type,
          category_id: editData.category_id,
          description: editData.description ?? "",
          date: editData.date,
        });
      } else {
        reset({
          type: "expense",
          date: new Date().toISOString().split("T")[0],
          description: "",
          amount: undefined,
          category_id: undefined,
        });
      }
    }
  }, [isOpen, editData, reset]);

  async function handleFormSubmit(data: FormData) {
    await onSubmit({
      amount: Number(data.amount),
      type: data.type,
      category_id: Number(data.category_id),
      description: data.description || undefined,
      date: data.date,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Transaction" : "New Transaction"}
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

        {/* Amount */}
        <Input
          id="amount"
          label="Amount (RSD)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register("amount", {
            required: "Amount is required",
            min: { value: 0.01, message: "Amount must be greater than 0" },
          })}
        />

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white ${
              errors.category_id ? "border-red-500" : "border-gray-300"
            }`}
            {...register("category_id", { required: "Category is required" })}
          >
            <option value="">Select a category</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
          )}
        </div>

        {/* Date */}
        <Input
          id="date"
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register("date", { required: "Date is required" })}
        />

        {/* Description */}
        <Input
          id="description"
          label="Description (optional)"
          placeholder="e.g. Supermarket, Salary..."
          {...register("description")}
        />

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
