import { loadPublicFigures } from "../api/figures.js";
import { loadPublicCategories } from "../api/categories.js";
import { updateNavbar } from "../utils/header-update.js";
import { loading } from "../components/loading.js";
import { requireLogin } from "../utils/auth-guard.js";
import { isFavorite, setFavoriteButtonState, toggleFavorite } from "../utils/favorites.js";

const grid = document.getElementById("catalog-grid");
const clearFiltersBtn = document.getElementById("clear-filters-btn");
const categoriesList = document.getElementById("categories-list");
const searchInput = document.getElementById("catalog-search-input");
const pagination = document.getElementById("pagination");

let activeCategory = "";
let searchTerm = "";
let currentPage = 1;
let totalPages = 1;

let searchDebounceTimer = null;

const ITEMS_PER_PAGE = 6;

function renderCategories(categories) {
  categoriesList.innerHTML = "";

  const fragment = document.createDocumentFragment();

  const allButton = document.createElement("button");
  allButton.className = "tag-btn active";
  allButton.dataset.category = "";
  allButton.textContent = "Todos";

  allButton.addEventListener("click", () => {
    activeCategory = "";

    setActiveButton(allButton);

    currentPage = 1;

    fetchFigures();
  });

  fragment.appendChild(allButton);

  categories.forEach(category => {
    const button = document.createElement("button");

    button.className = "tag-btn";
    button.dataset.category = category.name;
    button.textContent = category.name;
    button.dataset.id = category.id;

    button.addEventListener("click", () => {
      activeCategory = category.id;

      setActiveButton(button);

      currentPage = 1;

      fetchFigures();
    });

    fragment.appendChild(button);
  });

  categoriesList.appendChild(fragment);
}

function renderFigures(list) {
  grid.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    const empty = document.createElement("p");

    empty.className = "catalog-empty";
    empty.textContent = "Nenhum produto encontrado.";

    grid.appendChild(empty);

    return;
  }

  const fragment = document.createDocumentFragment();

  list.forEach(product => {
    const card = document.createElement("div");
    card.className = "figure-card";

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "card-image-wrapper";

    const favButton = document.createElement("button");
    favButton.className = "card-fav-btn";
    favButton.title = "Favoritar";

    const favIcon = document.createElement("img");
    favIcon.src = "./assets/icons/favorito.svg";
    favIcon.alt = "Favoritar";

    favButton.appendChild(favIcon);

    const image = document.createElement("img");
    image.className = "card-img";
    image.src = product?.mainImage?.url ?? "";
    image.alt = product.name;

    imageWrapper.appendChild(favButton);
    imageWrapper.appendChild(image);

    const info = document.createElement("div");
    info.className = "card-info";

    const category = document.createElement("span");
    category.className = "card-category";
    category.textContent = product.category;

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = product.name;

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const price = document.createElement("span");
    price.className = "card-price";

    price.textContent =
      `R$ ${Number(product.price).toFixed(2).replace(".", ",")}`;

    const buyButton = document.createElement("a");
    buyButton.className = "btn-buy";
    buyButton.href = `./figure.html?id=${product.id}`;

    const buyIcon = document.createElement("img");
    buyIcon.src = "./assets/icons/comprar.svg";
    buyIcon.alt = "Comprar";

    buyButton.appendChild(buyIcon);
    buyButton.append(" Comprar");

    const favoriteProduct = {
      id: product.id,
      figureId: product.id,
      name: product.name,
      category: product.category ?? "Colecionável",
      price: Number(product.price),
      image: product?.mainImage?.url ?? "",
    };

    setFavoriteButtonState(favButton, isFavorite(product.id));
    favButton.addEventListener("click", async event => {
      event.stopPropagation();
      if (!await requireLogin()) return;
      setFavoriteButtonState(favButton, toggleFavorite(favoriteProduct));
    });

    buyButton.addEventListener("click", async event => {
      event.preventDefault();
      if (!await requireLogin()) return;
      window.location.href = buyButton.href;
    });

    footer.appendChild(price);
    footer.appendChild(buyButton);

    info.appendChild(category);
    info.appendChild(title);
    info.appendChild(footer);

    card.appendChild(imageWrapper);
    card.appendChild(info);

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

function renderPagination() {
  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  const previousButton = document.createElement("button");

  previousButton.className = "pagination-arrow";
  previousButton.textContent = "‹";
  previousButton.title = "Página anterior";

  previousButton.disabled = currentPage === 1;

  previousButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;

      fetchFigures();
    }
  });

  pagination.appendChild(previousButton);

  for (let page = 1; page <= totalPages; page++) {
    const pageButton = document.createElement("button");

    pageButton.textContent = page;

    if (page === currentPage) {
      pageButton.classList.add("active");
    }

    pageButton.addEventListener("click", () => {
      currentPage = page;

      fetchFigures();
    });

    pagination.appendChild(pageButton);
  }

  const nextButton = document.createElement("button");

  nextButton.className = "pagination-arrow";
  nextButton.textContent = "›";
  nextButton.title = "Próxima página";

  nextButton.disabled = currentPage === totalPages;

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;

      fetchFigures();
    }
  });

  pagination.appendChild(nextButton);
}

async function fetchFigures() {
  try {
    loading.show();

    const response = await loadPublicFigures(
      activeCategory || undefined,
      searchTerm || undefined,
      currentPage,
      ITEMS_PER_PAGE
    );

    const figures = response.figures ?? [];

    totalPages = Math.max(1, response.totalPages ?? 1);

    if (currentPage > totalPages) {
      currentPage = totalPages;

      return fetchFigures();
    }

    renderFigures(figures);
    renderPagination();

  } catch (error) {
    console.error("Erro ao carregar catálogo:", error);

    grid.innerHTML = "";

    const errorMessage = document.createElement("p");

    errorMessage.className = "catalog-empty";
    errorMessage.textContent =
      "Não foi possível carregar os produtos.";

    grid.appendChild(errorMessage);

    pagination.innerHTML = "";

  } finally {
    loading.hide();
  }
}

function setActiveButton(clickedBtn) {
  const tagButtons = document.querySelectorAll(".tag-btn");

  tagButtons.forEach(btn => {
    btn.classList.remove("active");
  });

  clickedBtn.classList.add("active");
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounceTimer);

    searchDebounceTimer = setTimeout(() => {
      searchTerm = searchInput.value.trim();
      currentPage = 1;

      fetchFigures();
    }, 400);
  });
}

if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", () => {
    activeCategory = "";
    searchTerm = "";

    if (searchInput) {
      searchInput.value = "";
    }

    const todosBtn = document.querySelector(
      '.tag-btn[data-category=""]'
    );

    if (todosBtn) {
      setActiveButton(todosBtn);
    }

    currentPage = 1;

    fetchFigures();
  });
}

async function main() {
  try {
    loading.show();

    const [categories] = await Promise.all([
      loadPublicCategories(),
      updateNavbar()
    ]);

    renderCategories(categories);

    await fetchFigures();

  } catch (error) {
    console.error("Erro ao carregar catálogo:", error);

    grid.innerHTML = "";

    const errorMessage = document.createElement("p");

    errorMessage.className = "catalog-empty";
    errorMessage.textContent =
      "Não foi possível carregar os produtos.";

    grid.appendChild(errorMessage);

  } finally {
    loading.hide();
  }
}

main();
