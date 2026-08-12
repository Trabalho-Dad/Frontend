import { apiFetch } from "./config.js";

export async function findHomeKpisAdmin() {
  return apiFetch("/api/admin/home/kpis");
}