/**
 * Validar formato de e-mail
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar senha forte
 * Mínimo 8 caracteres, 1 maiúscula, 1 número
 */
export const isValidPassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'A senha deve ter no mínimo 8 caracteres' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'A senha deve conter pelo menos um número' };
  }

  return { valid: true };
};

/**
 * Validar CPF
 */
export const isValidCPF = (cpf) => {
  if (!cpf) return true; // CPF é opcional

  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
};

/**
 * Normalizar CPF para somente dígitos
 */
export const normalizeCPF = (cpf) => {
  if (!cpf) return '';
  return String(cpf).replace(/[^\d]/g, '');
};

/**
 * Validar número de frase (1-50)
 */
export const isValidPhraseNumber = (number) => {
  const num = parseInt(number);
  return !isNaN(num) && num >= 1 && num <= 50;
};

/**
 * Sanitizar entrada de texto
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  return text.trim().replace(/[<>]/g, '');
};

/**
 * Formatar CPF (xxx.xxx.xxx-xx)
 */
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Validar URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validar campos obrigatórios
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missing = [];

  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      message: `Campos obrigatórios faltando: ${missing.join(', ')}`,
      missing,
    };
  }

  return { valid: true };
};

/**
 * Validar dados de registro
 */
export const validateRegistrationData = (data) => {
  const { name, email, password } = data;

  // Validar campos obrigatórios
  const requiredCheck = validateRequiredFields(data, ['name', 'email', 'password']);
  if (!requiredCheck.valid) {
    return requiredCheck;
  }

  // Validar e-mail
  if (!isValidEmail(email)) {
    return { valid: false, message: 'E-mail inválido' };
  }

  // Validar senha
  const passwordCheck = isValidPassword(password);
  if (!passwordCheck.valid) {
    return passwordCheck;
  }

  // Validar nome (mínimo 3 caracteres)
  if (name.trim().length < 3) {
    return { valid: false, message: 'Nome deve ter no mínimo 3 caracteres' };
  }

  return { valid: true };
};

/**
 * Validar dados de login
 */
export const validateLoginData = (data) => {
  const { email, password } = data;

  const requiredCheck = validateRequiredFields(data, ['email', 'password']);
  if (!requiredCheck.valid) {
    return requiredCheck;
  }

  if (!isValidEmail(email)) {
    return { valid: false, message: 'E-mail inválido' };
  }

  return { valid: true };
};

/**
 * Validar dados de compra
 */
export const validatePurchaseData = (data) => {
  const { name, email, cpf } = data;

  const requiredCheck = validateRequiredFields(data, ['name', 'email', 'cpf']);
  if (!requiredCheck.valid) {
    return requiredCheck;
  }

  if (!isValidEmail(email)) {
    return { valid: false, message: 'E-mail inválido' };
  }

  // Validar CPF
  if (!cpf || !isValidCPF(cpf)) {
    return { valid: false, message: 'CPF inválido' };
  }

  return { valid: true };
};

export default {
  isValidEmail,
  isValidPassword,
  isValidCPF,
  normalizeCPF,
  isValidPhraseNumber,
  sanitizeText,
  formatCPF,
  isValidUrl,
  validateRequiredFields,
  validateRegistrationData,
  validateLoginData,
  validatePurchaseData,
};
