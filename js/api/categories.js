import { API_ROUTE } from "./config.js";

export async function loadPublicCategories(category){
  const response = await fetch(`${API_ROUTE}/api/categories/find-all`);

  if (!response.ok) {
    throw new Error(`Erro ${response.status}`);
  }

  return await response.json();
}