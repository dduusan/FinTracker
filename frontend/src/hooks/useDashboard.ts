import { useState, useEffect } from "react";
import type { SummaryResponse, MonthlyItem, CategorySpending, RecentTransaction } from "../api/dashboard";
import { getSummary, getMonthly, getByCategory, getRecent } from "../api/dashboard";

interface DashboardData {
  summary: SummaryResponse | null;
  monthly: MonthlyItem[];
  byCategory: CategorySpending[];
  grandTotal: number;
  recent: RecentTransaction[];
  loading: boolean;
  error: string | null;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    summary: null,
    monthly: [],
    byCategory: [],
    grandTotal: 0,
    recent: [],
    loading: true,
    error: null,
  });

  async function load() {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [summary, monthly, byCategory, recent] = await Promise.all([
        getSummary(),
        getMonthly(6),
        getByCategory({ type: "expense" }),
        getRecent(8),
      ]);

      setData({
        summary,
        monthly: monthly.data,
        byCategory: byCategory.data,
        grandTotal: byCategory.grand_total,
        recent,
        loading: false,
        error: null,
      });
    } catch {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Greška pri učitavanju podataka.",
      }));
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { ...data, reload: load };
}
