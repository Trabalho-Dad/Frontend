import { findMyAddresses } from "../api/addresses.js";
import { logout } from "../api/auth.js";
import { findMyOrders } from "../api/order.js";
import { getMyUser } from "../api/profile.js";
import { loading } from "../components/loading.js";
import { formatCep, formatCpf, formatDate, formatPrice } from "../utils/formatters.js";
import { updateNavbar } from "../utils/header-update.js";

const profileName = document.getElementById("profile-name");
const profileAvatar = document.getElementById("profile-avatar");
const profileEmail = document.getElementById("profile-email");
const profilePhone = document.getElementById("profile-phone");
const profileCpf = document.getElementById("profile-cpf");
const profileFullName = document.getElementById("profile-full-name");
const profileMessage = document.getElementById("profile-message");
const addressesList = document.getElementById("addresses-list");
const addressesCount = document.getElementById("addresses-count");
const ordersList = document.getElementById("orders-list");
const ordersCount = document.getElementById("orders-count");
const editProfileButton = document.getElementById("edit-profile-btn");
const logoutProfileButton = document.getElementById("logout-profile-btn");

const STATUS_DATA = {
  DELIVERED: { label: "Entregue", className: "status-success" },
  FINISHED: { label: "Finalizado", className: "status-success" },
  SHIPPED: { label: "Enviado", className: "status-progress" },
  PROCESSING: { label: "Processando", className: "status-warning" },
  PENDING: { label: "Pendente", className: "status-warning" },
  CANCELLED: { label: "Cancelado", className: "status-danger" },
  CANCELED: { label: "Cancelado", className: "status-danger" },
};

function showMessage(message, isError = false) {
  profileMessage.textContent = message;
  profileMessage.classList.toggle("error", isError);
}

function normalizeCollection(response, keys) {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }

  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function renderUser(user) {
  const name = user?.name ?? user?.fullName ?? "Usuário Astra";
  const phone = user?.phone ?? user?.phoneNumber ?? user?.telephone ?? "Não informado";

  profileName.textContent = name;
  profileFullName.textContent = name;
  profileEmail.textContent = user?.email ?? "Não informado";
  profileCpf.textContent = formatCpf(user?.cpf) || "Não informado";
  profilePhone.textContent = phone;
  profileAvatar.textContent = name.trim().charAt(0) || "A";
}

function createEmptyState(message) {
  const emptyState = document.createElement("p");
  emptyState.className = "empty-state";
  emptyState.textContent = message;
  return emptyState;
}

function renderAddresses(response) {
  const addresses = normalizeCollection(response, ["addresses", "items", "results"]);
  addressesList.replaceChildren();
  addressesCount.textContent = `${addresses.length} ${addresses.length === 1 ? "endereço" : "endereços"}`;

  if (addresses.length === 0) {
    addressesList.appendChild(createEmptyState("Você ainda não possui endereços cadastrados."));
    return;
  }

  const fragment = document.createDocumentFragment();

  addresses.forEach((address, index) => {
    const card = document.createElement("article");
    card.className = "address-card";

    const title = document.createElement("h3");
    title.className = "address-name";

    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "location_on";

    const titleText = document.createElement("span");
    titleText.textContent = address?.name ?? address?.label ?? address?.type ?? `Endereço ${index + 1}`;
    title.append(icon, titleText);

    const street = address?.street ?? address?.address ?? "Endereço não informado";
    const number = address?.number ? `, ${address.number}` : "";
    const complement = address?.complement ? ` · ${address.complement}` : "";
    const mainLine = document.createElement("p");
    mainLine.className = "address-line";
    mainLine.textContent = `${street}${number}${complement}`;

    const location = document.createElement("p");
    location.className = "address-location";
    const cityState = [address?.city, address?.state].filter(Boolean).join(", ");
    const cep = formatCep(address?.cep ?? address?.zipCode);
    location.textContent = [address?.neighborhood, cityState, cep].filter(Boolean).join(" · ") || "Localização não informada";

    card.append(title, mainLine, location);
    fragment.appendChild(card);
  });

  addressesList.appendChild(fragment);
}

function getOrderItems(order) {
  const items = order?.items ?? order?.orderItems ?? order?.figures ?? [];
  return Array.isArray(items) ? items : [];
}

function getOrderItemCount(order) {
  return getOrderItems(order).reduce((total, item) => total + Number(item?.quantity ?? 1), 0);
}

