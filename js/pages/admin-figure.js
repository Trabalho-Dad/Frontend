import {
  findManyFiguresAdmin,
  createFigure,
  updateFigure
} from "../api/figures.js";
import { findManyCategoriesAdmin } from "../api/categories.js";
import { findManyCharactersAdmin } from "../api/characters.js";
import { uploadImageToCloudinary } from "../api/images.js";
import { loading } from "../components/loading.js";
import { hideError, showError } from "../utils/error.js";
import { formatPrice } from "../utils/formatters.js";
import { openModal, closeModal } from "../utils/modal.js";
import { uploadImageToCloudinary } from "../api/images.js";
import { updateNavbar } from "../utils/header-update.js";
import { renderPagination } from "../utils/pagination.js";

const FIGURE_MODAL_ID = "figure-modal";
const ITEMS_PER_PAGE = 5;

const figuresTableBody = document.getElementById("figures-table-body");
const figuresEmpty = document.getElementById("figures-empty");
const figuresPagination = document.getElementById("figures-pagination");
const figureForm = document.getElementById("figure-form");
const figureModalTitle = document.getElementById("figure-modal-title");
const figureImagesGroup = document.getElementById("figure-images-input").closest(".form-group");

const figureFilterName = document.getElementById("figure-filter-name");
const figureFilterActive = document.getElementById("figure-filter-active");

const figureSelectedCategoryIds = new Set();

let allCharacters = [];
let allCategories = [];
let figureSelectedFiles = [];
let figureMainImageIndex = 0;
let figureEditingId = null;
let currentPage = 1;

let figureFilterTimeout = null;

const figureUploadedImagesCache = new Map();

