import { Pencil, Trash2 } from "lucide-react";
import type { BudgetSummaryItem } from "../../api/budgets";
import { formatCurrency } from "../../lib/utils";

interface Props {
  item: BudgetSummaryItem;
  onEdit: (item: BudgetSummaryItem) => void;
  onDelete: (item: BudgetSummaryItem) => void;
}

export default function BudgetCard({ item, onEdit, onDelete }: Props) {
  const percentage = item.budgeted > 0
    ? Math.min(Math.round((item.spent / item.budgeted) * 100), 100)
    : 0;

  const isOverBudget = item.spent > item.budgeted;
  const overAmount = isOverBudget ? item.spent - item.budgeted : 0;

  // Boja progress bara
  let barColor = "bg-green-500";
  if (percentage >= 90) barColor = "bg-red-500";
  else if (percentage >= 70) barColor = "bg-amber-500";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{item.category_name}</h4>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Izmeni"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Obriši"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Iznosi */}
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-gray-600">
          Potrošeno: <span className="font-medium text-gray-900">{formatCurrency(item.spent)}</span>
        </span>
        <span className="text-gray-500">
          od {formatCurrency(item.budgeted)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${isOverBudget ? "text-red-600" : "text-gray-500"}`}>
          {percentage}%
        </span>
        {isOverBudget ? (
          <span className="text-red-600 font-medium">
            Prekoračenje: {formatCurrency(overAmount)}
          </span>
        ) : (
          <span className="text-green-600">
            Preostalo: {formatCurrency(item.remaining)}
          </span>
        )}
      </div>
    </div>
  );
}
