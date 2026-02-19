import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from "lucide-react";
import type { SummaryResponse } from "../../api/dashboard";
import { formatCurrency } from "../../lib/utils";

interface Props {
  data: SummaryResponse;
}

export default function SummaryCards({ data }: Props) {
  const cards = [
    {
      label: "Ukupni prihodi",
      value: formatCurrency(data.total_income),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Ukupni rashodi",
      value: formatCurrency(data.total_expense),
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Bilans",
      value: formatCurrency(data.balance),
      icon: Wallet,
      color: data.balance >= 0 ? "text-indigo-600" : "text-red-600",
      bg: data.balance >= 0 ? "bg-indigo-50" : "bg-red-50",
    },
    {
      label: "Broj transakcija",
      value: data.transaction_count.toString(),
      icon: ArrowLeftRight,
      color: "text-gray-600",
      bg: "bg-gray-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4"
        >
          <div className={`${card.bg} p-3 rounded-lg`}>
            <card.icon size={22} className={card.color} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
