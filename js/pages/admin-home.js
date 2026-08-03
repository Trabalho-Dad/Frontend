import { loading } from "../components/loading.js";
import { hideError, showError } from "../utils/error.js";
import { logout } from "../api/auth.js"; 

const logoutButton = document.getElementById("logout-link");

logoutButton.addEventListener("click", async () => {
  try{
    loading.show();

    await logout();

    window.location.href = "./../index.html";
  } catch(error){
    showError(error.message);
  } finally {
    loading.hide();
  }
})