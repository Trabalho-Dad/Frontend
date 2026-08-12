import {
  findMyOrders,
  findOrderById,
  finishOrder
} from "../api/order.js";
import { findMyAddresses, createAddress, updateAddress } from "../api/addresses.js";
import { getMyUser } from "../api/profile.js";
import { updateNavbar } from "../utils/header-update.js";
import { loading } from "../components/loading.js";
import { requireLogin } from "../utils/auth-guard.js";
import { calculateShippingCost, lookupCep, normalizeCep } from "../utils/calculate-shipping.js"
import { showError, hideError } from "./../utils/error.js";

const cartItemsEl = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const shippingEl = document.getElementById("shipping");
const totalEl = document.getElementById("total");
const btnPay = document.getElementById("btn-pay");
const messageEl = document.getElementById("checkout-message");

const paymentRadios = document.querySelectorAll('input[name="payment"]');

const leftInputs = document.querySelectorAll(".checkout-left input");
const [
  nomeInput,
  emailInput,
  telefoneInput,
  cepInput,
  enderecoInput,
  numeroInput,
  complementoInput,
  bairroInput,
  cidadeInput,
  estadoInput
] = leftInputs;

const STATUS_CARRINHO = "IN_PROGRESS";

let currentOrder = null;
let selectedAddressId = null;
let shippingCost = 0;

function formatPrice(value) {
  return `R$ ${Number(value ?? 0).toFixed(2).replace(".", ",")}`;
}

function showMessage(message, isError = true) {
  if (!messageEl) return;

  messageEl.textContent = message ?? "";
  messageEl.classList.toggle("error", isError);
}

function setupPaymentOptions() {
  if (paymentRadios[0]) paymentRadios[0].value = "PIX";
  if (paymentRadios[1]) paymentRadios[1].value = "CREDIT_CARD";
}

function getSelectedPaymentType() {
  const checked = document.querySelector('input[name="payment"]:checked');
  return checked?.value ?? "PIX";
}

async function preencherDadosUsuario() {
  try {
    const user = await getMyUser();

    if (nomeInput) nomeInput.value = user?.name ?? "";
    if (emailInput) emailInput.value = user?.email ?? "";
    if (telefoneInput) telefoneInput.value = user?.phone ?? "";

  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") throw error;
  }
}

async function preencherEnderecoSalvo() {
  try {
    const addresses = await findMyAddresses();
    const address = addresses?.[0] ?? addresses?.addresses?.[0] ?? null;

    if (!address) return;

    selectedAddressId = address.id;

    if (cepInput) cepInput.value = address.cep ?? "";
    if (enderecoInput) enderecoInput.value = address.street ?? "";
    if (numeroInput) numeroInput.value = address.number ?? "";
    if (complementoInput) complementoInput.value = address.complement ?? "";
    if (bairroInput) bairroInput.value = address.neighborhood ?? "";
    if (cidadeInput) cidadeInput.value = address.city ?? "";
    if (estadoInput) estadoInput.value = address.state ?? "";

  } catch (error) {
    showError(error);
  }
}

function renderResumo(order) {
  const figures = order?.figures ?? [];

  const subtotal = Number(order?.price ?? 0);
  const frete = figures.length > 0 ? shippingCost : 0;
  const total = Number(order?.finalPrice ?? subtotal) + frete;

  subtotalEl.textContent = formatPrice(subtotal);
  shippingEl.textContent = formatPrice(frete);
  totalEl.textContent = formatPrice(total);
}

function renderCartItems(order) {
  cartItemsEl.innerHTML = "";

  const figures = order?.figures ?? [];

  if (figures.length === 0) {
    const empty = document.createElement("p");

    empty.className = "cart-items-empty";
    empty.textContent = "Seu carrinho está vazio.";

    cartItemsEl.appendChild(empty);

    return;
  }

  const fragment = document.createDocumentFragment();

  figures.forEach(item => {
    if (item.quantity === 0) return;
    const figure = item.figure ?? {};

    const row = document.createElement("div");
    row.className = "cart-item";

    const nome = document.createElement("span");
    nome.className = "cart-item-nome";
    nome.textContent = `${figure.name ?? "Produto"} x${item.quantity}`;

    const preco = document.createElement("span");
    preco.className = "cart-item-preco";
    preco.textContent = formatPrice(Number(item.price));

    row.appendChild(nome);
    row.appendChild(preco);

    fragment.appendChild(row);
  });

  cartItemsEl.appendChild(fragment);
}

function renderCheckout(order) {
  renderCartItems(order);
  renderResumo(order);
}

function validarFormulario() {
  const campos = [
    { input: nomeInput, label: "Nome completo" },
    { input: emailInput, label: "E-mail" },
    { input: cepInput, label: "CEP" },
    { input: enderecoInput, label: "Endereço" },
    { input: numeroInput, label: "Número" },
    { input: bairroInput, label: "Bairro" },
    { input: cidadeInput, label: "Cidade" },
    { input: estadoInput, label: "Estado" }
  ];

  for (const campo of campos) {
    if (!campo.input || !campo.input.value.trim()) {
      showMessage(`Preencha o campo "${campo.label}".`);
      campo.input?.focus();
      return false;
    }
  }

  return true;
}

