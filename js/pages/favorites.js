import { getFavoritesByUser } from "./../api/favorites.js";
import { findById } from "./../api/figures.js";
import { loading } from "./../components/loading.js";
import { updateNavbar } from "./../utils/header-update.js";
import { getMyUser } from "./../api/profile.js";
import { showError } from "../utils/error.js";

const grid = document.getElementById("favorites-grid");
const count = document.getElementById("products-count");
const empty = document.getElementById("products-count");

function renderFigures(list) {
  grid.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    return;
  } else {
    empty.textContent=""
  }

  const fragment = document.createDocumentFragment();

  list.forEach(product => {
    const card = document.createElement("article");
    card.className = "figure-card";

    const favButton = document.createElement("button");
    favButton.className = "card-fav-btn";
    favButton.title = "Remover dos favoritos";
    favButton.textContent = "❤";
    favButton.dataset.id = product.id;

    const imageWrapper = document.createElement("div");
    imageWrapper.className = "card-image-wrapper";

    const image = document.createElement("img");
    image.className = "card-img";
    image.src = product.images?.[0]?.url ?? "";
    image.alt = product.name;

    imageWrapper.appendChild(image);

    const category = document.createElement("p");
    category.className = "card-category";
    category.textContent = product.category;

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = product.name;

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const price = document.createElement("p");
    price.className = "card-price";
    price.innerHTML = `<span>R$</span> ${Number(product.price).toFixed(2).replace(".", ",")}`;

    const buyButton = document.createElement("a");
    buyButton.className = "btn-buy";
    buyButton.href = `./figure.html?id=${product.id}`;
    buyButton.textContent = "🛒 Comprar";

    footer.appendChild(price);
    footer.appendChild(buyButton);

    card.appendChild(favButton);
    card.appendChild(imageWrapper);
    card.appendChild(category);
    card.appendChild(title);
    card.appendChild(footer);

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);

  if (count) {
    count.textContent = `${list.length} produto${list.length === 1 ? "" : "s"} encontrado${list.length === 1 ? "" : "s"}`;
  }
}

async function main() {
  loading.show();

  try{
    const userId = await getMyUser();

    if (!userId) {
      renderFigures([]);
      count.textContent = "Nenhum produto favoritado foi encontrado.";
      loading.hide();
      return;
    }

    const favorites = await getFavoritesByUser(userId);

    const figures = await Promise.all(
      (favorites ?? []).map(fav => findById(fav.figure_id ?? fav.figureId))
    );

    renderFigures(figures.filter(Boolean));
  } catch (error){
    if (error.message === "LOGIN_REQUIRED") {
      sessionStorage.setItem(
        "redirectAfterLogin",
        window.location.href
      );

      window.location.href = "./pages/auth/login.html";
      return;
    }

    showError(error.message);
  }

  loading.hide();
}

updateNavbar();
main();