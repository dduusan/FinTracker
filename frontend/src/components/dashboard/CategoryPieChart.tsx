import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CategorySpending } from "../../api/dashboard";
import { getByCategory } from "../../api/dashboard";
import { formatCurrency } from "../../lib/utils";

const COLORS = [
  "#4f46e5", "#f87171", "#34d399", "#fbbf24",
  "#60a5fa", "#a78bfa", "#fb923c", "#2dd4bf",
];

interface Props {
  initialData: CategorySpending[];
  initialTotal: number;
}

export default function CategoryPieChart({ initialData, initialTotal }: Props) {
  const [activeType, setActiveType] = useState<"expense" | "income">("expense");
  const [data, setData] = useState<CategorySpending[]>(initialData);
  const [grandTotal, setGrandTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeType === "expense") {
      setData(initialData);
      setGrandTotal(initialTotal);
      return;
    }

    setLoading(true);
    getByCategory({ type: "income" })
      .then((res) => {
        setData(res.data);
        setGrandTotal(res.grand_total);
      })
      .finally(() => setLoading(false));
  }, [activeType, initialData, initialTotal]);

  const chartData = data.map((item, i) => ({
    name: `${item.icon ?? ""} ${item.category_name}`.trim(),
    value: item.total,
    percentage: item.percentage,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Po kategorijama</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveType("expense")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeType === "expense"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Rashodi
          </button>
          <button
            onClick={() => setActiveType("income")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeType === "income"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            Prihodi
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Nema podataka za prikaz
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-sm text-gray-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-sm text-gray-500 mt-2">
            Ukupno: <span className="font-semibold text-gray-900">{formatCurrency(grandTotal)}</span>
          </p>
        </>
      )}
    </div>
  );
}
