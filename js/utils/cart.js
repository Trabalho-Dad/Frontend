const CART_STORAGE_KEY = "astra_cart";

export function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(cart) ? cart : [];
  } catch (_) {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("astra:cart-updated"));
}

export function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("astra:cart-updated"));
}

export function getCartQuantity() {
  return getCart().reduce((total, item) => total + Number(item.quantity || 0), 0);
}
