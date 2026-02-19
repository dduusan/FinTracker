import { useDashboard } from "../hooks/useDashboard";
import SummaryCards from "../components/dashboard/SummaryCards";
import MonthlyChart from "../components/dashboard/MonthlyChart";
import CategoryPieChart from "../components/dashboard/CategoryPieChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";

export default function DashboardPage() {
  const { summary, monthly, byCategory, grandTotal, recent, loading, error } =
    useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Pregled</h2>

      {/* Summary kartice */}
      {summary && <SummaryCards data={summary} />}

      {/* Grafikoni */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MonthlyChart data={monthly} />
        <CategoryPieChart data={byCategory} grandTotal={grandTotal} />
      </div>

      {/* Poslednje transakcije */}
      <RecentTransactions data={recent} />
    </div>
  );
}
