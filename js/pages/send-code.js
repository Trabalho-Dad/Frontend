import { sendRecoveryCode } from "../api/auth.js";
import { loading } from "../components/loading.js";
import { showError, hideError } from "../utils/error.js";

const form = document.querySelector("form");
const email = document.getElementById('email');

async function handleLogin(event) {
  event.preventDefault();

  hideError();

  if (!email.value) {
    showError("Digitar seu e-mail é obrigatório.");
    return;
  }

  const emailValue = email.value.trim();

  loading.show()

  

  try {
    await sendRecoveryCode(emailValue);

    sessionStorage.setItem(
      "reset-password-infos",
      JSON.stringify({
        email: emailValue
      })
    );
    
    window.location.href = "./../../pages/auth/validate-code.html";
  } catch (error) {
    showError(error.message);
  } finally{
    loading.hide()
  }
}

form.addEventListener("submit", handleLogin);