import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { usePageTitle } from "../hooks/usePageTitle";
import type { Category, CategoryCreate } from "../api/categories";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/categories";
import CategoryCard from "../components/categories/CategoryCard";
import CategoryForm from "../components/categories/CategoryForm";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

export default function CategoriesPage() {
  usePageTitle("Kategorije");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      toast.error("Greška pri učitavanju kategorija.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate(data: CategoryCreate) {
    setSaving(true);
    try {
      await createCategory(data);
      toast.success("Kategorija je dodana!");
      setFormOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message ?? "Greška pri dodavanju.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(data: CategoryCreate) {
    if (!editCat) return;
    setSaving(true);
    try {
      await updateCategory(editCat.id, data);
      toast.success("Kategorija je izmenjena!");
      setEditCat(null);
      loadCategories();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message ?? "Greška pri izmeni.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteCat) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteCat.id);
      toast.success("Kategorija je obrisana!");
      setDeleteCat(null);
      loadCategories();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(message ?? "Nije moguće obrisati kategoriju koja ima transakcije.");
    } finally {
      setDeleting(false);
    }
  }

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Kategorije</h2>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={18} className="mr-1" />
          Nova kategorija
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prihodi */}
          <section>
            <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Prihodi ({income.length})
            </h3>
            {income.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-gray-400 text-sm">Nema kategorija prihoda.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {income.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    onEdit={setEditCat}
                    onDelete={setDeleteCat}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Rashodi */}
          <section>
            <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Rashodi ({expense.length})
            </h3>
            {expense.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
                <p className="text-gray-400 text-sm">Nema kategorija rashoda.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {expense.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    onEdit={setEditCat}
                    onDelete={setDeleteCat}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Forma za kreiranje */}
      <CategoryForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        loading={saving}
      />

      {/* Forma za izmenu */}
      <CategoryForm
        isOpen={!!editCat}
        onClose={() => setEditCat(null)}
        onSubmit={handleEdit}
        editData={editCat}
        loading={saving}
      />

      {/* Potvrda brisanja */}
      <Modal
        isOpen={!!deleteCat}
        onClose={() => setDeleteCat(null)}
        title="Obriši kategoriju"
      >
        <p className="text-sm text-gray-600 mb-2">
          Da li si siguran da želiš da obrišeš kategoriju{" "}
          <strong>{deleteCat?.name}</strong>?
        </p>
        <p className="text-sm text-amber-600 mb-6">
          Kategorija se ne može obrisati ako ima transakcije vezane za nju.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteCat(null)} className="flex-1">
            Otkaži
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting} className="flex-1">
            Obriši
          </Button>
        </div>
      </Modal>
    </div>
  );
}
