import { validateCep } from "./validator.js";

const CEP_REMETENTE = "05120-060";

export function normalizeCep(cep) {
  return (cep ?? "").replace(/\D/g, "");
}

export async function lookupCep(cep) {
  const cleanCep = normalizeCep(cep);

  validateCep(cleanCep);

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP.");
  }

  const data = await response.json();

  if (data.erro) {
    throw new Error("CEP não encontrado.");
  }

  return {
    cep: cleanCep,
    state: data.estado,
    city: data.localidade,
    neighborhood: data.bairro,
    street: data.logradouro
  };
}

async function fetchShippingQuote(height, width, length, weight, value, cepDest) {
  const response = await fetch("https://cepcerto.com/widget_frete/api/cotacao", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      altura: height,
      cep_destinatario: cepDest,
      cep_remetente: CEP_REMETENTE,
      comprimento: length,
      largura: width,
      peso: weight,
      valor_encomenda: value
    })
  });

  if (!response.ok) {
    let message = "Erro ao calcular frete.";

    try {
      const error = await response.json();
      message = error.message ?? message;
    } catch (_) {}

    throw new Error(message);
  }

  return await response.json();
}

export async function calculateShippingCost(cepDest, price) {
  const destination = await lookupCep(cepDest);

  const response = await fetchShippingQuote(
    20,
    10,
    10,
    0.5,
    price,
    cepDest
  );

  return {
    cost: response.frete.valor_loggi,
    estimatedDeliveryDays: response.frete.prazo_loggi,
    destination,
    cepRemetente: CEP_REMETENTE
  };
}