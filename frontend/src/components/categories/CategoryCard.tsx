import { Pencil, Trash2 } from "lucide-react";
import type { Category } from "../../api/categories";

interface Props {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryCard({ category, onEdit, onDelete }: Props) {
  const isIncome = category.type === "income";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 hover:border-gray-300 transition-colors">
      {/* Ikona */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${
          isIncome ? "bg-green-50" : "bg-red-50"
        }`}
      >
        {category.icon ?? "📂"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{category.name}</p>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            isIncome ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {isIncome ? "Prihod" : "Rashod"}
        </span>
      </div>

      {/* Akcije */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(category)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="Izmeni"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(category)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Obriši"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
