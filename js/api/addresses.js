import { apiFetch } from "./config.js";

export async function findMyAddresses() {
  return apiFetch("/api/addresses");
}

export async function createAddress({ cep, state, city, neighborhood, street, number, complement }) {
  return apiFetch("/api/addresses", {
    method: "POST",
    body: { cep, state, city, neighborhood, street, number, complement }
  });
}

export async function updateAddress(id, { cep, state, city, neighborhood, street, number, complement }) {
  return apiFetch(`/api/addresses/${id}`, {
    method: "PUT",
    body: { cep, state, city, neighborhood, street, number, complement }
  });
}

export async function deleteAddress(id) {
  return apiFetch(`/api/addresses/${id}`, { method: "DELETE" });
}
