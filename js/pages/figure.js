import { findById, loadPublicFigures } from "../api/figures.js";
import { loading } from "../components/loading.js";
import { showError, hideError } from "../utils/error.js";
import { updateNavbar } from "../utils/header-update.js";
import { formatPrice } from "../utils/formatters.js";
import { requireLogin } from "../utils/auth-guard.js";
import { addFigureToOrder } from "../api/order.js";

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
    product.categories[0].name ?? "COLECIONÁVEL";

  document.getElementById("product-category").textContent =
    product.categories[0].name ?? "Colecionável";

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


function renderRelatedProducts(products) {
  const grid = document.querySelector(".verMais-grid");
  
  if (!grid) return;
  
  grid.replaceChildren();
  
  if (!Array.isArray(products) || products.length === 0) {
    const empty = document.createElement("p");
    empty.className = "catalog-empty";
    empty.textContent = "Nenhum produto relacionado encontrado.";
    grid.appendChild(empty);
    return;
  }
  
  const fragment = document.createDocumentFragment();
  
  products.forEach(product => {
    const card = document.createElement("article");
    card.className = "figure-card";
    
    const favBtn = document.createElement("button");
    favBtn.className = "card-fav-btn";
    favBtn.textContent = "❤";
    
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "card-image-wrapper";
    
    const img = document.createElement("img");
    img.src = product.mainImage?.url ?? './assets/images/placeholder.png';
    img.alt = product.name;
    img.className = "card-img";
    
    imageWrapper.appendChild(favBtn);
    imageWrapper.appendChild(img);
    
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
    
    const priceSpan = document.createElement("span");
    priceSpan.textContent = "R$";
    price.appendChild(priceSpan);
    price.appendChild(document.createTextNode(" " + formatPrice(product.price)));
    
    const buyBtn = document.createElement("button");
    buyBtn.className = "btn-buy";
    buyBtn.textContent = "🛒 Comprar";
    buyBtn.addEventListener("click", () => {
      window.location.href = `verMais.html?id=${product.id}`;
    });
    
    footer.appendChild(price);
    footer.appendChild(buyBtn);
    
    card.appendChild(imageWrapper);
    card.appendChild(category);
    card.appendChild(title);
    card.appendChild(footer);
    
    fragment.appendChild(card);
  });
  
  grid.appendChild(fragment);
}

async function loadRelatedProducts(category, currentProductId) {
  try {
    const response = await loadPublicFigures(category.id);

    const filtered = response.figures.filter(p => p.id != currentProductId).slice(0, 4);
    
    renderRelatedProducts(filtered);
  } catch (error) {
    showError(error);
  }
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

    const product = await findById(id);

    const responses = await Promise.all([
      Promise.resolve(product),
      loadRelatedProducts(product.categories[0], product.id)
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

    await addFigureToOrder(id, quantity)

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

  await addFigureToOrder(id, quantity)
  
  window.location.href = "checkout.html";
}

main();