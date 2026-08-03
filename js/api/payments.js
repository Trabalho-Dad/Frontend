import { apiFetch } from "./config.js";

export async function findMyPayments({ userOrderId, paymentStatus, paymentType, page = 1, take = 20 } = {}) {
  return apiFetch("/api/payments", { query: { userOrderId, paymentStatus, paymentType, page, take } });
}

export async function payInstallment(id) {
  return apiFetch(`/api/payments/pay/${id}`, { method: "PATCH" });
}
