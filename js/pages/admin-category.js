import {
  findManyCategoriesAdmin,
  findCategoryByIdAdmin,
  createCategory,
  updateCategory,
  toggleCategoryStatus
} from "../api/categories.js";
import { updateNavbar } from "../utils/header-update.js";
import { loading } from "../components/loading.js";
import { hideError, showError } from "../utils/error.js";
import { openModal, closeModal } from "../utils/modal.js";

const CATEGORY_MODAL_ID = "category-modal";

const categoriesTableBody = document.getElementById("categories-table-body");
const categoriesEmpty = document.getElementById("categories-empty");
const categoryForm = document.getElementById("category-form");

const btnNewCategory = document.getElementById("btn-new-category");
const categoryModalTitle = document.getElementById("category-modal-title");

let categoryEditingId = null;

function createTextCell(text, className) {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) {
    td.classList.add(className);
  }
  return td;
}

function createStatusCell(active) {
  const td = document.createElement("td");
  td.classList.add("category-status");

  const badge = document.createElement("span");
  badge.className = `badge-status ${active ? "badge-active" : "badge-inactive"}`;
  badge.textContent = active ? "Ativo" : "Inativo";

  td.appendChild(badge);
  return td;
}

function createActionsCell(category) {
  const td = document.createElement("td");
  td.className = "table-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "icon-action-btn";
  editBtn.title = "Editar";
  editBtn.textContent = "✏️";
  editBtn.addEventListener("click", () => handleEditCategory(category));

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "icon-action-btn";
  toggleBtn.title = category.active ? "Desativar" : "Ativar";
  toggleBtn.textContent = category.active ? "🔴" : "🟢";
  toggleBtn.addEventListener("click", () => handleToggleStatus(category.id, !category.active));

  td.appendChild(editBtn);
  td.appendChild(toggleBtn);
  return td;
}

function renderCategoriesTable(categories) {
  categoriesTableBody.innerHTML = "";
  categoriesEmpty.style.display = categories.length === 0 ? "block" : "none";

  categories.forEach(category => {
    const tr = document.createElement("tr");

    tr.appendChild(createTextCell(category.name, "category-name"));
    tr.appendChild(createTextCell(category.description, "category-description"));
    tr.appendChild(createStatusCell(category.active));
    tr.appendChild(createActionsCell(category));

    categoriesTableBody.appendChild(tr);
  });
}

async function loadCategories() {
  try {
    loading.show();
    hideError();

    const response = await findManyCategoriesAdmin();
    const categories = response.categories ?? response ?? [];

    renderCategoriesTable(categories);
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

function openNewCategoryModal() {
  categoryEditingId = null;
  categoryModalTitle.textContent = "Nova categoria";
  categoryForm.reset();
  document.getElementById("category-id").value = "";
  openModal(CATEGORY_MODAL_ID);
}

async function handleEditCategory(category) {
  try {
    loading.show();

    categoryEditingId = category.id;
    categoryModalTitle.textContent = "Editar categoria";

    document.getElementById("category-id").value = category.id;
    document.getElementById("category-name").value = category.name;
    document.getElementById("category-description").value = category.description;
    document.getElementById("category-active").checked = category.active;

    openModal(CATEGORY_MODAL_ID);
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

async function handleCategoryFormSubmit(event) {
  event.preventDefault();

  const categoryId = document.getElementById("category-id").value;
  const name = document.getElementById("category-name").value.trim();
  const description = document.getElementById("category-description").value.trim();
  const active = document.getElementById("category-active").checked;

  if (!name || !description) {
    showError("Preencha todos os campos.");
    return;
  }

  try {
    loading.show();
    hideError();

    const payload = { name, description, active };

    if (categoryId) {
      await updateCategory(categoryId, payload);
    } else {
      await createCategory(payload);
    }

    closeModal(CATEGORY_MODAL_ID);
    categoryForm.reset();
    categoryEditingId = null;
    await loadCategories();
  } catch (error) {
    showError(error.message || "Erro ao salvar categoria.");
  } finally {
    loading.hide();
  }
}

async function handleToggleStatus(categoryId, newStatus) {
  if (!confirm(`Tem certeza que deseja ${newStatus ? "ativar" : "desativar"} esta categoria?`)) {
    return;
  }

  try {
    loading.show();
    hideError();

    await toggleCategoryStatus(categoryId, newStatus);
    await loadCategories();
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

function setupNewCategoryButton() {
  btnNewCategory.addEventListener("click", openNewCategoryModal);
}

function setupCategoryForm() {
  categoryForm.addEventListener("submit", handleCategoryFormSubmit);
}

function setupModalClose() {
  const closeButtons = document.querySelectorAll('[data-close-modal="category-modal"]');
  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      closeModal(CATEGORY_MODAL_ID);
      categoryForm.reset();
      categoryEditingId = null;
    });
  });
}

async function main() {
  try {
    loading.show();
    hideError();

    setupNewCategoryButton();
    setupCategoryForm();
    setupModalClose();

    await updateNavbar();
    await loadCategories();
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