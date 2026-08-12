import { clearCart, getCart } from "../utils/cart.js";

const SHIPPING = 19.9;
const cartContainer = document.getElementById("cart-items");
const subtotalElement = document.getElementById("subtotal");
const shippingElement = document.getElementById("shipping");
const totalElement = document.getElementById("total");
const payButton = document.getElementById("btn-pay");
const checkoutMessage = document.getElementById("checkout-message");

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function showMessage(message = "", type = "") {
  checkoutMessage.textContent = message;
  checkoutMessage.className = "checkout-message";
  if (type) checkoutMessage.classList.add(`checkout-message--${type}`);
}

function createProductSummary(item) {
  const product = document.createElement("div");
  product.className = "product-summary";

  const image = document.createElement("img");
  image.src = item.image || "./assets/images/placeholder.png";
  image.alt = item.name || "Produto";

  const details = document.createElement("div");
  const name = document.createElement("p");
  name.textContent = item.name || "Produto";
  const quantity = document.createElement("span");
  quantity.textContent = `Qtd: ${Number(item.quantity)}`;
  details.append(name, quantity);

  const price = document.createElement("strong");
  price.textContent = formatPrice(Number(item.price) * Number(item.quantity));
  product.append(image, details, price);
  return product;
}

function updateSummary(cart) {
  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );
  const shipping = cart.length > 0 ? SHIPPING : 0;
  const total = subtotal + shipping;

  subtotalElement.textContent = formatPrice(subtotal);
  shippingElement.textContent = formatPrice(shipping);
  totalElement.textContent = formatPrice(total);
  payButton.textContent = cart.length > 0 ? `Pagar ${formatPrice(total)}` : "Pagar";
  payButton.disabled = cart.length === 0;
}

function renderCart() {
  const cart = getCart();
  cartContainer.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Seu carrinho está vazio.";
    cartContainer.appendChild(empty);
  } else {
    const fragment = document.createDocumentFragment();
    cart.forEach(item => fragment.appendChild(createProductSummary(item)));
    cartContainer.appendChild(fragment);
  }

  updateSummary(cart);
}

payButton.addEventListener("click", () => {
  if (getCart().length === 0) {
    showMessage("Seu carrinho está vazio. Adicione um produto antes de pagar.", "error");
    return;
  }

  clearCart();
  renderCart();
  showMessage("Compra finalizada com sucesso!", "success");
});

document.querySelectorAll(".payment-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".payment-option")
      .forEach(item => item.classList.remove("active"));
    option.classList.add("active");
    option.querySelector("input").checked = true;
  });
});

renderCart();
