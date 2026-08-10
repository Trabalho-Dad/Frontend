const errorMessage = document.getElementById("error");

export function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
}

export function hideError() {
  errorMessage.textContent = "";
  errorMessage.classList.remove("show");
}
