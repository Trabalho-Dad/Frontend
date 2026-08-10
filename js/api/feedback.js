import { apiFeedbackFetch } from "./config.js";

export async function getFeedbacksByFigureId(idFigure, page = 1) {
  return apiFeedbackFetch(`/ms-feedback/get/${idFigure}`, {
    query: { page }
  });
}

export async function getFeedbackSummary() {
  return apiFeedbackFetch("/ms-feedback/summary");
}

/**
 * CreateFeedback
 * POST /ms-feedback
 */
export async function createFeedback({ customerId, rating, description, idFigure, idUser }) {
  return apiFeedbackFetch("/ms-feedback", {
    method: "POST",
    body: {
      customer_id: customerId,
      rating,
      description,
      id_figure: idFigure,
      id_user: idUser
    }
  });
}