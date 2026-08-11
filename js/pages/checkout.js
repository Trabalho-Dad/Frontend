import { clearCart, getCart } from "../utils/cart.js";

const SHIPPING = 19.9;

const cartContainer = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const shippingEl = document.getElementById("shipping");
const totalEl = document.getElementById("total");
const btnPay = document.getElementById("btn-pay");
const checkoutMessage = document.getElementById("checkout-message");

function showMessage(message = "", type = "") {
  checkoutMessage.textContent = message;
  checkoutMessage.className = "checkout-message";

  if (type) checkoutMessage.classList.add(`checkout-message--${type}`);
}

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function createProductSummary(item) {
  const product = document.createElement("div");
  product.className = "product-summary";

  cartContainer.replaceChildren();

  if (cart.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Seu carrinho está vazio.";
    cartContainer.appendChild(emptyMessage);
    updateSummary(0);
    return;
  }

  const quantity = document.createElement("span");
  quantity.textContent = `Qtd: ${item.quantity}`;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;

    const product = document.createElement("div");
    product.className = "product-summary";

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.name;

    const details = document.createElement("div");
    const name = document.createElement("p");
    name.textContent = item.name;
    const quantity = document.createElement("span");
    quantity.textContent = `Qtd: ${item.quantity}`;
    details.append(name, quantity);

    const price = document.createElement("strong");
    price.textContent = formatPrice(item.price * item.quantity);

    product.append(image, details, price);
    cartContainer.appendChild(product);
  });

  return product;
}

function updateSummary(subtotal) {
  const shipping = subtotal > 0 ? SHIPPING : 0;
  const total = subtotal + shipping;

  subtotalEl.textContent = formatPrice(subtotal);
  shippingEl.textContent = formatPrice(shipping);
  totalEl.textContent = formatPrice(total);
  btnPay.textContent = `Pagar ${formatPrice(total)}`;
}

function renderCart() {
  const cart = getCart();
  cartContainer.replaceChildren();

  if (cart.length === 0) {
    showCheckoutMessage("Seu carrinho está vazio.", true);
    return;
  }

  showCheckoutMessage("Compra finalizada com sucesso!");
  clearCart();

  updateSummary(subtotal, true);
}

btnPay.addEventListener("click", () => {
  const cart = getCart();

  if (cart.length === 0) {
    showMessage("Seu carrinho está vazio. Adicione um produto antes de pagar.", "error");
    return;
  }

  try {
    localStorage.removeItem("cart");
    renderCart();
    showMessage("Compra finalizada com sucesso!", "success");
  } catch (error) {
    showMessage("Não foi possível finalizar a compra. Tente novamente.", "error");
  }
});

document.querySelectorAll(".payment-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".payment-option")
      .forEach(item => item.classList.remove("active"));

    option.classList.add("active");
    option.querySelector("input").checked = true;
  });
});

function showCheckoutMessage(message, isError = false) {
  const messageEl = document.getElementById("checkout-message");
  messageEl.textContent = message;
  messageEl.classList.toggle("error", isError);
}
