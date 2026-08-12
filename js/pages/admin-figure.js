import {
  findManyFiguresAdmin,
  createFigure,
} from "../api/figures.js";
import { findManyCategoriesAdmin } from "../api/categories.js";
import { findManyCharactersAdmin } from "../api/characters.js";
import { uploadAndRegisterImage } from "../api/images.js";
import { loading } from "../components/loading.js";
import { hideError, showError } from "../utils/error.js";
import { formatPrice } from "../utils/formatters.js";
import { openModal, closeModal } from "../utils/modal.js";
import { uploadImageToCloudinary } from "../api/images.js";
import { updateNavbar } from "../utils/header-update.js";

const FIGURE_MODAL_ID = "figure-modal";

const figuresTableBody = document.getElementById("figures-table-body");
const figuresEmpty = document.getElementById("figures-empty");
const figureForm = document.getElementById("figure-form");

const figureFilterName = document.getElementById("figure-filter-name");
const figureFilterActive = document.getElementById("figure-filter-active");

const figureSelectedCategoryIds = new Set();

let allCharacters = [];
let allCategories = [];
let figureSelectedFiles = [];
let figureMainImageIndex = 0;

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
  figureFilterTimeout = setTimeout(loadFigures, 400);
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

function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
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

async function handleFigureFormSubmit(event) {
  event.preventDefault();

  const characterId = document.getElementById("figure-character").value;
  const name = document.getElementById("figure-name").value.trim();

  if (!characterId) {
    showError("Selecione um personagem.");
    return;
  }

  if (figureSelectedFiles.length === 0) {
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

    const images = await buildFigureImagesPayload();

    await createFigure({
      name,
      description: document.getElementById("figure-description").value.trim(),
      price: Number(document.getElementById("figure-price").value),
      quantity: Number(document.getElementById("figure-quantity").value),
      active: document.getElementById("figure-active").checked,
      characterId,
      imageIds: [],
      accessoryIds: [],
      categoryIds: Array.from(figureSelectedCategoryIds),
      images,
    });

    closeModal(FIGURE_MODAL_ID);
    resetFigureForm();
    await loadFigures();
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
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

function resetFigureForm() {
  figureForm.reset();
  figureSelectedCategoryIds.clear();
  revokeFigurePreviewUrls();
  figureSelectedFiles = [];
  figureMainImageIndex = 0;
  renderFigureCategoriesChecklist();
  renderFigureImagesPreview();
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

async function loadFigures() {
  try {
    loading.show();
    hideError();

    const response = await findManyFiguresAdmin({
      name: figureFilterName.value.trim() || undefined,
      active: figureFilterActive.value || undefined,
      take: 100,
    });

    renderFiguresTable(response.figures ?? []);
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

function buildImageCell(figure) {
  const td = document.createElement("td");
  const img = document.createElement("img");
  img.className = "thumb";
  img.src = figure.mainImage?.url ?? "";
  img.alt = figure.name;
  td.appendChild(img);
  return td;
}

function buildTextCell(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

function buildStatusCell(figure) {
  const td = document.createElement("td");
  const span = document.createElement("span");
  span.className = `badge-status ${figure.active ? "badge-active" : "badge-inactive"}`;
  span.textContent = figure.active ? "Ativo" : "Inativo";
  td.appendChild(span);
  return td;
}

function buildQuantityButton(figure, delta, label, title, figures) {
  const button = document.createElement("button");
  button.className = "icon-action-btn";
  button.title = title;
  button.textContent = label;
  button.addEventListener("click", () =>
    handleQuantityChange(figure.id, delta, figures)
  );
  return button;
}

function buildActionsCell(figure, figures) {
  const td = document.createElement("td");
  td.className = "table-actions";
  td.appendChild(buildQuantityButton(figure, 1, "+1", "Aumentar estoque", figures));
  td.appendChild(buildQuantityButton(figure, -1, "-1", "Diminuir estoque", figures));
  return td;
}

function buildFigureRow(figure, figures) {
  const tr = document.createElement("tr");
  tr.appendChild(buildImageCell(figure));
  tr.appendChild(buildTextCell(figure.name));
  tr.appendChild(buildTextCell(formatPrice(figure.price)));
  tr.appendChild(buildTextCell(figure.quantity));
  tr.appendChild(buildStatusCell(figure));
  tr.appendChild(buildActionsCell(figure, figures));
  return tr;
}

function renderFiguresTable(figures) {
  clearContainer(figuresTableBody);
  figuresEmpty.style.display = figures.length === 0 ? "block" : "none";

  figures.forEach(figure => {
    figuresTableBody.appendChild(buildFigureRow(figure, figures));
  });
}

async function handleQuantityChange(figureId, delta, figures) {
  const figure = figures.find(f => f.id === figureId);
  if (!figure) return;

  const newQuantity = figure.quantity + delta;
  if (newQuantity < 0) return;

  try {
    loading.show();
    hideError();

    await updateFigureQuantity(figureId, newQuantity);
    await loadFigures();
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

async function uploadFigureImages(figureName) {
  const orderedFiles = [
    figureSelectedFiles[figureMainImageIndex],
    ...figureSelectedFiles.filter((_, index) => index !== figureMainImageIndex),
  ];

  const uploaded = [];
  for (const [index, item] of orderedFiles) {
    const image = await uploadAndRegisterImage(item.file, {
      description: figureName,
      imageType: index == 1 ? "PRIMARY_FIGURE" : "SECONDARY_FIGURE",
    });
    uploaded.push(image);
  }

  return uploaded.map(image => image.id);
}

function setupFilters() {
  figureFilterName.addEventListener("input", debounceFilter);
  figureFilterActive.addEventListener("change", loadFigures);
}

function setupNewFigureButton() {
  document.getElementById("btn-new-figure").addEventListener("click", () => {
    resetFigureForm();
    openModal(FIGURE_MODAL_ID);
  });
}

function setupFigureImagesInput() {
  document.getElementById("figure-images-input")
    .addEventListener("change", handleFigureImagesInputChange);
}

async function main() {
  try {
    loading.show();
    hideError();

    await updateNavbar();

    setupFilters();
    setupNewFigureButton();
    setupFigureImagesInput();
    figureForm.addEventListener("submit", handleFigureFormSubmit);

    await loadReferenceData();
    await loadFigures();
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
