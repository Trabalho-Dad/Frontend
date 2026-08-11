const FAVORITES_KEY = "astra_favorites";

export function getFavorites() {
  try {
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    return Array.isArray(favorites)
      ? favorites.filter(item => item && typeof item === "object" && item.id != null)
      : [];
  } catch (_) {
    return [];
  }
}

export function isFavorite(productId) {
  return getFavorites().some(item => String(item.id) === String(productId));
}

export function toggleFavorite(product) {
  const favorites = getFavorites();
  const index = favorites.findIndex(item => String(item.id) === String(product.id));
  const active = index === -1;

  if (active) favorites.push(product);
  else favorites.splice(index, 1);

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return active;
}

export function setFavoriteButtonState(button, active) {
  button.classList.toggle("active", active);
  button.setAttribute("aria-pressed", String(active));
  button.title = active ? "Remover dos favoritos" : "Favoritar";

  const icon = document.createElement("img");
  icon.className = "favorite-icon";
  icon.src = active
    ? "./assets/icons/favorito-preenchido.svg"
    : "./assets/icons/favorito.svg";
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");

  button.replaceChildren(icon);
}
