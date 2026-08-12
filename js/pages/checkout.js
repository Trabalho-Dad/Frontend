import { findMyAddresses } from "../api/addresses.js";
import { finishOrder } from "../api/order.js";
import { getMyUser } from "../api/profile.js";
import { clearCart, getCart } from "../utils/cart.js";

const SHIPPING = 19.9;
const FINISHED_ORDER_KEY = "astra_finished_order";
const cartContainer = document.getElementById("cart-items");
const subtotalElement = document.getElementById("subtotal");
const shippingElement = document.getElementById("shipping");
const totalElement = document.getElementById("total");
const payButton = document.getElementById("btn-pay");
const checkoutMessage = document.getElementById("checkout-message");
let selectedAddress = null;

function getAddressId(address) {
  return address?.id ?? address?.addressId;
}

function formatPrice(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function showMessage(message = "", type = "") {
  checkoutMessage.textContent = message;
  checkoutMessage.className = "checkout-message";
  if (type) checkoutMessage.classList.add(`checkout-message--${type}`);
}

function normalizeCollection(response, keys) {
  if (Array.isArray(response)) return response;
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }
  return Array.isArray(response?.data) ? response.data : [];
}

function setField(id, value) {
  const field = document.getElementById(id);
  if (field) field.value = value ?? "";
}

function fillCheckoutData(user, address) {
  setField("checkout-name", user?.name ?? user?.fullName);
  setField("checkout-email", user?.email);
  setField("checkout-phone", user?.phone ?? user?.phoneNumber ?? user?.telephone);
  setField("checkout-cep", address?.cep ?? address?.zipCode);
  const street = address?.street ?? address?.address ?? "";
  setField("checkout-address", `${street}${address?.number ? `, ${address.number}` : ""}`);
  setField("checkout-city", [address?.city, address?.state].filter(Boolean).join(" - "));
  setField("checkout-complement", address?.complement);
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
  const subtotal = cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
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

function redirectToLogin() {
  sessionStorage.setItem("redirectAfterLogin", window.location.href);
  window.location.href = "auth/login.html";
}

async function loadCheckoutData() {
  try {
    const [user, addressesResponse] = await Promise.all([getMyUser(), findMyAddresses()]);
    const addresses = normalizeCollection(addressesResponse, ["addresses", "items", "results"]);
    selectedAddress = addresses[0] ?? null;
    fillCheckoutData(user, selectedAddress);
    if (!selectedAddress) showMessage("Cadastre um endereço no seu perfil antes de finalizar o pedido.", "error");
  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") return redirectToLogin();
    showMessage(error.message ?? "Não foi possível carregar seus dados.", "error");
  }
}

payButton.addEventListener("click", async () => {
  if (getCart().length === 0) return showMessage("Seu carrinho está vazio.", "error");
  if (!getAddressId(selectedAddress)) return showMessage("Cadastre um endereço no seu perfil antes de finalizar o pedido.", "error");

  const selectedPayment = document.querySelector('input[name="payment"]:checked');
  payButton.disabled = true;
  payButton.textContent = "Processando pagamento...";
  showMessage();

  try {
    const response = await finishOrder({
      addressId: getAddressId(selectedAddress),
      shippingCost: SHIPPING,
      estimatedDeliveryTime: 7,
      installmentsCount: 1,
      paymentType: selectedPayment?.value ?? "PIX",
    });
    const order = response?.order ?? response?.data?.order ?? response?.data ?? response ?? {};
    const orderNumber = order?.orderNumber ?? order?.number ?? order?.id ?? order?.orderId;
    sessionStorage.setItem(FINISHED_ORDER_KEY, JSON.stringify({ orderNumber, finishedAt: new Date().toISOString() }));
    clearCart();
    window.location.href = "pedido-finalizado.html";
  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") return redirectToLogin();
    showMessage(error.message ?? "Não foi possível finalizar o pedido.", "error");
    updateSummary(getCart());
  }
});

document.querySelectorAll(".payment-option").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".payment-option").forEach(item => item.classList.remove("active"));
    option.classList.add("active");
    option.querySelector("input").checked = true;
  });
});

renderCart();
loadCheckoutData();
