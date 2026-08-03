export function validateCpf(cpf){
  if (!cpf) throw new Error("O CPF é obrigatório.");
  if (!cpf.match(/^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/)) throw new Error("O CPF deve estar no formato 99999999999 ou 999.999.999-99.");
}

export function validateFullname(name){
  if (!name) throw new Error("Digite seu nome completo.");
  if (!name.match(/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)*$/)) throw new Error("O nome deve ter apenas letras e acentos.");
}

export function validateEmail(email){
  if (!email) throw new Error("Digitar o seu email é obrigatório.");
}

export function validatePassword(password){
  if (!password) throw new Error("Digitar a senha é obrigatório.");
  if (!password.match(/\d/)) throw new Error("A senha deve conter um número.");
  if (!password.match(/[a-z]/)) throw new Error("A senha deve ter letras minúsculas.");
  if (!password.match(/[A-Z]/)) throw new Error("A senha deve conter letras maiúsculas.");
  if (password.length > 28) throw new Error("A senha deve ter no máximo 28 caracteres.");
  if (password.length < 8) throw new Error("A senha deve ter no mínimo 8 caracteres.");
}

export function validateCep(cep){
  if (!cep) throw new Error("O CEP é obrigatório.");
  if (!cep.match(/^\d{5}-?\d{3}$/)) throw new Error("O CEP deve estar no formato 99999-999.");
}