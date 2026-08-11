import { getCartQuantity } from "./cart.js";

function updateCartBadges() {
  const quantity = getCartQuantity();

  document.querySelectorAll(".cart-btn .badge, #cart-count").forEach(badge => {
    badge.textContent = String(quantity);
    badge.hidden = quantity === 0;
  });
}

updateCartBadges();
window.addEventListener("storage", updateCartBadges);
window.addEventListener("astra:cart-updated", updateCartBadges);
