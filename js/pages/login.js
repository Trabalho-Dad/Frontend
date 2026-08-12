import { login } from "../api/auth.js";
import { loading } from "../components/loading.js";
import { showError, hideError } from "../utils/error.js";

const form = document.querySelector("form");
const email = document.getElementById('email');
const password = document.getElementById('password')

async function handleLogin(event) {
  event.preventDefault();

  hideError();

  const emailValue = email.value.trim();
  const passwordValue = password.value;

  if (!emailValue) {
    showError("Digitar seu e-mail é obrigatório.");
    return;
  }

  if (!passwordValue){
    showError("A senha é obrigatória.")
    return;
  }

  loading.show()

  try {
    await login(emailValue, passwordValue);
    sessionStorage.removeItem("logged");

    const redirect = sessionStorage.getItem("redirectAfterLogin");

    if (redirect) {
      sessionStorage.removeItem("redirectAfterLogin");
      window.location.href = redirect;
    } else {
      window.location.href = "./../../index.html";
    }
  } catch (error) {
    showError(error.message);
  } finally{
    loading.hide()
  }
}

form.addEventListener("submit", handleLogin);
