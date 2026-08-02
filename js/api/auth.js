import { apiFetch } from "./config.js";

export async function login(email, password) {
  return apiFetch("/api/auth/login", { method: "POST", body: { email, password } });
}

export async function logout() {
  return apiFetch("/api/auth/logout", { method: "POST" });
}

export async function register({ name, cpf, email, password }) {
  return apiFetch("/api/auth/register", { method: "POST", body: { name, cpf, email, password } });
}

export async function sendRecoveryCode(email) {
  return apiFetch(`/api/auth/send-code/${encodeURIComponent(email)}`);
}

export async function validateRecoveryCode(email, code) {
  return apiFetch(`/api/auth/validate-code/${encodeURIComponent(email)}/${code}`);
}

export async function changePassword(email, code, newPassword, confirmPassword) {
  return apiFetch(`/api/auth/change-password/${encodeURIComponent(email)}/${code}`, {
    method: "POST",
    body: { newPassword, confirmPassword }
  });
}
