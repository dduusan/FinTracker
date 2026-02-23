import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { usePageTitle } from "../hooks/usePageTitle";
import type { Transaction, TransactionFilters } from "../api/transactions";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactions";
import type { Category } from "../api/categories";
import { getCategories } from "../api/categories";
import TransactionTable from "../components/transactions/TransactionTable";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionFiltersComponent from "../components/transactions/TransactionFilters";
import DeleteConfirmModal from "../components/transactions/DeleteConfirmModal";
import Button from "../components/ui/Button";

const DEFAULT_FILTERS: TransactionFilters = {
  type: "",
  category_id: "",
  date_from: "",
  date_to: "",
  page: 1,
  per_page: 20,
};

export default function TransactionsPage() {
  usePageTitle("Transactions");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTransactions(filters);
      setTransactions(data);
    } catch {
      toast.error("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  async function handleCreate(data: Parameters<typeof createTransaction>[0]) {
    setSaving(true);
    try {
      await createTransaction(data);
      toast.success("Transaction created!");
      setFormOpen(false);
      loadTransactions();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message ?? "Failed to create transaction.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(data: Parameters<typeof createTransaction>[0]) {
    if (!editTx) return;
    setSaving(true);
    try {
      await updateTransaction(editTx.id, data);
      toast.success("Transaction updated!");
      setEditTx(null);
      loadTransactions();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message ?? "Failed to update transaction.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTx) return;
    setDeleting(true);
    try {
      await deleteTransaction(deleteTx.id);
      toast.success("Transaction deleted!");
      setDeleteTx(null);
      loadTransactions();
    } catch {
      toast.error("Failed to delete transaction.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={18} className="mr-1" />
          New Transaction
        </Button>
      </div>

      <TransactionFiltersComponent
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          categories={categories}
          onEdit={(tx) => setEditTx(tx)}
          onDelete={(tx) => setDeleteTx(tx)}
        />
      )}

      <TransactionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        categories={categories}
        loading={saving}
      />

      <TransactionForm
        isOpen={!!editTx}
        onClose={() => setEditTx(null)}
        onSubmit={handleEdit}
        categories={categories}
        editData={editTx}
        loading={saving}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
