import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { usePageTitle } from "../hooks/usePageTitle";
import type { BudgetCreate, BudgetSummaryItem } from "../api/budgets";
import {
  getBudgetSummary,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../api/budgets";
import type { Category } from "../api/categories";
import { getCategories } from "../api/categories";
import BudgetCard from "../components/budgets/BudgetCard";
import BudgetForm from "../components/budgets/BudgetForm";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { formatCurrency } from "../lib/utils";

function getMonthString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function formatMonthLabel(dateStr: string): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const [y, m] = dateStr.split("-");
  return `${months[Number(m) - 1]} ${y}`;
}

export default function BudgetsPage() {
  usePageTitle("Budgets");
  const [currentMonth, setCurrentMonth] = useState(() => getMonthString(new Date()));
  const [summary, setSummary] = useState<BudgetSummaryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<BudgetSummaryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<BudgetSummaryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [summaryData, catData] = await Promise.all([
        getBudgetSummary(currentMonth),
        getCategories(),
      ]);
      setSummary(summaryData);
      setCategories(catData);
    } catch {
      toast.error("Failed to load budgets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  function navigateMonth(direction: -1 | 1) {
    const [y, m] = currentMonth.split("-").map(Number);
    const date = new Date(y, m - 1 + direction, 1);
    setCurrentMonth(getMonthString(date));
  }

  async function handleCreate(data: BudgetCreate) {
    setSaving(true);
    try {
      await createBudget(data);
      toast.success("Budget created!");
      setFormOpen(false);
      loadData();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message ?? "Failed to create budget.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(data: BudgetCreate) {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateBudget(editItem.id, { amount: data.amount });
      toast.success("Budget updated!");
      setEditItem(null);
      loadData();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message ?? "Failed to update budget.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await deleteBudget(deleteItem.id);
      toast.success("Budget deleted!");
      setDeleteItem(null);
      loadData();
    } catch {
      toast.error("Failed to delete budget.");
    } finally {
      setDeleting(false);
    }
  }

  // Total statistics
  const totalBudgeted = summary.reduce((acc, i) => acc + i.budgeted, 0);
  const totalSpent = summary.reduce((acc, i) => acc + i.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const totalPercentage = totalBudgeted > 0
    ? Math.min(Math.round((totalSpent / totalBudgeted) * 100), 100)
    : 0;

  const existingCategoryIds = summary.map((s) => s.category_id);

  return (
    <div className="space-y-6">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Budgets</h2>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={18} className="mr-1" />
          New Budget
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold text-gray-800 min-w-[180px] text-center">
          {formatMonthLabel(currentMonth)}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : summary.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-2">No budgets for this month.</p>
          <p className="text-gray-400 text-sm">Click "New Budget" to add your first.</p>
        </div>
      ) : (
        <>
          {/* Total statistics */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Total:</span>
              <span className="text-sm text-gray-500">
                {formatCurrency(totalSpent)} of {formatCurrency(totalBudgeted)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  totalPercentage >= 90
                    ? "bg-red-500"
                    : totalPercentage >= 70
                      ? "bg-amber-500"
                      : "bg-indigo-500"
                }`}
                style={{ width: `${totalPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-500">{totalPercentage}%</span>
              <span className={totalRemaining >= 0 ? "text-green-600" : "text-red-600"}>
                {totalRemaining >= 0
                  ? `Remaining: ${formatCurrency(totalRemaining)}`
                  : `Over budget: ${formatCurrency(Math.abs(totalRemaining))}`}
              </span>
            </div>
          </div>

          {/* Budget cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {summary.map((item) => (
              <BudgetCard
                key={item.id}
                item={item}
                onEdit={setEditItem}
                onDelete={setDeleteItem}
              />
            ))}
          </div>
        </>
      )}

      {/* Create form */}
      <BudgetForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        categories={categories}
        existingCategoryIds={existingCategoryIds}
        currentMonth={currentMonth}
        loading={saving}
      />

      {/* Edit form */}
      <BudgetForm
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handleEdit}
        editData={editItem}
        categories={categories}
        existingCategoryIds={existingCategoryIds}
        currentMonth={currentMonth}
        loading={saving}
      />

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Budget"
      >
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete the budget for{" "}
          <strong>{deleteItem?.category_name}</strong>?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteItem(null)} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting} className="flex-1">
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
