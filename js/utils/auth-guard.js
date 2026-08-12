import { getMyUser } from "../api/profile.js";

const LOGIN_URL = new URL("../../pages/auth/login.html", import.meta.url).href;

export async function requireLogin() {
  try {
    await getMyUser();
    return true;
  } catch (_) {
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.href = LOGIN_URL;
    return false;
  }
}
