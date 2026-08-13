export const loading = (() => {
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";
  overlay.id = "loading-overlay";

  const spinner = document.createElement("div");
  spinner.className = "loading-spinner";

  overlay.appendChild(spinner);

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