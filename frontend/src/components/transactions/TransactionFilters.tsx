import type { Category } from "../../api/categories";
import type { TransactionFilters } from "../../api/transactions";

interface Props {
  filters: TransactionFilters;
  categories: Category[];
  onChange: (filters: TransactionFilters) => void;
  onReset: () => void;
}

export default function TransactionFilters({ filters, categories, onChange, onReset }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-end">
      {/* Tip */}
      <div className="flex flex-col gap-1 min-w-32">
        <label className="text-xs font-medium text-gray-500">Tip</label>
        <select
          value={filters.type ?? ""}
          onChange={(e) => onChange({ ...filters, type: e.target.value as "income" | "expense" | "", page: 1 })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Svi</option>
          <option value="income">Prihodi</option>
          <option value="expense">Rashodi</option>
        </select>
      </div>

      {/* Kategorija */}
      <div className="flex flex-col gap-1 min-w-40">
        <label className="text-xs font-medium text-gray-500">Kategorija</label>
        <select
          value={filters.category_id ?? ""}
          onChange={(e) => onChange({ ...filters, category_id: e.target.value ? Number(e.target.value) : "", page: 1 })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Sve kategorije</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Od datuma */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Od</label>
        <input
          type="date"
          value={filters.date_from ?? ""}
          onChange={(e) => onChange({ ...filters, date_from: e.target.value, page: 1 })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Do datuma */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Do</label>
        <input
          type="date"
          value={filters.date_to ?? ""}
          onChange={(e) => onChange({ ...filters, date_to: e.target.value, page: 1 })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Resetuj
      </button>
    </div>
  );
}
