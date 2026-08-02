import { API_ROUTE } from "./config.js";

export async function getMyUser() {
  const response = await fetch(`${API_ROUTE}/api/profile/me`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Não foi possível buscar o usuário.");
  }

  return await response.json();
}