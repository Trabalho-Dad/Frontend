import { apiFeedbackFetch } from "./config.js";

export async function getFeedbacksByFigureId(idFigure, page = 1) {
  return apiFeedbackFetch(`/ms-feedback/get/${idFigure}`, {
    query: { page }
  });
}

export async function getFeedbackSummary(idFigure) {
  return apiFeedbackFetch(`/ms-feedback/summary/${idFigure}`);
}

export async function createFeedback({ rating, description, idFigure, idUser }) {
  return apiFeedbackFetch("/ms-feedback", {
    method: "POST",
    body: {
      rating,
      description,
      idFigure,
      idUser: idUser
    }
  });
}