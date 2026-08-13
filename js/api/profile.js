import { apiFetch } from "./config.js";

const CACHE_KEY = "astra_user";

function getUserFromCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function saveUserToCache(user) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    sessionStorage.setItem("logged", "true");
  } catch {
    console.warn("Erro ao salvar cache do usuário");
  }
}

function clearUserCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem("logged");
  } catch {
    console.warn("Erro ao limpar cache do usuário");
  }
}

export function getCachedUser() {
  return getUserFromCache();
}

export async function getMyUser() {
  try {
    const user = getCachedUser();

    if (!user) {
      user = await apiFetch("/api/profile/me");
      saveUserToCache(user);
    }
    
    return user;
  } catch (error) {
    clearUserCache();
    if (error.message === "LOGIN_REQUIRED") throw error;
    throw new Error(error.message ?? "Erro ao buscar usuário.");
  }
}

export function logoutUser() {
  clearUserCache();
}