import api from "./axios";

export interface SummaryResponse {
  total_income: number;
  total_expense: number;
  balance: number;
  transaction_count: number;
  date_from: string | null;
  date_to: string | null;
}

export interface MonthlyItem {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface MonthlyResponse {
  data: MonthlyItem[];
  months_count: number;
}

export interface CategorySpending {
  category_id: number;
  category_name: string;
  icon: string | null;
  total: number;
  percentage: number;
  transaction_count: number;
}

export interface ByCategoryResponse {
  data: CategorySpending[];
  grand_total: number;
}

export interface RecentTransaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  date: string;
  category_name: string;
  category_icon: string | null;
  created_at: string;
}

export async function getSummary(params?: {
  date_from?: string;
  date_to?: string;
}): Promise<SummaryResponse> {
  const response = await api.get<SummaryResponse>("/dashboard/summary", { params });
  return response.data;
}

export async function getMonthly(months = 6): Promise<MonthlyResponse> {
  const response = await api.get<MonthlyResponse>("/dashboard/monthly", {
    params: { months },
  });
  return response.data;
}

export async function getByCategory(params?: {
  type?: "income" | "expense";
  date_from?: string;
  date_to?: string;
}): Promise<ByCategoryResponse> {
  const response = await api.get<ByCategoryResponse>("/dashboard/by-category", { params });
  return response.data;
}

export async function getRecent(limit = 10): Promise<RecentTransaction[]> {
  const response = await api.get<RecentTransaction[]>("/dashboard/recent", {
    params: { limit },
  });
  return response.data;
}
