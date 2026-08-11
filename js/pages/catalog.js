import { loadPublicFigures } from "../api/figures.js";
import { loadPublicCategories } from "../api/categories.js";
import { updateNavbar } from "../utils/header-update.js";
import { loading } from "../components/loading.js";

const grid = document.getElementById("catalog-grid");
const clearFiltersBtn = document.getElementById("clear-filters-btn");
const categoriesList = document.getElementById("categories-list");
const searchInput = document.getElementById("catalog-search-input");
const pagination = document.getElementById("pagination");

let activeCategory = "";
let allFigures = [];
let filteredFigures = [];

let currentPage = 1;

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

    applyFilters();
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

      applyFilters();
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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const pageItems = list.slice(startIndex, endIndex);

  const fragment = document.createDocumentFragment();

  pageItems.forEach(product => {
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

    image.src = product.mainImage?.url ?? "";
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

function renderPagination(list) {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);

  
  if (totalPages <= 1) {
    return;
  }

  // Botão "Anterior"
  const previousButton = document.createElement("button");

  previousButton.className = "pagination-arrow";
  previousButton.textContent = "‹";
  previousButton.title = "Página anterior";

  previousButton.disabled = currentPage === 1;

  previousButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;

      renderCurrentPage();
    }
  });

  pagination.appendChild(previousButton);

  // Números das páginas
  for (let page = 1; page <= totalPages; page++) {
    const pageButton = document.createElement("button");

    pageButton.textContent = page;

    if (page === currentPage) {
      pageButton.classList.add("active");
    }

    pageButton.addEventListener("click", () => {
      currentPage = page;

      renderCurrentPage();
    });

    pagination.appendChild(pageButton);
  }

  // Botão "Próxima"
  const nextButton = document.createElement("button");

  nextButton.className = "pagination-arrow";
  nextButton.textContent = "›";
  nextButton.title = "Próxima página";

  nextButton.disabled = currentPage === totalPages;

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;

      renderCurrentPage();
    }
  });

  pagination.appendChild(nextButton);
}

function renderCurrentPage() {
  renderFigures(filteredFigures);
  renderPagination(filteredFigures);
}

function applyFilters() {
  const searchTerm = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  filteredFigures = allFigures.filter(product => {

    // Filtro por categoria
    const matchesCategory =
      activeCategory === "" ||
      String(product.categoryId) === String(activeCategory) ||
      String(product.category?.id) === String(activeCategory);

    // Filtro por busca
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm) ||
      String(product.category ?? "")
        .toLowerCase()
        .includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(
    filteredFigures.length / ITEMS_PER_PAGE
  );

  // Garante que a página atual continue válida
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }

  renderCurrentPage();
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
    currentPage = 1;

    applyFilters();
  });
}

if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", () => {
    activeCategory = "";

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

    applyFilters();
  });
}

async function main() {
  try {
    loading.show();

    const responses = await Promise.all([
      loadPublicFigures(),
      loadPublicCategories(),
      updateNavbar()
    ]);

    allFigures = responses[0].figures ?? [];

    filteredFigures = [...allFigures];

    renderCategories(responses[1]);

    renderCurrentPage();

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