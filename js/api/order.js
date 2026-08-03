import { apiFetch } from "./config.js";

export async function addFigureToOrder(figureId, quantity) {
  try {
    return await apiFetch("/api/orders/add-items", {
      method: "POST",
      body: { figureId, quantity }
    });
  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") throw error;
    throw new Error(error.message ?? "Erro ao adicionar boneco ao carrinho.");
  }
}

export async function removeFigureFromOrder(figureId, quantity) {
  return apiFetch("/api/orders/remove-items", {
    method: "POST",
    body: { figureId, quantity }
  });
}

export async function addCoupon(orderId, code) {
  return apiFetch("/api/orders/add-cupons", {
    method: "POST",
    body: { orderId, code }
  });
}

export async function finishOrder({ addressId, shippingCost, estimatedDeliveryTime, installmentsCount, paymentType }) {
  return apiFetch("/api/orders/finish", {
    method: "POST",
    body: { addressId, shippingCost, estimatedDeliveryTime, installmentsCount, paymentType }
  });
}

export async function cancelOrder(orderId) {
  return apiFetch(`/api/orders/cancel/${orderId}`, { method: "PATCH" });
}

export async function findMyOrders({ status, page = 1, take = 20 } = {}) {
  return apiFetch("/api/orders", { query: { status, page, take } });
}

export async function findOrderById(id) {
  return apiFetch(`/api/orders/${id}`);
}
