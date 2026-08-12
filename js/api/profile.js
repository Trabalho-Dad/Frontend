import { apiFetch } from "./config.js";

export async function getMyUser() {
  try {
    const user = await apiFetch("/api/profile/me");

    sessionStorage.setItem("logged", JSON.stringify({ user }));

    return user;
  } catch (error) {
    sessionStorage.removeItem("logged");
    if (error.message === "LOGIN_REQUIRED") throw error;
    throw new Error(error.message ?? "Erro ao buscar usuário.");
  }
}
