import { getMyUser } from "./../api/profile.js";
import { loading } from "../components/loading.js";

const navLinks = document.getElementById("nav-links");
const loginLink = document.getElementById("login-link");

function renderAdmin(){
  const link = document.createElement('a');
  link.href = './pages/admin/index.html';
  link.textContent = "Administrativo"

  navLinks.appendChild(link)
}

export async function updateNavbar() {
  try {
    const user = await getMyUser();

    loginLink.href = "./pages/me/profile.html";
    loginLink.textContent = "Meu perfil";

    if (user.role === 'ADMIN') renderAdmin();

    loginLink.classList.add("profile-link");
  } catch (error) {
    loginLink.href = "./pages/auth/login.html";
    loginLink.textContent = "Entrar";
  }
}