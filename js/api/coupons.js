import { apiFetch } from "./config.js";

export async function findManyCouponsAdmin({ code, active, page = 1, take = 20 } = {}) {
  return apiFetch("/api/admin/coupons", { query: { code, active, page, take } });
}

export async function findCouponByIdAdmin(id) {
  return apiFetch(`/api/admin/coupons/${id}`);
}

export async function createCoupon({ code, discountPct, usageLimit, startDate, endDate }) {
  return apiFetch("/api/admin/coupons", {
    method: "POST",
    body: { code, discountPct, usageLimit, startDate, endDate }
  });
}
