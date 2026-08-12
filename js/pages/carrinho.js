import {
  findMyOrders,
  findOrderById,
  addFigureToOrder,
  removeFigureFromOrder,
  cancelOrder
} from "../api/order.js";
import { updateNavbar } from "../utils/header-update.js";
import { loading } from "../components/loading.js";
import { requireLogin } from "../utils/auth-guard.js";

const produtosSection = document.querySelector(".produtos");
const subtotalEl = document.getElementById("subtotal");
const freteEl = document.getElementById("frete");
const totalEl = document.getElementById("total");
const errorEl = document.querySelector(".error");
const finalizarLink = document.querySelector(".finalizar-container");

let currentOrder = null;
let carrinhoVazio = true;

const STATUS_CARRINHO = "IN_PROGRESS";

function formatPrice(value) {
  return `R$ ${Number(value ?? 0).toFixed(2).replace(".", ",")}`;
}

function showError(message) {
  if (errorEl) {
    errorEl.textContent = message ?? "";
  }
}

function renderResumo(order) {
  const figures = order?.figures ?? [];
  carrinhoVazio = figures.length === 0;

  const subtotal = Number(order?.price ?? 0);
  const desconto = Number(order?.discount ?? 0);
  const total = Number(order?.finalPrice ?? subtotal);

  subtotalEl.textContent = formatPrice(subtotal);
  totalEl.textContent = formatPrice(total);

  freteEl.textContent = carrinhoVazio ? formatPrice(0) : "Calculado na finalização";

  void desconto;

  if (finalizarLink) {
    finalizarLink.classList.toggle("disabled", carrinhoVazio);

    if (carrinhoVazio) {
      finalizarLink.setAttribute("aria-disabled", "true");
    } else {
      finalizarLink.removeAttribute("aria-disabled");
    }
  }
}

function renderProdutos(order) {
  produtosSection.innerHTML = "";

  const items = order?.figures ?? [];

  if (items.length === 0) {
    const empty = document.createElement("p");

    empty.className = "carrinho-vazio";
    empty.textContent = "Seu carrinho está vazio.";

    produtosSection.appendChild(empty);

    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach(item => {
    if (item.quantity === 0) return;

    const figure = item.figure ?? {};

    const article = document.createElement("article");
    article.className = "produto";
    article.dataset.price = Number(item.price);
    article.dataset.figureId = item.figureId ?? figure.id;

    const info = document.createElement("div");
    info.className = "produto-info";

    const image = document.createElement("img");
    image.className = "produto-imagem";
    image.src = figure?.mainImage?.url ?? "";
    image.alt = figure.name ?? "Produto";

    const texto = document.createElement("div");
    texto.className = "produto-texto";

    const nome = document.createElement("h2");
    nome.textContent = figure.name ?? "Produto";

    const categoria = document.createElement("p");
    categoria.textContent = figure.category ?? "";

    texto.appendChild(nome);
    texto.appendChild(categoria);

    info.appendChild(image);
    info.appendChild(texto);

    const acoes = document.createElement("div");
    acoes.className = "produto-acoes";

    const quantidade = document.createElement("div");
    quantidade.className = "quantidade";

    const valorQuantidade = document.createElement("span");
    valorQuantidade.className = "valor-quantidade";
    valorQuantidade.textContent = item.quantity;

    quantidade.appendChild(valorQuantidade);

    const preco = document.createElement("span");
    preco.className = "produto-preco";
    preco.textContent = formatPrice(Number(item.price))

    const btnRemover = document.createElement("button");
    btnRemover.className = "btn-remover";
    btnRemover.type = "button";
    btnRemover.setAttribute("aria-label", "Remover produto");
    btnRemover.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 7H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M10 11V17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M14 11V17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M5 7L6 20H18L19 7" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M9 7V4H15V7" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      </svg>
    `;

    btnRemover.addEventListener("click", () =>
      removerProduto(item.figureId ?? figure.id, Number(item.quantity))
    );

    acoes.appendChild(quantidade);
    acoes.appendChild(preco);
    acoes.appendChild(btnRemover);

    article.appendChild(info);
    article.appendChild(acoes);

    fragment.appendChild(article);
  });

  produtosSection.appendChild(fragment);
}

function renderCarrinho(order) {
  renderProdutos(order);
  renderResumo(order);
}

if (finalizarLink) {
  finalizarLink.addEventListener("click", event => {
    event.preventDefault();

    if (carrinhoVazio) return;

    window.location.href = finalizarLink.getAttribute("href");
  });
}

async function alterarQuantidade(figureId, delta) {
  showError("");

  try {
    loading.show();

    if (delta > 0) {
      await addFigureToOrder(figureId, 1);
    } else {
      await removeFigureFromOrder(figureId, 1);
    }

    await fetchCarrinho();

  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") return;

    showError(error.message ?? "Não foi possível atualizar a quantidade.");

  } finally {
    loading.hide();
  }
}

async function removerProduto(figureId, quantity) {
  showError("");

  try {
    loading.show();

    await removeFigureFromOrder(figureId, quantity);

    await fetchCarrinho();

  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") return;

    showError(error.message ?? "Não foi possível remover o produto.");
  } finally {
    loading.hide();
  }
}

async function fetchCarrinho() {
  try {
    loading.show();
    showError("");

    const response = await findMyOrders({ status: STATUS_CARRINHO, page: 1, take: 1 });

    const resumo = response?.orders?.[0] ?? null;

    if (!resumo) {
      currentOrder = null;
      renderCarrinho(null);
      return;
    }

    const order = await findOrderById(resumo.id);

    currentOrder = order;

    renderCarrinho(order);

  } catch (error) {
    produtosSection.innerHTML = "";

    const errorMessage = document.createElement("p");
    errorMessage.className = "carrinho-vazio";
    errorMessage.textContent = "Não foi possível carregar o carrinho.";

    produtosSection.appendChild(errorMessage);

    renderResumo(null);

  } finally {
    loading.hide();
  }
}

async function main() {
  if (!(await requireLogin())) return;

  try {
    loading.show();

    await updateNavbar();
    await fetchCarrinho();

  } catch (error) {
    showError("Erro ao carregar carrinho:", error);
  } finally {
    loading.hide();
  }
}

main();