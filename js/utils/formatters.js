export function formatPrice(price) {
  return Number(price ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function formatCep(cep) {
  const clean = (cep ?? "").replace(/\D/g, "");
  if (clean.length !== 8) return cep ?? "";
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}

export function formatCpf(cpf) {
  const clean = (cpf ?? "").replace(/\D/g, "");
  if (clean.length !== 11) return cpf ?? "";
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}