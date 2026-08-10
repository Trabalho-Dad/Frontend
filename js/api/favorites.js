import { apiFeedbackFetch } from "./config.js";

export async function createFavorite({ userId, figureId }) {
  return apiFeedbackFetch("/ms-favorite", {
    method: "POST",
    body: {
      user_id: userId,
      figure_id: figureId
    }
  });
}

export async function getFavoriteByUserAndFigure(userId, figureId) {
  return apiFeedbackFetch(`/ms-favorite/${userId}/${figureId}`);
}

export async function getFavoritesByUser(userId) {
  return apiFeedbackFetch(`/ms-favorite/${userId}`);
}