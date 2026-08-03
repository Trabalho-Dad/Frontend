import { getMyUser } from "./../api/profile.js";
import { loading } from "../components/loading.js";

const loginLink = document.getElementById("login-link");

export async function updateNavbar() {
  loading.show()
  try {
    const user = await getMyUser();

    if (user.role = "ADMIN"){
      loginLink.href = "./pages/admin/index.html";
      loginLink.textContent = "Administrativo";
    } else {
      loginLink.href = "perfil.html";
      loginLink.textContent = "Perfil";
    }

    loginLink.classList.add("profile-link");
  } catch (error) {
    loginLink.href = "./pages/auth/login.html";
    loginLink.textContent = "Entrar";
  } finally {
    loading.hide()
  }
}