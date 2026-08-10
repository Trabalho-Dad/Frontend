import { changePassword } from "../api/auth.js";
import { loading } from "../components/loading.js";
import { showError, hideError } from "../utils/error.js";
import { validateCode, validatePassword } from "../utils/validator.js";

const form = document.querySelector("form");
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');

async function handleLogin(event) {
  event.preventDefault();

  try{
    hideError();

    if (!newPassword.value) {
      showError("Digitar a senha é obrigatória.");
      return;
    }

    if (!confirmPassword.value){
      showError("Confirmar a senha é obrigatório.");
      return;
    }

    try{
      validatePassword(newPassword.value.trim());
    } catch (error){
      showError(error)
      return;
    }

    loading.show()

    try {
      const data = JSON.parse(sessionStorage.getItem("reset-password-infos"));

      await changePassword(data.email, data.code, newPassword.value.trim(), confirmPassword.value.trim());

      sessionStorage.removeItem("reset-password-infos");
      
      window.location.href = "./login.html";
    } catch (error) {
      showError(error.message);
    } 
  } catch (error){
    showError(error)
  } finally {
    loading.hide()
  }
}

form.addEventListener("submit", handleLogin);