async function buscarDadosCep() {
  const cepValue = cepInput?.value.trim() ?? "";

  if (!cepValue || cepValue.length < 8) return;

  try {
    const dados = await lookupCep(cepValue);

    if (enderecoInput) enderecoInput.value = dados.street ?? "";
    if (bairroInput) bairroInput.value = dados.neighborhood ?? "";
    if (cidadeInput) cidadeInput.value = dados.city ?? "";
    if (estadoInput) estadoInput.value = dados.state ?? "";

  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
  }
}

async function calcularFrete() {
  const cepValue = cepInput?.value.trim() ?? "";
  const subtotal = Number(currentOrder?.price ?? 0);

  if (!cepValue || subtotal === 0) return;

  try {
    const resultado = await calculateShippingCost(cepValue, subtotal);
    shippingCost = parseFloat(resultado.cost) ?? 0;
    renderResumo(currentOrder);
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    shippingCost = 0;
  }
}

async function verificarEnderecoExistente(novoEndereco) {
  try {
    const addresses = await findMyAddresses();
    const lista = addresses?.[0] ? addresses : addresses?.addresses ?? [];

    return lista.find(addr => 
      addr.cep === novoEndereco.cep &&
      addr.street === novoEndereco.street &&
      addr.number === novoEndereco.number &&
      addr.complement === novoEndereco.complement
    );

  } catch (error) {
    console.error("Erro ao verificar endereços existentes:", error);
    return null;
  }
}

async function salvarEndereco() {
  const novoEndereco = {
    cep: cepInput?.value.trim() ?? "",
    state: estadoInput?.value.trim() ?? "",
    city: cidadeInput?.value.trim() ?? "",
    neighborhood: bairroInput?.value.trim() ?? "",
    street: enderecoInput?.value.trim() ?? "",
    number: numeroInput?.value.trim() ?? "",
    complement: complementoInput?.value.trim() ?? ""
  };

  const enderecoExistente = await verificarEnderecoExistente(novoEndereco);

  if (enderecoExistente) {
    const enderecoAtualizado = await updateAddress(enderecoExistente.id, novoEndereco);
    return enderecoAtualizado?.id ?? enderecoAtualizado?.address?.id ?? enderecoExistente.id;
  }

  const novoEnderecoCriado = await createAddress(novoEndereco);
  return novoEnderecoCriado?.id ?? novoEnderecoCriado?.address?.id ?? null;
}

async function handlePagar() {
  showMessage("");

  if (!currentOrder) {
    showMessage("Não foi possível carregar seu pedido.");
    return;
  }

  const figures = currentOrder?.figures ?? [];

  if (figures.length === 0) {
    showMessage("Seu carrinho está vazio.");
    return;
  }

  if (!validarFormulario()) return;

  const paymentType = getSelectedPaymentType();

  const estimatedDeliveryTime = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const installmentsCount = 1;

  try {
    loading.show();
    btnPay.disabled = true;

    const addressId = await salvarEndereco();

    if (!addressId) {
      showMessage("Não foi possível salvar o endereço de entrega.");
      return;
    }

    await finishOrder({
      addressId,
      shippingCost,
      estimatedDeliveryTime,
      installmentsCount,
      paymentType
    });

    showMessage("Pedido finalizado com sucesso!", false);

    setTimeout(() => {
      window.location.href = "catalogo.html";
    }, 1500);

  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") return;

    console.error("Erro ao finalizar pedido:", error);
    showMessage(error.message ?? "Não foi possível finalizar o pedido.");

  } finally {
    loading.hide();
    btnPay.disabled = false;
  }
}

async function fetchCarrinho() {
  try {
    loading.show();
    showMessage("");

    const response = await findMyOrders({ status: STATUS_CARRINHO, page: 1, take: 1 });

    const resumo = response?.orders?.[0] ?? null;

    if (!resumo) {
      currentOrder = null;
      renderCheckout(null);
      return;
    }

    const order = await findOrderById(resumo.id);

    currentOrder = order;

    renderCheckout(order);

  } catch (error) {
    console.error("Erro ao carregar carrinho:", error);

    cartItemsEl.innerHTML = "";

    const errorMessage = document.createElement("p");
    errorMessage.className = "cart-items-empty";
    errorMessage.textContent = "Não foi possível carregar seu pedido.";

    cartItemsEl.appendChild(errorMessage);

    renderResumo(null);

  } finally {
    loading.hide();
  }
}

if (btnPay) {
  btnPay.addEventListener("click", event => {
    event.preventDefault();
    handlePagar();
  });
}

if (cepInput) {
  let timeoutId;
  
  cepInput.addEventListener("input", () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      buscarDadosCep();
      calcularFrete();
    }, 500);
  });
}

async function main() {
  if (!(await requireLogin())) return;

  try {
    loading.show();

    setupPaymentOptions();

    await Promise.all([
      preencherDadosUsuario(),
      preencherEnderecoSalvo(),
      updateNavbar()
    ]);

    await fetchCarrinho();

  } catch (error) {
    console.error("Erro ao carregar checkout:", error);

  } finally {
    loading.hide();
  }
}

main();