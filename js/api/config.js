export const API_ROUTE = "https://astra-37n1.onrender.com";
export const FEEDBACK_API_ROUTE = "https://ms-user-engagement.onrender.com"

export const CLOUDINARY_CLOUD_NAME = "dmab5ocrc";
export const CLOUDINARY_UPLOAD_PRESET = "produtos_upload";
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export async function apiFetch(path, { method = "GET", body, query, headers = {} } = {}) {
  let url = `${API_ROUTE}${path}`;

  if (query && Object.keys(query).length > 0) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
  }

  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if ((response.status === 401 || response.status === 403) && !path.match(/auth/)) {
    const err = new Error("LOGIN_REQUIRED");
    err.status = response.status;
    throw err;
  }

  if (!response.ok) {
    let message = `Ocorreu um erro, tente novamente mais tarde...`;

    try {
      const error = response.status != 500 ? await response.json() : null;
      message = error.message ?? message;
    } catch (_) {}

    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch (_) {
    return null;
  }
}

export async function apiFeedbackFetch(path, { method = "GET", body, query, headers = {} } = {}) {
  let url = `${FEEDBACK_API_ROUTE}${path}`;

  if (query && Object.keys(query).length > 0) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
  }

  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if ((response.status === 401 || response.status === 403) && !path.match(/login/)) {
    const err = new Error("LOGIN_REQUIRED");
    err.status = response.status;
    throw err;
  }

  if (!response.ok) {
    let message = `Erro ${response.status} ao processar a requisição.`;

    try {
      const error = await response.json();
      message = error.message ?? message;
    } catch (_) {}

    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch (_) {
    return null;
  }
}
