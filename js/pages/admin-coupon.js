import {
  findManyCouponsAdmin,
  createCoupon
} from "../api/coupons.js";
import { updateNavbar } from "../utils/header-update.js";
import { loading } from "../components/loading.js";
import { hideError, showError } from "../utils/error.js";
import { openModal, closeModal } from "../utils/modal.js";
import { renderPagination } from "../utils/pagination.js";

const COUPON_MODAL_ID = "coupon-modal";
const ITEMS_PER_PAGE = 5;

const couponsTableBody = document.getElementById("coupons-table-body");
const couponsEmpty = document.getElementById("coupons-empty");
const couponForm = document.getElementById("coupon-form");
const couponsPagination = document.getElementById("coupons-pagination");

const btnNewCoupon = document.getElementById("btn-new-coupon");

let currentPage = 1;

const STATUS_LABELS = {
  ativo: "Ativo",
  pendente: "Pendente",
  expirado: "Expirado",
  esgotado: "Esgotado"
};

const STATUS_BADGE_CLASSES = {
  ativo: "badge-active",
  pendente: "badge-pending",
  expirado: "badge-inactive",
  esgotado: "badge-warning"
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR");
}

function formatDiscount(discountPct) {
  return `${(discountPct * 100).toFixed(0)}%`;
}

function getCouponStatus(coupon) {
  const today = new Date();
  const startDate = new Date(coupon.startDate);
  const endDate = new Date(coupon.endDate);

  if (today < startDate) return "pendente";
  if (today > endDate) return "expirado";
  if (coupon.usageCount >= coupon.usageLimit) return "esgotado";
  return "ativo";
}

function createStatusCell(status) {
  const td = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `badge-status ${STATUS_BADGE_CLASSES[status] ?? "badge-inactive"}`;
  badge.textContent = STATUS_LABELS[status] ?? status;
  td.appendChild(badge);
  return td;
}

function createTextCell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function renderCouponsTable(coupons) {
  couponsTableBody.innerHTML = "";
  couponsEmpty.style.display = coupons.length === 0 ? "block" : "none";

  coupons.forEach(coupon => {
    const tr = document.createElement("tr");
    const status = getCouponStatus(coupon);

    tr.appendChild(createTextCell(coupon.code));
    tr.appendChild(createTextCell(formatDiscount(coupon.discountPct)));
    tr.appendChild(createTextCell(`${coupon.usageCount || 0}/${coupon.usageLimit}`));
    tr.appendChild(createTextCell(`${formatDate(coupon.startDate)} - ${formatDate(coupon.endDate)}`));
    tr.appendChild(createStatusCell(status));

    couponsTableBody.appendChild(tr);
  });
}

async function loadCoupons(page = 1) {
  try {
    loading.show();
    hideError();

    const response = await findManyCouponsAdmin({ page, take: ITEMS_PER_PAGE });
    const coupons = response.coupons ?? response ?? [];
    const total = response.total ?? coupons.length;
    const totalPages = response.totalPages ?? Math.ceil(total / ITEMS_PER_PAGE);

    currentPage = page;
    renderCouponsTable(coupons);
    renderPagination(couponsPagination, {
      currentPage,
      totalPages,
      onPageChange: loadCoupons
    });
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

function openNewCouponModal() {
  couponForm.reset();
  openModal(COUPON_MODAL_ID);
}

function validateCouponForm({ code, discountPercent, usageLimit, startDate, endDate }) {
  if (!code || !discountPercent || !usageLimit || !startDate || !endDate) {
    return "Preencha todos os campos.";
  }

  if (discountPercent < 1 || discountPercent > 100) {
    return "Desconto deve estar entre 1% e 100%.";
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return "Data de término deve ser posterior à data de início.";
  }

  return null;
}

async function handleCouponFormSubmit(event) {
  event.preventDefault();

  const formValues = {
    code: document.getElementById("coupon-code-input").value.trim().toUpperCase(),
    discountPercent: parseInt(document.getElementById("coupon-discount").value, 10),
    usageLimit: parseInt(document.getElementById("coupon-limit").value, 10),
    startDate: document.getElementById("coupon-start").value,
    endDate: document.getElementById("coupon-end").value
  };

  const validationError = validateCouponForm(formValues);
  if (validationError) {
    showError(validationError);
    return;
  }

  try {
    loading.show();
    hideError();

    await createCoupon({
      code: formValues.code,
      discountPct: formValues.discountPercent / 100,
      usageLimit: formValues.usageLimit,
      startDate: formValues.startDate,
      endDate: formValues.endDate
    });

    closeModal(COUPON_MODAL_ID);
    couponForm.reset();
    await loadCoupons(1);
  } catch (error) {
    showError(error.message || "Erro ao criar cupom.");
  } finally {
    loading.hide();
  }
}

function setupNewCouponButton() {
  btnNewCoupon.addEventListener("click", openNewCouponModal);
}

function setupCouponForm() {
  couponForm.addEventListener("submit", handleCouponFormSubmit);
}

function setupModalClose() {
  const closeButtons = document.querySelectorAll('[data-close-modal="coupon-modal"]');
  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      closeModal(COUPON_MODAL_ID);
      couponForm.reset();
    });
  });
}

async function main() {
  try {
    loading.show();
    hideError();

    setupNewCouponButton();
    setupCouponForm();
    setupModalClose();

    await updateNavbar();
    await loadCoupons(currentPage);
  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") {
      window.location.href = "./../auth/login.html";
      return;
    }
    showError(error.message);
  } finally {
    loading.hide();
  }
}

main();