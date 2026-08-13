import {
  findMyOrders,
  findOrderById,
  finishOrder,
  addCoupon
} from "../api/order.js";
import { findMyAddresses, createAddress, updateAddress } from "../api/addresses.js";
import { getMyUser } from "../api/profile.js";
import { updateNavbar } from "../utils/header-update.js";
import { loading } from "../components/loading.js";
import { requireLogin } from "../utils/auth-guard.js";
import { calculateShippingCost, lookupCep, normalizeCep } from "../utils/calculate-shipping.js"

const cartItemsEl = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const shippingEl = document.getElementById("shipping");
const totalEl = document.getElementById("total");
const btnPay = document.getElementById("btn-pay");
const messageEl = document.getElementById("checkout-message");

const couponInput = document.getElementById("coupon-input");
const btnCoupon = document.getElementById("btn-coupon");
const couponMessageEl = document.getElementById("coupon-message");

const paymentRadios = document.querySelectorAll('input[name="payment"]');


function showCouponMessage(message, isError = true) {
  if (!couponMessageEl) return;

  couponMessageEl.textContent = message ?? "";

  couponMessageEl.classList.toggle("error", isError);
  couponMessageEl.classList.toggle("success", !isError);
}

const leftInputs = document.querySelectorAll(".checkout-left input");
const [
  nomeInput,
  emailInput,
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

  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") throw error;
  }
}

async function preencherEnderecoSalvo() {
  const enderecoCard = cepInput?.closest(".checkout-card");
  enderecoCard?.classList.add("is-loading");

  try {
    const response = await findMyAddresses();
    const address = response?.addresses?.[0] ?? null;

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
    showMessage(error.message ?? "Erro ao carregar endereço.");
  } finally {
    enderecoCard?.classList.remove("is-loading");
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
  const cepValue = normalizeCep(cepInput?.value ?? "");

  if (cepValue.length !== 8) return;

  try {
    const dados = await lookupCep(cepValue);

    if (enderecoInput) enderecoInput.value = dados.street ?? "";
    if (bairroInput) bairroInput.value = dados.neighborhood ?? "";
    if (cidadeInput) cidadeInput.value = dados.city ?? "";
    if (estadoInput) estadoInput.value = dados.state ?? "";

  } catch (error) {
    showMessage("Erro ao buscar CEP:", error);
  }
}

async function calcularFrete() {
  const cepValue = normalizeCep(cepInput?.value ?? "");
  const subtotal = Number(currentOrder?.price ?? 0);

  if (cepValue.length !== 8 || subtotal === 0) return;

  try {
    const resultado = await calculateShippingCost(cepValue, subtotal);
    shippingCost = parseFloat(resultado.cost) ?? 0;
    renderResumo(currentOrder);
  } catch (error) {
    showMessage("Erro ao calcular frete:", error);
    shippingCost = 0;
  }
}

async function handleAdicionarCupom() {
  showCouponMessage("");

  if (!currentOrder?.id) {
    showCouponMessage("Não foi possível identificar o pedido.");
    return;
  }

  const code = couponInput?.value.trim().toUpperCase();

  if (!code) {
    showCouponMessage("Digite um cupom.");
    couponInput?.focus();
    return;
  }

  try {
    btnCoupon.disabled = true;

    const response = await addCoupon(currentOrder.id, code);

    const updatedOrder =
      response?.order ??
      response;

    if (updatedOrder?.id) {
      currentOrder = updatedOrder;
      renderCheckout(currentOrder);
    } else {

      const refreshedOrder = await findOrderById(currentOrder.id);

      currentOrder = refreshedOrder;
      renderCheckout(currentOrder);
    }

    showCouponMessage("Cupom aplicado com sucesso!", false);

    couponInput.value = "";
    couponInput.disabled = true;

  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") {
      return;
    }

    showCouponMessage(
      error.message ?? "Não foi possível aplicar o cupom."
    );

  } finally {
    btnCoupon.disabled = false;
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
    showMessage(error);
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

  const estimatedDeliveryTime = 7;

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
    showMessage("Erro ao carregar carrinho:", error);

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

const btnBuscarCep = document.getElementById("btn-buscar-cep");

async function handleBuscarCep() {
  showMessage("");

  const cepValue = normalizeCep(cepInput?.value ?? "");

  if (cepValue.length !== 8) {
    showMessage("Informe um CEP válido.");
    return;
  }

  try {
    btnBuscarCep.disabled = true;
    await buscarDadosCep();
    await calcularFrete();
  } finally {
    btnBuscarCep.disabled = false;
  }
}

if (btnBuscarCep) {
  btnBuscarCep.addEventListener("click", event => {
    event.preventDefault();
    handleBuscarCep();
  });
}

if (btnCoupon) {
  btnCoupon.addEventListener("click", event => {
    event.preventDefault();
    handleAdicionarCupom();
  });
}

if (couponInput) {
  couponInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdicionarCupom();
    }
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
    showMessage(error);
  } finally {
    loading.hide();
  }
}

main();