function getFileSignature(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

async function uploadImageIfNeeded(file) {
  const signature = getFileSignature(file);

  if (figureUploadedImagesCache.has(signature)) {
    return figureUploadedImagesCache.get(signature);
  }

  const cloudinaryResult = await uploadImageToCloudinary(file);
  figureUploadedImagesCache.set(signature, cloudinaryResult);
  return cloudinaryResult;
}

function debounceFilter() {
  clearTimeout(figureFilterTimeout);
  figureFilterTimeout = setTimeout(() => loadFigures(1), 400);
}

function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function renderFigureCharacterSelect() {
  const select = document.getElementById("figure-character");
  select.innerHTML = `<option value="">Selecione...</option>`;

  allCharacters.forEach(character => {
    const opt = document.createElement("option");
    opt.value = character.id;
    opt.textContent = character.name;
    select.appendChild(opt);
  });
}

function renderFigureCategoriesChecklist() {
  const container = document.getElementById("figure-categories-checklist");
  clearContainer(container);

  if (allCategories.length === 0) {
    const hint = document.createElement("p");
    hint.className = "admin-hint";
    hint.style.margin = "0";
    hint.textContent = "Cadastre uma categoria primeiro.";
    container.appendChild(hint);
    return;
  }

  allCategories.forEach(category => {
    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = category.id;
    checkbox.checked = figureSelectedCategoryIds.has(category.id);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) figureSelectedCategoryIds.add(category.id);
      else figureSelectedCategoryIds.delete(category.id);
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${category.name}`));

    container.appendChild(label);
  });
}

function revokeFigurePreviewUrls() {
  figureSelectedFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
}

function renderFigureImagesPreview() {
  const container = document.getElementById("figure-images-preview");
  clearContainer(container);

  figureSelectedFiles.forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "image-preview-item" + (index === figureMainImageIndex ? " is-main" : "");

    const img = document.createElement("img");
    img.src = item.previewUrl;
    img.alt = item.file.name;
    img.title = "Clique para definir como imagem principal";
    img.addEventListener("click", () => {
      figureMainImageIndex = index;
      renderFigureImagesPreview();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      URL.revokeObjectURL(item.previewUrl);
      figureSelectedFiles.splice(index, 1);
      if (figureMainImageIndex >= figureSelectedFiles.length) {
        figureMainImageIndex = 0;
      }
      renderFigureImagesPreview();
    });

    const descInput = document.createElement("input");
    descInput.type = "text";
    descInput.className = "image-desc-input";
    descInput.placeholder = "Descrição da imagem";
    descInput.required = true;
    descInput.value = item.description;
    descInput.addEventListener("input", () => {
      item.description = descInput.value;
    });

    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    wrapper.appendChild(descInput);

    if (index === figureMainImageIndex) {
      const tag = document.createElement("span");
      tag.className = "main-tag";
      tag.textContent = "Principal";
      wrapper.appendChild(tag);
    }

    container.appendChild(wrapper);
  });
}

function handleFigureImagesInputChange(event) {
  const files = Array.from(event.target.files ?? []);
  if (files.length === 0) return;

  const newItems = files.map(file => ({
    file,
    previewUrl: URL.createObjectURL(file),
    description: "",
  }));

  figureSelectedFiles = figureSelectedFiles.concat(newItems);
  event.target.value = "";
  renderFigureImagesPreview();
}

async function buildFigureImagesPayload() {
  const orderedFiles = [
    figureSelectedFiles[figureMainImageIndex],
    ...figureSelectedFiles.filter((_, index) => index !== figureMainImageIndex),
  ];

  const images = [];
  for (const [index, item] of orderedFiles.entries()) {
    const cloudinaryResult = await uploadImageIfNeeded(item.file);
    images.push({
      description: item.description,
      url: cloudinaryResult.secure_url,
      imageType: index === 0 ? "PRIMARY_FIGURE" : "SECONDARY_FIGURE",
    });
  }

  return images;
}

function resetFigureForm() {
  figureForm.reset();
  figureEditingId = null;
  figureSelectedCategoryIds.clear();
  revokeFigurePreviewUrls();
  figureSelectedFiles = [];
  figureMainImageIndex = 0;
  figureImagesGroup.style.display = "";
  renderFigureCategoriesChecklist();
  renderFigureImagesPreview();
}

function openNewFigureModal() {
  resetFigureForm();
  figureModalTitle.textContent = "Nova figura";
  openModal(FIGURE_MODAL_ID);
}

async function handleEditFigure(figure) {
  try {
    loading.show();

    figureEditingId = figure.id;
    figureModalTitle.textContent = "Editar figura";

    document.getElementById("figure-character").value = figure.characterId ?? figure.character?.id ?? "";
    document.getElementById("figure-name").value = figure.name;
    document.getElementById("figure-description").value = figure.description;
    document.getElementById("figure-price").value = figure.price;
    document.getElementById("figure-quantity").value = figure.quantity;
    document.getElementById("figure-active").checked = figure.active;

    figureSelectedCategoryIds.clear();
    (figure.categories ?? []).forEach(category => figureSelectedCategoryIds.add(category.id));
    renderFigureCategoriesChecklist();

    revokeFigurePreviewUrls();
    figureSelectedFiles = [];
    figureMainImageIndex = 0;
    figureImagesGroup.style.display = "none";
    renderFigureImagesPreview();

    openModal(FIGURE_MODAL_ID);
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

async function handleFigureFormSubmit(event) {
  event.preventDefault();

  const isEditing = Boolean(figureEditingId);

  const characterId = document.getElementById("figure-character").value;
  const name = document.getElementById("figure-name").value.trim();
  const description = document.getElementById("figure-description").value.trim();
  const price = Number(document.getElementById("figure-price").value);
  const quantity = Number(document.getElementById("figure-quantity").value);
  const active = document.getElementById("figure-active").checked;

  if (!characterId) {
    showError("Selecione um personagem.");
    return;
  }

  if (!isEditing && figureSelectedFiles.length === 0) {
    showError("Selecione ao menos uma imagem.");
    return;
  }

  if (figureSelectedFiles.some(item => !item.description.trim())) {
    showError("Preencha a descrição de todas as imagens.");
    return;
  }

  try {
    loading.show();
    hideError();

    const images = figureSelectedFiles.length > 0 ? await buildFigureImagesPayload() : undefined;

    const payload = {
      name,
      description,
      price,
      quantity,
      active,
      characterId,
      accessoryIds: [],
      categoryIds: Array.from(figureSelectedCategoryIds),
    };

    if (isEditing) {
      await updateFigure(figureEditingId, { ...payload, images });
    } else {
      await createFigure({ ...payload, imageIds: [], images });
    }

    closeModal(FIGURE_MODAL_ID);
    resetFigureForm();
    await loadFigures(1);
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

async function loadReferenceData() {
  const [categoriesResponse, charactersResponse] = await Promise.all([
    findManyCategoriesAdmin(),
    findManyCharactersAdmin(),
  ]);

  allCategories = categoriesResponse.categories ?? categoriesResponse ?? [];
  allCharacters = charactersResponse.characters ?? charactersResponse ?? [];

  renderFigureCharacterSelect();
}

function createImageCell(figure) {
  const td = document.createElement("td");
  const img = document.createElement("img");
  img.className = "thumb";
  img.src = figure.mainImage?.url ?? "";
  img.alt = figure.name;
  td.appendChild(img);
  return td;
}

function createTextCell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function createStatusCell(active) {
  const td = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `badge-status ${active ? "badge-active" : "badge-inactive"}`;
  badge.textContent = active ? "Ativo" : "Inativo";
  td.appendChild(badge);
  return td;
}

function createActionsCell(figure) {
  const td = document.createElement("td");
  td.className = "table-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "icon-action-btn";
  editBtn.title = "Editar";
  editBtn.textContent = "✏️";
  editBtn.addEventListener("click", () => handleEditFigure(figure));

  td.appendChild(editBtn);
  return td;
}

function createFigureRow(figure) {
  const tr = document.createElement("tr");
  tr.appendChild(createImageCell(figure));
  tr.appendChild(createTextCell(figure.name));
  tr.appendChild(createTextCell(formatPrice(figure.price)));
  tr.appendChild(createTextCell(figure.quantity));
  tr.appendChild(createStatusCell(figure.active));
  tr.appendChild(createActionsCell(figure));
  return tr;
}

function renderFiguresTable(figures) {
  clearContainer(figuresTableBody);
  figuresEmpty.style.display = figures.length === 0 ? "block" : "none";

  figures.forEach(figure => {
    figuresTableBody.appendChild(createFigureRow(figure));
  });
}

async function loadFigures(page = 1) {
  try {
    loading.show();
    hideError();

    const response = await findManyFiguresAdmin({
      name: figureFilterName.value.trim() || undefined,
      active: figureFilterActive.value || undefined,
      page,
      take: ITEMS_PER_PAGE,
    });

    const figures = response.figures ?? [];
    const totalPages = response.totalPages ?? Math.ceil((response.total ?? figures.length) / ITEMS_PER_PAGE);

    currentPage = page;
    renderFiguresTable(figures);
    renderPagination(figuresPagination, {
      currentPage,
      totalPages,
      onPageChange: loadFigures
    });
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

function setupFilters() {
  figureFilterName.addEventListener("input", debounceFilter);
  figureFilterActive.addEventListener("change", () => loadFigures(1));
}

function setupNewFigureButton() {
  document.getElementById("btn-new-figure").addEventListener("click", openNewFigureModal);
}

function setupFigureImagesInput() {
  document.getElementById("figure-images-input")
    .addEventListener("change", handleFigureImagesInputChange);
}

function setupModalClose() {
  const closeButtons = document.querySelectorAll('[data-close-modal="figure-modal"]');
  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      closeModal(FIGURE_MODAL_ID);
      resetFigureForm();
    });
  });
}

async function main() {
  try {
    loading.show();
    hideError();

    await updateNavbar();

    setupFilters();
    setupNewFigureButton();
    setupFigureImagesInput();
    setupModalClose();
    figureForm.addEventListener("submit", handleFigureFormSubmit);

    await updateNavbar();
    await loadReferenceData();
    await loadFigures(currentPage);
  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") {
      window.location.href = "./../login.html";
      return;
    }
    showError(error.message);
  } finally {
    loading.hide();
  }
}

main();
