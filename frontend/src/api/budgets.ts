import api from "./axios";

export interface Budget {
  id: number;
  category_id: number;
  amount: number;
  month: string;
}

export interface BudgetCreate {
  category_id: number;
  amount: number;
  month: string;
}

export interface BudgetUpdate {
  amount?: number;
  month?: string;
}

export interface BudgetSummaryItem {
  id: number;
  category_id: number;
  category_name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  month: string;
}

export async function getBudgets(month?: string): Promise<Budget[]> {
  const response = await api.get<Budget[]>("/budgets/", {
    params: month ? { month } : undefined,
  });
  return response.data;
}

export async function getBudgetSummary(month: string): Promise<BudgetSummaryItem[]> {
  const response = await api.get<BudgetSummaryItem[]>("/budgets/summary", {
    params: { month },
  });
  return response.data;
}

export async function createBudget(data: BudgetCreate): Promise<Budget> {
  const response = await api.post<Budget>("/budgets/", data);
  return response.data;
}

export async function updateBudget(id: number, data: BudgetUpdate): Promise<Budget> {
  const response = await api.put<Budget>(`/budgets/${id}`, data);
  return response.data;
}

export async function deleteBudget(id: number): Promise<void> {
  await api.delete(`/budgets/${id}`);
}
