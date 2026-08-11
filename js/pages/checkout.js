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

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart"));
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    showMessage("Não foi possível carregar o carrinho.", "error");
    return [];
  }
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

  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.name;

  const details = document.createElement("div");
  const name = document.createElement("p");
  name.textContent = item.name;

  const quantity = document.createElement("span");
  quantity.textContent = `Qtd: ${item.quantity}`;

  const price = document.createElement("strong");
  price.textContent = formatPrice(item.price * item.quantity);

  details.append(name, quantity);
  product.append(image, details, price);

  return product;
}

function updateSummary(subtotal, hasItems) {
  const shipping = hasItems ? SHIPPING : 0;
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
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Seu carrinho está vazio.";
    cartContainer.appendChild(emptyMessage);
    btnPay.disabled = true;
    updateSummary(0, false);
    return;
  }

  btnPay.disabled = false;
  let subtotal = 0;

  cart.forEach(item => {
    subtotal += Number(item.price) * Number(item.quantity);
    cartContainer.appendChild(createProductSummary(item));
  });

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

renderCart();