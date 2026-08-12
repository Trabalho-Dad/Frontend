import { getMyUser } from "../api/profile.js";
import { findMyOrders } from "../api/order.js";

const STORAGE_KEY = "astra_finished_order";
const customerName = document.getElementById("customer-name");
const customerEmail = document.getElementById("customer-email");
const orderNumber = document.getElementById("order-number");
const countdown = document.getElementById("redirect-countdown");
const errorMessage = document.getElementById("confirmation-error");

function readFinishedOrder() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)); }
  catch (_) { return null; }
}

function formatOrderNumber(value) {
  if (value === undefined || value === null || value === "") return "não informado";
  const text = String(value);
  return text.length > 12 ? text.slice(0, 8).toUpperCase() : text;
}

function getLatestOrder(response) {
  const orders = Array.isArray(response)
    ? response
    : response?.orders ?? response?.items ?? response?.results ?? response?.data ?? [];
  return Array.isArray(orders) ? orders[0] : null;
}

function startRedirect() {
  let remaining = 8;
  const timer = window.setInterval(() => {
    remaining -= 1;
    countdown.textContent = String(Math.max(remaining, 0));
    if (remaining <= 0) {
      window.clearInterval(timer);
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.href = "index.html";
    }
  }, 1000);
}

async function loadConfirmation() {
  const finishedOrder = readFinishedOrder();
  if (!finishedOrder) return window.location.replace("checkout.html");
  try {
    const requests = [getMyUser()];
    if (!finishedOrder.orderNumber) requests.push(findMyOrders({ page: 1, take: 1 }));
    const [user, ordersResponse] = await Promise.all(requests);
    customerName.textContent = user?.name ?? user?.fullName ?? "cliente Astra";
    customerEmail.textContent = user?.email ?? "seu e-mail";
    const latestOrder = getLatestOrder(ordersResponse);
    const databaseOrderNumber = latestOrder?.orderNumber ?? latestOrder?.number ?? latestOrder?.id ?? latestOrder?.orderId;
    orderNumber.textContent = `Nº do pedido: #${formatOrderNumber(finishedOrder.orderNumber ?? databaseOrderNumber)}`;
  } catch (_) {
    errorMessage.textContent = "O pedido foi confirmado, mas não foi possível carregar os dados do perfil.";
    orderNumber.textContent = `Nº do pedido: #${formatOrderNumber(finishedOrder.orderNumber)}`;
  }
  startRedirect();
}

loadConfirmation();
