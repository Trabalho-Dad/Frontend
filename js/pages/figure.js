import { findById } from "../api/figures.js";
import { loading } from "../components/loading.js";
import { showError, hideError } from "../utils/error.js";
import { updateNavbar } from "../utils/header-update.js";
import { formatPrice } from "../utils/formatters.js";
import { getCart, saveCart } from "../utils/cart.js";
import { requireLogin } from "../utils/auth-guard.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const addToCartButton = document.getElementById("btn-add-cart");
const buyNowButton = document.getElementById("btn-buy-now");
const buyingQuantity = document.getElementById("quantity");
const priceElement = document.getElementById("product-price");
let price;
let currentProduct;

function renderProduct(product) {
  currentProduct = product;
  document.getElementById("product-title").textContent = product.name;

  document.getElementById("product-title").textContent = product.name;

  document.getElementById("product-category").textContent =
    product.category ?? "COLECIONÁVEL";

  document.getElementById("product-category").textContent =
    product.category ?? "Colecionável";

  price = product.price;

  document.getElementById("product-price").textContent =
    formatPrice(product.price);

  document.getElementById("product-description").textContent =
    product.description ?? "Sem descrição disponível.";

  const mainImage = document.getElementById("main-product-img");

  mainImage.src = product.mainImage?.url ?? "./assets/images/placeholder.png";
  mainImage.alt = product.mainImage?.description ?? product.name;

  renderThumbnails(product.images ?? [], product.mainImage);
}

function imageButtton(image, index){
  const button = document.createElement("button");
  button.className = "thumb";

  if (index === 0) {
    button.classList.add("active");
  }

  const img = document.createElement("img");
  img.src = image.url;
  img.alt = image.description;

  button.appendChild(img);

  button.addEventListener("click", () => {
    document.getElementById("main-product-img").src = image.url;

    document
      .querySelectorAll(".thumb")
      .forEach(t => t.classList.remove("active"));

    button.classList.add("active");
  });

  return button;
}

function renderThumbnails(images, mainImage) {
  const container = document.getElementById("thumbnails-row");

  container.replaceChildren();

  images.forEach((image, index) => {
    const button = imageButtton(image, index);  

    container.appendChild(button);
  });

  container.appendChild(imageButtton(mainImage, images.length))
}

function setupQuantity(figureQuantity) {
  const quantity = document.getElementById("quantity");
  const minus = document.getElementById("qty-minus");
  const plus = document.getElementById("qty-plus");

  plus.addEventListener("click", () => {
    if (Number(quantity.textContent) < figureQuantity) {
      quantity.textContent = Number(quantity.textContent) + 1;
      priceElement.textContent = formatPrice(Number(quantity.textContent) * price);
    }
  });

  minus.addEventListener("click", () => {
    if (Number(quantity.textContent) > 1) {
      quantity.textContent = Number(quantity.textContent) - 1;
      priceElement.textContent = formatPrice(Number(quantity.textContent) * price);
    }
  });
}


async function main() {
  loading.show();

  try {
    hideError();

    if (!id) {
      showError("Produto não encontrado.");
      return;
    }

    await updateNavbar();

    const responses = await Promise.all([
      findById(id),
    ]);

    renderProduct(responses[0]);

    setupQuantity(responses[0].quantity);
  } catch (error) {
    showError(error.message)
  } finally {
    loading.hide()
  }
}

addToCartButton.addEventListener("click", async () => {
  try {
    if (!await requireLogin()) return;
    loading.show();

    const quantity = Number(buyingQuantity.textContent) || 1;
    const cart = getCart();
    const existing = cart.find(item => String(item.id) === String(id));

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id,
        name: currentProduct.name,
        category: currentProduct.category ?? "Colecionável",
        price: Number(currentProduct.price),
        image: currentProduct.mainImage?.url ?? "",
        quantity,
      });
    }

    saveCart(cart);
    const originalText = addToCartButton.textContent;
    addToCartButton.textContent = "Adicionado!";
    window.setTimeout(() => {
      addToCartButton.textContent = originalText;
    }, 1200);
  } catch (error) {
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

buyNowButton.addEventListener("click", () => {
  handleBuyNow();
});

async function handleBuyNow() {
  if (!await requireLogin()) return;

  const quantity = Number(buyingQuantity.textContent) || 1;
  const cart = getCart();
  const existing = cart.find(item => String(item.id) === String(id));

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id,
      name: currentProduct.name,
      category: currentProduct.category ?? "Colecionável",
      price: Number(currentProduct.price),
      image: currentProduct.mainImage?.url ?? "",
      quantity,
    });
  }

  saveCart(cart);
  window.location.href = "checkout.html";
}

main();
