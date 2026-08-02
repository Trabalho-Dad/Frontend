import { apiFetch } from "./config.js";

export async function findManyCharactersAdmin({ name, active, page = 1, take = 20 } = {}) {
  return apiFetch("/api/admin/characters", { query: { name, active, page, take } });
}

export async function findCharacterByIdAdmin(id) {
  return apiFetch(`/api/admin/characters/${id}`);
}

export async function createCharacter({ name, description, active, imageIds }) {
  return apiFetch("/api/admin/characters", {
    method: "POST",
    body: { name, description, active, imageIds }
  });
}

export async function updateCharacter(id, { name, description, active }) {
  return apiFetch(`/api/admin/characters/${id}`, {
    method: "PUT",
    body: { name, description, active }
  });
}
