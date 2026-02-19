import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyItem } from "../../api/dashboard";
import { formatCurrency } from "../../lib/utils";

interface Props {
  data: MonthlyItem[];
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun",
                  "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];
  return `${months[parseInt(m) - 1]} ${year}`;
}

export default function MonthlyChart({ data }: Props) {
  const chartData = data.map((item) => ({
    ...item,
    month: formatMonth(item.month),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Mesečni trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend />
          <Bar dataKey="income" name="Prihodi" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Rashodi" fill="#f87171" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
