import { getCart, saveCart } from "../utils/cart.js";

const SHIPPING = 19.9;
const productsContainer = document.querySelector(".produtos");
const subtotalElement = document.getElementById("subtotal");
const shippingElement = document.getElementById("frete");
const totalElement = document.getElementById("total");
const checkoutLink = document.querySelector(".finalizar-container");

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function updateSummary(cart) {
  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );
  const shipping = cart.length > 0 ? SHIPPING : 0;

  subtotalElement.textContent = formatPrice(subtotal);
  shippingElement.textContent = formatPrice(shipping);
  totalElement.textContent = formatPrice(subtotal + shipping);
  checkoutLink.classList.toggle("disabled", cart.length === 0);
  checkoutLink.setAttribute("aria-disabled", String(cart.length === 0));
}

function updateQuantity(productId, change) {
  const cart = getCart();
  const item = cart.find(product => String(product.id) === String(productId));
  if (!item) return;

  item.quantity = Math.max(1, Number(item.quantity) + change);
  saveCart(cart);
  renderCart();
}

function removeProduct(productId) {
  const cart = getCart().filter(product => String(product.id) !== String(productId));
  saveCart(cart);
  renderCart();
}

function createQuantityButton(text, label, onClick) {
  const button = document.createElement("button");
  button.className = "btn-quantidade";
  button.type = "button";
  button.textContent = text;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", onClick);
  return button;
}

function createProductCard(item) {
  const product = document.createElement("article");
  product.className = "produto";

  const info = document.createElement("div");
  info.className = "produto-info";

  const image = document.createElement("img");
  image.className = "produto-imagem";
  image.src = item.image || "./assets/images/placeholder.png";
  image.alt = item.name || "Produto";

  const text = document.createElement("div");
  text.className = "produto-texto";
  const title = document.createElement("h2");
  title.textContent = item.name || "Produto";
  const category = document.createElement("p");
  category.textContent = item.category || "Colecionável";
  text.append(title, category);
  info.append(image, text);

  const actions = document.createElement("div");
  actions.className = "produto-acoes";
  const quantity = document.createElement("div");
  quantity.className = "quantidade";
  const quantityValue = document.createElement("span");
  quantityValue.className = "valor-quantidade";
  quantityValue.textContent = String(item.quantity);
  quantity.append(
    createQuantityButton("−", "Diminuir quantidade", () => updateQuantity(item.id, -1)),
    quantityValue,
    createQuantityButton("+", "Aumentar quantidade", () => updateQuantity(item.id, 1))
  );

  const price = document.createElement("span");
  price.className = "produto-preco";
  price.textContent = formatPrice(Number(item.price) * Number(item.quantity));

  const removeButton = document.createElement("button");
  removeButton.className = "btn-remover";
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `Remover ${item.name || "produto"}`);
  removeButton.textContent = "×";
  removeButton.addEventListener("click", () => removeProduct(item.id));

  actions.append(quantity, price, removeButton);
  product.append(info, actions);
  return product;
}

function renderCart() {
  const cart = getCart();
  productsContainer.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "carrinho-vazio";
    empty.textContent = "Seu carrinho está vazio.";
    productsContainer.appendChild(empty);
  } else {
    const fragment = document.createDocumentFragment();
    cart.forEach(item => fragment.appendChild(createProductCard(item)));
    productsContainer.appendChild(fragment);
  }

  updateSummary(cart);
}

checkoutLink.addEventListener("click", event => {
  if (getCart().length === 0) event.preventDefault();
});

renderCart();
