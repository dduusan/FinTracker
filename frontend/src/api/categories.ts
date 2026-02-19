import api from "./axios";

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  icon: string | null;
}

export interface CategoryCreate {
  name: string;
  type: "income" | "expense";
  icon?: string;
}

export interface CategoryUpdate {
  name?: string;
  type?: "income" | "expense";
  icon?: string;
}

export async function getCategories(type?: "income" | "expense"): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories/", {
    params: type ? { type } : undefined,
  });
  return response.data;
}

export async function createCategory(data: CategoryCreate): Promise<Category> {
  const response = await api.post<Category>("/categories/", data);
  return response.data;
}

export async function updateCategory(id: number, data: CategoryUpdate): Promise<Category> {
  const response = await api.put<Category>(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}
