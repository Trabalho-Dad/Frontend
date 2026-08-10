import { loadPublicFigures } from "../api/figures.js";
import { loadPublicCategories } from "../api/categories.js";
import { updateNavbar } from "../utils/header-update.js";
import { loading } from "../components/loading.js";

const grid = document.getElementById("catalog-grid");
const count = document.getElementById("products-count");
const clearFiltersBtn = document.getElementById("clear-filters-btn");
const categoriesList = document.getElementById("categories-list");

let activeCategory = "";

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
    applyFilter();
  });

  fragment.appendChild(allButton);

  categories.forEach(category => {
    const button = document.createElement("button");
    button.className = "tag-btn";
    button.dataset.category = category.name;
    button.textContent = category.name;
    button.dataset.id = category.id;

    button.addEventListener("click", () => {
      setActiveButton(button);
      applyFilter(category.id);
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
    empty.textContent = "Nenhum produto encontrado nessa categoria.";

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
    favIcon.alt = "favorites";

    favButton.appendChild(favIcon);

    const image = document.createElement("img");
    image.className = "card-img";
    image.src = product.mainImage.url ?? "";
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
    price.textContent = `R$ ${Number(product.price).toFixed(2).replace(".", ",")}`;

    const buyButton = document.createElement("a");
    buyButton.className = "btn-buy";
    buyButton.href = `./VerMais.html?id=${product.id}`

    const buyIcon = document.createElement("img");
    buyIcon.src = "./assets/icons/comprar.svg";
    buyIcon.alt = "comprar";

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

async function applyFilter(categoryId) {
  loading.show()
  const filtered = await loadPublicFigures(categoryId)

  renderFigures(filtered.figures);
  loading.hide()
}

function setActiveButton(clickedBtn) {
  const tagButtons = document.querySelectorAll(".tag-btn");
  tagButtons.forEach(btn => btn.classList.remove("active"));
  clickedBtn.classList.add("active");
}

if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", () => {
    activeCategory = "";
    const todosBtn = document.querySelector('.tag-btn');
    if (todosBtn) setActiveButton(todosBtn);
    applyFilter();
  });
}

async function main() {
  loading.show();

  const responses = await Promise.all([
    loadPublicFigures(),
    loadPublicCategories(),
    updateNavbar()
  ])

  renderFigures(responses[0].figures);
  renderCategories(responses[1])

  loading.hide()
}

updateNavbar();
main();