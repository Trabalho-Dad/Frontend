import { apiFetch } from "./config.js";

export async function loadPublicCategories() {
  return apiFetch("/api/categories/find-all");
}

export async function findManyCategoriesAdmin({ name, active, page = 1, take = 20 } = {}) {
  return apiFetch("/api/admin/categories", { query: { name, active, page, take } });
}

export async function findCategoryByIdAdmin(id) {
  return apiFetch(`/api/admin/categories/${id}`);
}

export async function createCategory({ name, description, active }) {
  return apiFetch("/api/admin/categories", {
    method: "POST",
    body: { name, description, active }
  });
}

export async function updateCategory(id, { name, description, active }) {
  return apiFetch(`/api/admin/categories/${id}`, {
    method: "PUT",
    body: { name, description, active }
  });
}

export async function toggleCategoryStatus(id) {
  return apiFetch(`/api/admin/categories/${id}/status`, { method: "PATCH" });
}
