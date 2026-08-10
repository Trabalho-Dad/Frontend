import { validateRecoveryCode } from "../api/auth.js";
import { loading } from "../components/loading.js";
import { showError, hideError } from "../utils/error.js";
import { validateCode } from "../utils/validator.js";

const form = document.querySelector("form");
const code = document.getElementById('code');

async function handleLogin(event) {
  event.preventDefault();

  try{
    hideError();

    if (!code.value) {
      showError("Digitar o código enviado é obrigatório.");
      return;
    } 

    try{
      validateCode(code.value.trim());
    } catch (error){
      showError(error)
      return;
    }

    const codeValue = code.value.trim();

    loading.show()

    try {
      const data = JSON.parse(sessionStorage.getItem("reset-password-infos"));

      const email = data.email;

      await validateRecoveryCode(email, codeValue);

      sessionStorage.removeItem("reset-password-infos");

      sessionStorage.setItem(
        "reset-password-infos",
        JSON.stringify({
          email: email,
          code: codeValue
        })
      );;
      
      window.location.href = "./../../pages/auth/change-password.html";
    } catch (error) {
      showError(error.message);
    } 
  } catch (error){
    showError("Tente novamente mais tarde!")
  } finally {
    loading.hide()
  }
}

form.addEventListener("submit", handleLogin);