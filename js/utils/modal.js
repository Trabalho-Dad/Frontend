import { hideError } from "./error.js";

const HIDDEN_CLASS = "hidden";

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove(HIDDEN_CLASS);
  document.body.classList.add("modal-open");
}

export function closeModal(modalId) {
  hideError();
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.add(HIDDEN_CLASS);
  document.body.classList.remove("modal-open");
}

function closeModalFromElement(element) {
  const modal = element.closest(".modal-overlay");
  if (modal) closeModal(modal.id);
}

function setupCloseButtons() {
  document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.addEventListener("click", () => closeModalFromElement(button));
  });
}

function setupOverlayDismiss() {
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeModal(overlay.id);
    });
  });
}

function setupEscapeDismiss() {
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    document
      .querySelectorAll(".modal-overlay:not(.hidden)")
      .forEach(overlay => closeModal(overlay.id));
  });
}

function init() {
  setupCloseButtons();
  setupOverlayDismiss();
  setupEscapeDismiss();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}