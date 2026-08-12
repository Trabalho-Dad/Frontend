import { getMyUser } from "./../api/profile.js";

const navLinks = document.getElementById("nav-links");
const loginLink = document.getElementById("login-link");
const profileUrl = new URL("../../pages/me/profile.html", import.meta.url).href;
const loginUrl = new URL("../../pages/auth/login.html", import.meta.url).href;
const adminUrl = new URL("../../pages/admin/index.html", import.meta.url).href;
const homeUrl = new URL("../../index.html", import.meta.url).href;
const isAdminPage = window.location.pathname.includes("/pages/admin/");
const ADMIN_EMAIL = "admin@system.com";

function removeAdminLink() {
  navLinks?.querySelector("[data-admin-link]")?.remove();
}

function isAdminUser(user) {
  const role = String(user?.role ?? "").trim().toUpperCase();
  const email = String(user?.email ?? "").trim().toLowerCase();

  return role === "ADMIN" && email === ADMIN_EMAIL;
}

function renderAdmin(){
  if (!navLinks || navLinks.querySelector("[data-admin-link]")) return;

  const link = document.createElement('a');
  link.textContent = "Administrativo"
  link.dataset.adminLink = "true";

  if (isAdminPage) {
    link.href = adminUrl;
    link.classList.add('active');
  } else {
    link.href = adminUrl;
  }

  navLinks.appendChild(link)
}

export async function updateNavbar() {
  try {
    const user = await getMyUser();
    const userIsAdmin = isAdminUser(user);

    removeAdminLink();

    if (!userIsAdmin && isAdminPage) {
      window.location.replace(homeUrl);
      return;
    }

    if (loginLink) {
      loginLink.href = profileUrl;
      loginLink.textContent = "Perfil";
      loginLink.classList.add("profile-link");
    }

    if (userIsAdmin) renderAdmin();

  } catch (error) {
    removeAdminLink();

    if (loginLink) {
      loginLink.href = loginUrl;
      loginLink.textContent = "Entrar";
      loginLink.classList.remove("profile-link");
    }

    if (isAdminPage) {
      sessionStorage.setItem("redirectAfterLogin", window.location.href);
      window.location.replace(loginUrl);
    }
  }
}
