import { loadPublicFigures } from "../api/figures.js";
import { updateNavbar } from "../utils/header-update.js";
import { isFavorite, setFavoriteButtonState, toggleFavorite } from "../utils/favorites.js";
import { loading } from "../components/loading.js";
import { requireLogin } from "../utils/auth-guard.js";

const highlightsGrid = document.getElementById("highlights-grid");

function formatPrice(value) {
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

function createFigure(product) {
  const card = document.createElement("article");
  card.className = "figure-card";

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "card-image-wrapper";

  const favoriteButton = document.createElement("button");
  favoriteButton.className = "card-fav-btn";
  favoriteButton.type = "button";

  const image = document.createElement("img");
  image.className = "card-img";
  image.src = product.mainImage?.url ?? product.images?.[0]?.url ?? "";
  image.alt = product.mainImage?.description ?? product.name;

  imageWrapper.append(favoriteButton, image);

  const info = document.createElement("div");
  info.className = "card-info";

  const category = document.createElement("span");
  category.className = "card-category";
  category.textContent = product.category ?? "Colecionável";

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = product.name;

  const footer = document.createElement("div");
  footer.className = "card-footer";

  const price = document.createElement("span");
  price.className = "card-price";
  price.textContent = formatPrice(product.price);

  const buyButton = document.createElement("a");
  buyButton.className = "btn-buy";
  buyButton.href = `./figure.html?id=${encodeURIComponent(product.id)}`;

  const buyIcon = document.createElement("img");
  buyIcon.src = "./assets/icons/comprar.svg";
  buyIcon.alt = "";
  buyIcon.setAttribute("aria-hidden", "true");

  buyButton.append(buyIcon, " Comprar");
  footer.append(price, buyButton);
  info.append(category, title, footer);
  card.append(imageWrapper, info);

  const favoriteProduct = {
    id: product.id,
    name: product.name,
    category: product.category ?? "Colecionável",
    price: Number(product.price),
    image: image.src,
    detailUrl: buyButton.href
  };

  setFavoriteButtonState(favoriteButton, isFavorite(product.id));
  favoriteButton.addEventListener("click", async event => {
    event.stopPropagation();
    if (!await requireLogin()) return;
    setFavoriteButtonState(
      favoriteButton,
      toggleFavorite(favoriteProduct)
    );
  });

  buyButton.addEventListener("click", async event => {
    event.preventDefault();
    if (!await requireLogin()) return;
    window.location.href = buyButton.href;
  });

  return card;
}

function renderHighlights(figures) {
  highlightsGrid.innerHTML = "";

  if (!Array.isArray(figures) || figures.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Nenhum destaque disponível no momento.";
    highlightsGrid.appendChild(emptyMessage);
    return;
  }

  const fragment = document.createDocumentFragment();

  figures.forEach(figure => {
    fragment.appendChild(createFigure(figure));
  });

  highlightsGrid.appendChild(fragment);
}

async function loadHighlights() {
  const response = await loadPublicFigures(undefined, undefined, 1, 6);
  renderHighlights(response?.figures ?? []);
}

async function main() {
  loading.show();

  try {
    await Promise.all([
      updateNavbar(),
      loadHighlights()
    ]);
  } catch (error) {
    console.error("Erro ao carregar destaques:", error);
    highlightsGrid.innerHTML = "";

    const errorMessage = document.createElement("p");
    errorMessage.textContent = "Não foi possível carregar os destaques.";
    highlightsGrid.appendChild(errorMessage);
  } finally {
    loading.hide();
  }
}

main();
