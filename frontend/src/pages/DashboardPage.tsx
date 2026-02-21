import { useDashboard } from "../hooks/useDashboard";
import { usePageTitle } from "../hooks/usePageTitle";
import SummaryCards from "../components/dashboard/SummaryCards";
import MonthlyChart from "../components/dashboard/MonthlyChart";
import CategoryPieChart from "../components/dashboard/CategoryPieChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

export default function DashboardPage() {
  usePageTitle("Pregled");
  const { summary, monthly, byCategory, grandTotal, recent, loading, error } =
    useDashboard();

  if (loading) {
    return <DashboardSkeleton />;
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
        <CategoryPieChart initialData={byCategory} initialTotal={grandTotal} />
      </div>

      {/* Poslednje transakcije */}
      <RecentTransactions data={recent} />
    </div>
  );
}
