import { register } from "../api/auth.js";
import { loading } from "../components/loading.js";
import { showError, hideError } from "../utils/error.js";
import { validateCpf, validateEmail, validateFullname, validatePassword } from "../utils/validator.js";

const form = document.querySelector("form");
const fullName = document.getElementById("fullName");
const password = document.getElementById("password");
const confirmedPassword = document.getElementById("confirmedPassword");

async function handleFirstStep(event) {
  event.preventDefault();

  const cpf = document.getElementById("cpf").value;
  const email = document.getElementById("email").value;

  try{
    validateFullname(fullName.value);
    validateCpf(cpf);
    validateEmail(email);
  } catch (error){
    showError(error.message);
    return; 
  }

  sessionStorage.setItem(
    "register",
    JSON.stringify({
      name: fullName.value,
      cpf: cpf,
      email: email
    })
  );

  window.location.href = "cadastro2.html";
}

async function handleSecondStep(event) {
  event.preventDefault();

  hideError();

  try{
    validatePassword(password.value)
  } catch (error){
    showError(error.message);
    return;
  }

  if (!confirmedPassword.value){
    showError("Confirme sua senha.");
    return;
  }

  if (password.value !== confirmedPassword.value) {
    showError("As senhas devem ser iguais.");
    return;
  }

  const firstData = JSON.parse(sessionStorage.getItem("register"));

  if (!firstData) {
    window.location.href = "cadastro.html";
    return;
  }

  try {
    loading.show();

    const request = {
      ...firstData,
      password: password.value
    };

    await register(request);

    sessionStorage.removeItem("register");

    window.location.href = "./pages/auth/./pages/auth/login.html";
  } catch (error) {
    showError(error.message);
  } finally {
    loading.hide();
  }
}

if (fullName) {
  form.addEventListener("submit", handleFirstStep);
}

if (password) {
  form.addEventListener("submit", handleSecondStep);
}