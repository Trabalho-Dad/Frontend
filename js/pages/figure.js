import { findById } from "../api/figures.js";
import { loading } from "../components/loading.js";
import { showError, hideError } from "../utils/error.js";
import { addFigureToOrder } from "../api/order.js";
import { updateNavbar } from "../utils/header-update.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const addToCartButton = document.getElementById("btn-add-cart");
const buyingQuantity = document.getElementById("quantity");

function renderProduct(product) {
  document.getElementById("breadcrumb-title").textContent = product.name;

  document.getElementById("product-title").textContent = product.name;

  document.getElementById("product-category").textContent =
    product.category ?? "COLECIONÁVEL";

  document.getElementById("breadcrumb-category").textContent =
    product.category ?? "Colecionável";

  document.getElementById("product-price").textContent =
    formatPrice(product.price);

  document.querySelector("#product-character span").textContent =
    product.character.name ?? "-";

  document.getElementById("product-description").innerHTML = `
    <p>${product.description ?? "Sem descrição disponível."}</p>
  `;

  const mainImage = document.getElementById("main-product-img");

  mainImage.src = product.mainImage.url ?? "assets/images/placeholder.png";
  mainImage.alt = product.mainImage.description;

  renderThumbnails(product.images ?? []);
}


function renderThumbnails(images) {
  const container = document.getElementById("thumbnails-row");

  container.innerHTML = "";

  images.forEach(image => {
    const img = document.createElement("img");

    img.src = image.url;
    img.alt = image.description;

    img.addEventListener("click", () => {
      document.getElementById("main-product-img").src = image;
    });

    container.appendChild(img);
  });
}


function formatPrice(price) {
  return Number(price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}


function setupQuantity(figureQuantity) {
  const quantity = document.getElementById("quantity");
  const minus = document.getElementById("qty-minus");
  const plus = document.getElementById("qty-plus");

  plus.addEventListener("click", () => {
    if (Number(quantity.value) < figureQuantity) {
    quantity.value = Number(quantity.value) + 1;
    }
  });

  minus.addEventListener("click", () => {
    if (Number(quantity.value) > 1) {
      quantity.value = Number(quantity.value) - 1;
    }
  });
}


async function main() {
  hideError();

  if (!id) {
    showError("Produto não encontrado.");
    return;
  }

  try {
    loading.show();

    const figure = await findById(id);

    renderProduct(figure);

    setupQuantity(figure.quantity);

  } catch (error) {
    if (error.isIntace)
    showError(error.message);
  } finally {
    loading.hide();
  }
}

addToCartButton.addEventListener("click", async() => {
  try{
    loading.show();

    await addFigureToOrder(id, Number(buyingQuantity.value));
  } catch (error){
    console.log(error)
    if (error.message === "LOGIN_REQUIRED") {
      sessionStorage.setItem(
        "redirectAfterLogin",
        window.location.href
      );

      window.location.href = "./pages/auth/login.html";
      return;
    }

    showError(error.message);
  } finally {
    loading.hide();
  }
})

updateNavbar();
main();