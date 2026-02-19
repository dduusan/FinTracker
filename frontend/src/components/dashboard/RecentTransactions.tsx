import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { RecentTransaction } from "../../api/dashboard";
import { formatCurrency, formatDate } from "../../lib/utils";

interface Props {
  data: RecentTransaction[];
}

export default function RecentTransactions({ data }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Poslednje transakcije
      </h3>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Nema transakcija za prikaz
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    tx.type === "income" ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  {tx.type === "income" ? (
                    <ArrowUpRight size={16} className="text-green-600" />
                  ) : (
                    <ArrowDownLeft size={16} className="text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {tx.category_icon} {tx.category_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {tx.description ? tx.description : formatDate(tx.date)}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  tx.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {tx.type === "income" ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
