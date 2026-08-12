import { loading } from "../components/loading.js";
import { hideError, showError } from "../utils/error.js";
import { logout } from "../api/auth.js"; 
import { updateNavbar } from "../utils/header-update.js";
import { findHomeKpisAdmin } from "../api/home.js";

const kpiGrid = document.getElementById("kpi-grid");
const kpiOrders = document.getElementById("kpi-orders");
const kpiRevenue = document.getElementById("kpi-revenue");
const kpiActiveFigures = document.getElementById("kpi-active-figures");

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function renderKpis(kpis) {
  kpiOrders.textContent = kpis.ordersLast24h ?? 0;
  kpiRevenue.textContent = formatCurrency(kpis.totalReceivedLast24h);
  kpiActiveFigures.textContent = kpis.totalActiveFigures ?? 0;
}

function renderKpiError() {
  kpiGrid.innerHTML = "";

  const errorMessage = document.createElement("p");

  errorMessage.className = "admin-empty";
  errorMessage.textContent = "Não foi possível carregar os indicadores.";

  kpiGrid.appendChild(errorMessage);
}

async function fetchKpis() {
  try {
    loading.show();

    const kpis = await findHomeKpisAdmin();

    renderKpis(kpis);

  } catch (error) {
    console.error("Erro ao carregar KPIs:", error);

    renderKpiError();

  } finally {
    loading.hide();
  }
}

async function main() {
  try {
    loading.show();

    await Promise.all([
      updateNavbar(),
      fetchKpis()
    ]);

  } catch (error) {
    console.error("Erro ao carregar página administrativa:", error);

  } finally {
    loading.hide();
  }
}

main();