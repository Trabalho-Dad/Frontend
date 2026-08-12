import {
  findManyCharactersAdmin,
  findCharacterByIdAdmin,
  createCharacter,
  updateCharacter
} from "../api/characters.js";
import { updateNavbar } from "../utils/header-update.js";
import { loading } from "../components/loading.js";
import { hideError, showError } from "../utils/error.js";
import { openModal, closeModal } from "../utils/modal.js";
import { renderPagination } from "../utils/pagination.js";

const CHARACTER_MODAL_ID = "character-modal";
const ITEMS_PER_PAGE = 5;

const charactersTableBody = document.getElementById("characters-table-body");
const charactersEmpty = document.getElementById("characters-empty");
const characterForm = document.getElementById("character-form");

const btnNewCharacter = document.getElementById("btn-new-character");
const characterModalTitle = document.getElementById("character-modal-title");

const charactersPagination = document.getElementById("characters-pagination");

let characterEditingId = null;
let currentPage = 1;

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

function createActionsCell(character) {
  const td = document.createElement("td");
  td.className = "table-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "icon-action-btn";
  editBtn.title = "Editar";
  editBtn.textContent = "✏️";
  editBtn.addEventListener("click", () => handleEditCharacter(character));

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "icon-action-btn";
  toggleBtn.title = character.active ? "Desativar" : "Ativar";
  toggleBtn.textContent = character.active ? "🔴" : "🟢";
  toggleBtn.addEventListener("click", () => handleToggleStatus(character.id, !character.active));

  td.appendChild(editBtn);
  td.appendChild(toggleBtn);
  return td;
}

function renderCharactersTable(characters) {
  charactersTableBody.innerHTML = "";
  charactersEmpty.style.display = characters.length === 0 ? "block" : "none";

  characters.forEach(character => {
    const tr = document.createElement("tr");

    tr.appendChild(createTextCell(character.name));
    tr.appendChild(createTextCell(character.description));
    tr.appendChild(createStatusCell(character.active));
    tr.appendChild(createActionsCell(character));

    charactersTableBody.appendChild(tr);
  });
}

async function loadCharacters(page = 1) {
  try {
    loading.show();
    hideError();

    const response = await findManyCharactersAdmin({ page, take: ITEMS_PER_PAGE });
    const characters = response.characters ?? response ?? [];
    const totalPages = response.totalPages;

    currentPage = page;
    renderCharactersTable(characters);
    renderPagination(charactersPagination, {
      currentPage,
      totalPages,
      onPageChange: loadCharacters
    });
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

function openNewCharacterModal() {
  characterEditingId = null;
  characterModalTitle.textContent = "Novo personagem";
  characterForm.reset();
  document.getElementById("character-id").value = "";
  openModal(CHARACTER_MODAL_ID);
}

async function handleEditCharacter(character) {
  try {
    loading.show();

    characterEditingId = character.id;
    characterModalTitle.textContent = "Editar personagem";

    document.getElementById("character-id").value = character.id;
    document.getElementById("character-name").value = character.name;
    document.getElementById("character-description").value = character.description;
    document.getElementById("character-active").checked = character.active;

    openModal(CHARACTER_MODAL_ID);
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

async function handleCharacterFormSubmit(event) {
  event.preventDefault();

  const characterId = document.getElementById("character-id").value;
  const name = document.getElementById("character-name").value.trim();
  const description = document.getElementById("character-description").value.trim();
  const active = document.getElementById("character-active").checked;

  if (!name || !description) {
    showError("Preencha todos os campos.");
    return;
  }

  try {
    loading.show();
    hideError();

    const payload = { name, description, active };

    if (characterId) {
      await updateCharacter(characterId, payload);
    } else {
      await createCharacter(payload);
    }

    closeModal(CHARACTER_MODAL_ID);
    characterForm.reset();
    characterEditingId = null;
    await loadCharacters(1);
  } catch (error) {
    showError(error.message || "Erro ao salvar personagem.");
  } finally {
    loading.hide();
  }
}

async function handleToggleStatus(characterId, newStatus) {
  if (!confirm(`Tem certeza que deseja ${newStatus ? "ativar" : "desativar"} este personagem?`)) {
    return;
  }

  try {
    loading.show();
    hideError();

    const character = await findCharacterByIdAdmin(characterId);

    await updateCharacter(characterId, {
      name: character.name,
      description: character.description,
      active: newStatus
    });

    await loadCharacters(currentPage);
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

function setupNewCharacterButton() {
  btnNewCharacter.addEventListener("click", openNewCharacterModal);
}

function setupCharacterForm() {
  characterForm.addEventListener("submit", handleCharacterFormSubmit);
}

function setupModalClose() {
  const closeButtons = document.querySelectorAll('[data-close-modal="character-modal"]');
  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      closeModal(CHARACTER_MODAL_ID);
      characterForm.reset();
      characterEditingId = null;
    });
  });
}

async function main() {
  try {
    loading.show();
    hideError();

    setupNewCharacterButton();
    setupCharacterForm();
    setupModalClose();

    await updateNavbar();
    await loadCharacters(currentPage);
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