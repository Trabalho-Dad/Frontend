export const loading = (() => {
  const overlay = document.createElement("div");

  overlay.innerHTML = `
    <div class="loading-spinner"></div>
  `;

  overlay.className = "loading-overlay";

  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(overlay);
  });

  function show() {
    overlay.classList.add("show");
  }

  function hide() {
    overlay.classList.remove("show");
  }

  return { show, hide };
})();