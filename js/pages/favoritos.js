import { getFavorites, setFavoriteButtonState, toggleFavorite } from "../utils/favorites.js";
import { updateNavbar } from "../utils/header-update.js";
import { requireLogin } from "../utils/auth-guard.js";
import { showError } from "../utils/error.js";
import { loading } from "../components/loading.js";

const grid = document.getElementById("favorites-grid");
const count = document.querySelector(".products-count");

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function createFavoriteCard(product) {
  const figureId = product.figureId ?? String(product.id ?? "").replace(/^api-/, "");
  const figureUrl = figureId ? `figure.html?id=${encodeURIComponent(figureId)}` : "catalogo.html";
  const card = document.createElement("article");
  card.className = "figure-card";

  const favoriteButton = document.createElement("button");
  favoriteButton.className = "card-fav-btn";
  favoriteButton.type = "button";
  setFavoriteButtonState(favoriteButton, true);

  const imageLink = document.createElement("a");
  imageLink.className = "card-image-wrapper";
  imageLink.href = figureUrl;

  const image = document.createElement("img");
  image.className = "card-img";
  image.src = product.image || "assets/images/placeholder.png";
  image.alt = product.name;
  imageLink.appendChild(image);

  const category = document.createElement("p");
  category.className = "card-category";
  category.textContent = product.category ?? "Colecionável";

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = product.name;

  const footer = document.createElement("div");
  footer.className = "card-footer";

  const price = document.createElement("p");
  price.className = "card-price";
  price.textContent = formatPrice(product.price);

  const buyButton = document.createElement("button");
  buyButton.className = "btn-buy";
  buyButton.type = "button";
  buyButton.textContent = "Comprar";
  buyButton.addEventListener("click", async () => {
    if (!await requireLogin()) return;
    window.location.href = figureUrl;
  });

  favoriteButton.addEventListener("click", async () => {
    if (!await requireLogin()) return;
    toggleFavorite(product);
    renderFavorites();
  });

  footer.append(price, buyButton);
  card.append(favoriteButton, imageLink, category, title, footer);
  return card;
}

function renderFavorites() {
  const favorites = getFavorites();
  grid.replaceChildren();
  count.textContent = `${favorites.length} ${favorites.length === 1 ? "produto encontrado" : "produtos encontrados"}`;

  if (favorites.length === 0) {
    const empty = document.createElement("p");
    empty.className = "favorites-empty";
    empty.textContent = "Você ainda não adicionou nenhum produto aos favoritos.";
    grid.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  favorites.forEach(product => fragment.appendChild(createFavoriteCard(product)));
  grid.appendChild(fragment);
}

async function main(){
  try{
    loading.show()

    await renderFavorites();
    await updateNavbar();
  } catch (error){
    showError(error)
  } finally {
    loading.hide()
  }
}

main();