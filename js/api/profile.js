import { apiFetch } from "./config.js";

export async function getMyUser() {
  const cached = sessionStorage.getItem("logged");

  if (cached) return JSON.parse(cached).user;

  try {
    const user = await apiFetch("/api/profile/me");

    sessionStorage.setItem("logged", JSON.stringify({ user }));

    return user;
  } catch (error) {
    if (error.message === "LOGIN_REQUIRED") throw error;
    throw new Error(error.message ?? "Erro ao buscar usuário.");
  }
}