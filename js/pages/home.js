import { updateNavbar } from "../utils/header-update.js";
import { isFavorite, setFavoriteButtonState, toggleFavorite } from "../utils/favorites.js";
import { loading } from "../components/loading.js";

function slugify(value) {
  return value.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function parsePrice(value) {
  return Number(value.replace("R$", "").trim().replace(/\./g, "").replace(",", "."));
}

document.querySelectorAll(".home-highlights .figure-card").forEach((card, index) => {
  const name = card.querySelector(".card-title").textContent.trim();
  const id = `home-${slugify(name)}-${index}`;
  const product = {
    id,
    name,
    category: card.querySelector(".card-category")?.textContent.trim() ?? "Colecionável",
    price: parsePrice(card.querySelector(".card-price").textContent),
    image: card.querySelector(".card-img")?.src ?? "",
    detailUrl: `verMais.html?product=${encodeURIComponent(id)}`
  };

  const favoriteButton = card.querySelector(".card-fav-btn");
  setFavoriteButtonState(favoriteButton, isFavorite(product.id));
  favoriteButton.addEventListener("click", event => {
    event.stopPropagation();
    setFavoriteButtonState(favoriteButton, toggleFavorite(product));
  });

  const buyButton = card.querySelector(".btn-buy");
  buyButton.addEventListener("click", () => {
    window.location.href = product.detailUrl;
  });
});

async function main() {
  loading.show();
  await updateNavbar();

  loading.hide();
}

main();
