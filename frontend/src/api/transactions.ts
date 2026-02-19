import api from "./axios";

export interface Transaction {
  id: string;
  user_id: string;
  category_id: number;
  amount: number;
  type: "income" | "expense";
  description: string | null;
  date: string;
  created_at: string;
}

export interface TransactionCreate {
  amount: number;
  type: "income" | "expense";
  category_id: number;
  description?: string;
  date: string;
}

export interface TransactionUpdate {
  amount?: number;
  type?: "income" | "expense";
  category_id?: number;
  description?: string;
  date?: string;
}

export interface TransactionFilters {
  type?: "income" | "expense" | "";
  category_id?: number | "";
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

interface TransactionListResponse {
  data: Transaction[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  const params = Object.fromEntries(
    Object.entries(filters ?? {}).filter(([, v]) => v !== "" && v !== undefined)
  );
  const response = await api.get<TransactionListResponse>("/transactions/", { params });
  return response.data.data;
}

export async function createTransaction(data: TransactionCreate): Promise<Transaction> {
  const response = await api.post<Transaction>("/transactions/", data);
  return response.data;
}

export async function updateTransaction(id: string, data: TransactionUpdate): Promise<Transaction> {
  const response = await api.put<Transaction>(`/transactions/${id}`, data);
  return response.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}
