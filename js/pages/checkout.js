const SHIPPING = 19.9;

const cartContainer = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const shippingEl = document.getElementById("shipping");
const totalEl = document.getElementById("total");
const btnPay = document.getElementById("btn-pay");

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function formatPrice(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function renderCart() {
  const cart = getCart();

  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
    updateSummary(0);
    return;
  }

  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;

    const productHTML = `
      <div class="product-summary">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <p>${item.name}</p>
          <span>Qtd: ${item.quantity}</span>
        </div>
        <strong>${formatPrice(item.price * item.quantity)}</strong>
      </div>
    `;

    cartContainer.innerHTML += productHTML;
  });

  updateSummary(subtotal);
}

function updateSummary(subtotal) {
  const total = subtotal + SHIPPING;

  subtotalEl.textContent = formatPrice(subtotal);
  shippingEl.textContent = formatPrice(SHIPPING);
  totalEl.textContent = formatPrice(total);

  btnPay.textContent = `Pagar ${formatPrice(total)}`;
}

btnPay.addEventListener("click", () => {
  const cart = getCart();

  if (cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  alert("Compra finalizada com sucesso!");

  localStorage.removeItem("cart");

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