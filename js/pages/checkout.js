import { clearCart, getCart } from "../utils/cart.js";

const SHIPPING = 19.9;

const cartContainer = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const shippingEl = document.getElementById("shipping");
const totalEl = document.getElementById("total");
const btnPay = document.getElementById("btn-pay");

function formatPrice(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function renderCart() {
  const cart = getCart();

  cartContainer.replaceChildren();

  if (cart.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Seu carrinho está vazio.";
    cartContainer.appendChild(emptyMessage);
    updateSummary(0);
    return;
  }

  let subtotal = 0;

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

  updateSummary(subtotal);
}

function updateSummary(subtotal) {
  const shipping = subtotal > 0 ? SHIPPING : 0;
  const total = subtotal + shipping;

  subtotalEl.textContent = formatPrice(subtotal);
  shippingEl.textContent = formatPrice(shipping);
  totalEl.textContent = formatPrice(total);

  btnPay.textContent = `Pagar ${formatPrice(total)}`;
}

btnPay.addEventListener("click", () => {
  const cart = getCart();

  if (cart.length === 0) {
    showCheckoutMessage("Seu carrinho está vazio.", true);
    return;
  }

  showCheckoutMessage("Compra finalizada com sucesso!");
  clearCart();

  renderCart();
});

renderCart();

const options = document.querySelectorAll(".payment-option");

options.forEach(option => {
  option.addEventListener("click", () => {

    options.forEach(o => o.classList.remove("active"));

    option.classList.add("active");

    option.querySelector("input").checked = true;
  });
});

function showCheckoutMessage(message, isError = false) {
  const messageEl = document.getElementById("checkout-message");
  messageEl.textContent = message;
  messageEl.classList.toggle("error", isError);
}