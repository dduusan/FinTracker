import { Pencil, Trash2 } from "lucide-react";
import type { Transaction } from "../../api/transactions";
import type { Category } from "../../api/categories";
import { formatCurrency, formatDate } from "../../lib/utils";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

export default function TransactionTable({ transactions, categories, onEdit, onDelete }: Props) {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <p className="text-gray-400">Nema transakcija za prikaz.</p>
        <p className="text-sm text-gray-300 mt-1">Dodaj prvu transakciju klikom na dugme iznad.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop tabela */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Datum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Kategorija</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Opis</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Tip</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Iznos</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const category = categoryMap[tx.category_id];
              return (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {category ? `${category.icon ?? ""} ${category.name}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-48 truncate">
                    {tx.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === "income"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tx.type === "income" ? "Prihod" : "Rashod"}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${
                      tx.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobilne kartice */}
      <div className="space-y-2 md:hidden">
        {transactions.map((tx) => {
          const category = categoryMap[tx.category_id];
          return (
            <div
              key={tx.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-800 font-medium">
                  {category ? `${category.icon ?? ""} ${category.name}` : "—"}
                </span>
                <span
                  className={`font-semibold ${
                    tx.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatDate(tx.date)}</span>
                  {tx.description && (
                    <span className="text-xs text-gray-400 truncate max-w-[150px]">
                      · {tx.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(tx)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(tx)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
