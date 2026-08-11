import { apiFetch } from "./config.js";

export async function loadPublicFigures(categoryId, name, page, take) {
  return apiFetch("/api/figures", {
    query: { active: true, categoryId, name, page, take }
  });
}

export async function findById(id) {
  return apiFetch(`/api/figures/${id}`);
}

export async function findManyFiguresAdmin({ name, active, categoryId, page = 1, take = 20 } = {}) {
  return apiFetch("/api/admin/figures", { query: { name, active, categoryId, page, take } });
}

export async function findFigureByIdAdmin(id) {
  return apiFetch(`/api/admin/figures/${id}`);
}

export async function createFigure({ name, description, price, quantity, active, characterId, accessoryIds, categoryIds, imageIds, images }) {
  return apiFetch("/api/admin/figures", {
    method: "POST",
    body: { name, description, price, quantity, active, characterId, accessoryIds, categoryIds, imageIds, images }
  });
}

export async function increaseFigureQuantity(id, quantity) {
  return apiFetch(`/api/admin/figures/${id}/quantity/increase/${quantity}`, { method: "PATCH" });
}

export async function decreaseFigureQuantity(id, quantity) {
  return apiFetch(`/api/admin/figures/${id}/quantity/decrease/${quantity}`, { method: "PATCH" });
}