function getOrderTotal(order) {
  const directTotal = order?.total ?? order?.totalPrice ?? order?.finalPrice ?? order?.amount;
  if (directTotal != null) return Number(directTotal);

  return getOrderItems(order).reduce((total, item) => {
    const price = item?.unitPrice ?? item?.price ?? item?.figure?.price ?? 0;
    return total + Number(price) * Number(item?.quantity ?? 1);
  }, 0);
}

function getStatusData(status) {
  const normalized = String(status ?? "PENDING").toUpperCase();
  return STATUS_DATA[normalized] ?? {
    label: String(status ?? "Pendente").toLowerCase(),
    className: "status-default",
  };
}

function renderOrders(response) {
  const orders = normalizeCollection(response, ["orders", "items", "results"]);
  const totalOrders = Number(response?.total ?? response?.count ?? orders.length);
  ordersList.replaceChildren();
  ordersCount.textContent = `${totalOrders} ${totalOrders === 1 ? "pedido" : "pedidos"}`;

  if (orders.length === 0) {
    ordersList.appendChild(createEmptyState("Você ainda não realizou nenhum pedido."));
    return;
  }

  const fragment = document.createDocumentFragment();

  orders.forEach(order => {
    const row = document.createElement("article");
    row.className = "order-row";

    const icon = document.createElement("span");
    icon.className = "order-icon material-symbols-outlined";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "deployed_code";

    const content = document.createElement("div");
    content.className = "order-content";

    const main = document.createElement("div");
    main.className = "order-main";

    const titleLine = document.createElement("div");
    titleLine.className = "order-title-line";

    const title = document.createElement("strong");
    title.className = "order-title";
    const rawId = String(order?.id ?? order?.orderId ?? "-");
    title.textContent = `#${rawId.length > 8 ? rawId.slice(0, 8) : rawId}`;

    const statusData = getStatusData(order?.status);
    const status = document.createElement("span");
    status.className = `order-status ${statusData.className}`;
    status.textContent = statusData.label;
    titleLine.append(title, status);

    const itemCount = getOrderItemCount(order);
    const meta = document.createElement("p");
    meta.className = "order-meta";
    meta.textContent = `${formatDate(order?.createdAt ?? order?.created_at ?? order?.date)} · ${itemCount} ${itemCount === 1 ? "item" : "itens"}`;
    main.append(titleLine, meta);

    const price = document.createElement("strong");
    price.className = "order-price";
    price.textContent = formatPrice(getOrderTotal(order));

    content.append(main, price);
    row.append(icon, content);
    fragment.appendChild(row);
  });

  ordersList.appendChild(fragment);
}

function redirectToLogin() {
  sessionStorage.setItem("redirectAfterLogin", window.location.href);
  window.location.href = "../auth/login.html";
}

async function main() {
  loading.show();

  try {
    const user = await getMyUser();
    renderUser(user);
    await updateNavbar();

    const [addressesResult, ordersResult] = await Promise.allSettled([
      findMyAddresses(),
      findMyOrders({ page: 1, take: 20 }),
    ]);

    if (addressesResult.status === "fulfilled") {
      renderAddresses(addressesResult.value);
    } else {
      renderAddresses([]);
      showMessage("Não foi possível carregar todos os dados do perfil.", true);
    }

    if (ordersResult.status === "fulfilled") {
      renderOrders(ordersResult.value);
    } else {
      renderOrders([]);
      showMessage("Não foi possível carregar todos os dados do perfil.", true);
    }
  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") {
      redirectToLogin();
      return;
    }

    showMessage(error.message ?? "Não foi possível carregar seu perfil.", true);
  } finally {
    loading.hide();
  }
}

editProfileButton.addEventListener("click", () => {
  showMessage("A edição do perfil estará disponível quando o back-end oferecer essa operação.");
});

logoutProfileButton.addEventListener("click", async () => {
  logoutProfileButton.disabled = true;
  showMessage("Saindo da sua conta...");

  try {
    await logout();
    sessionStorage.removeItem("logged");
    sessionStorage.removeItem("redirectAfterLogin");
    window.location.href = "../../index.html";
  } catch (error) {
    showMessage(error.message ?? "Não foi possível sair da conta.", true);
    logoutProfileButton.disabled = false;
  }
});

main();
