import User from '../models/User.js';
import SignupToken from '../models/SignupToken.js';
import PasswordSetToken from '../models/PasswordSetToken.js';
import Progress from '../models/Progress.js';
import Purchase from '../models/Purchase.js';
import TokenService from '../services/tokenService.js';
import emailService from '../services/emailService.js';
import securityLogger from '../services/securityLogger.js';
import {
  isValidEmail,
  isValidCPF,
  normalizeCPF,
  validateRegistrationData,
  validateLoginData,
  validateRequiredFields,
} from '../utils/validators.js';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

/**
 * Login de usuário
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar dados
    const validation = validateLoginData({ email, password });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';

    // Buscar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      securityLogger.logLoginAttempt(email, false, clientIp);
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    // Verificar senha
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      securityLogger.logLoginAttempt(email, false, clientIp);
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }

    securityLogger.logLoginAttempt(email, true, clientIp);

    // Gerar token JWT
    const token = TokenService.generateAuthToken(user);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

/**
 * Validar token de cadastro
 */
export const validateSignupToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token não fornecido' });
    }

    // Validar token
    const validation = await SignupToken.validate(token);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Token inválido',
        message: validation.error,
      });
    }

    // Retornar dados do token
    res.json({
      valid: true,
      name: validation.tokenData.name,
      email: validation.tokenData.email,
    });
  } catch (error) {
    console.error('Erro ao validar token:', error.message);
    res.status(500).json({ error: 'Erro ao validar token' });
  }
};

/**
 * Enviar código de verificação para o e-mail do token
 */
export const sendSignupVerificationCode = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token não fornecido' });
    }

    const validation = await SignupToken.validate(token);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Token inválido',
        message: validation.error,
      });
    }

    const tokenData = validation.tokenData;

    // Rate limit simples por token (1 envio a cada 60s)
    if (tokenData.verification_code_sent_at) {
      const secondsSinceLastSend = Math.floor(
        (Date.now() - new Date(tokenData.verification_code_sent_at).getTime()) / 1000
      );

      if (secondsSinceLastSend < 60) {
        const retryAfter = 60 - secondsSinceLastSend;
        return res.status(429).json({
          error: `Aguarde ${retryAfter}s para solicitar um novo código`,
        });
      }
    }

    // Não faz sentido enviar código se o usuário já existe
    const existingUser = await User.findByEmail(tokenData.email);
    if (existingUser) {
      return res.status(400).json({
        error: 'E-mail já cadastrado',
        message: 'Já existe uma conta com este e-mail',
      });
    }

    const code = SignupToken.generateVerificationCode();
    await SignupToken.saveVerificationCode(token, code, 60);

    try {
      await emailService.sendSignupVerificationCode({
        name: tokenData.name,
        email: tokenData.email,
        code,
      });
    } catch (emailError) {
      // Evita manter código ativo se não conseguiu enviar o e-mail
      await SignupToken.clearVerificationCode(token);
      throw emailError;
    }

    return res.json({
      message: 'Código de verificação enviado para seu e-mail',
    });
  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error.message);
    return res.status(500).json({ error: 'Erro ao enviar código de verificação' });
  }
};

/**
 * Cadastro de novo usuário (usando token)
 */
export const signup = async (req, res) => {
  try {
    const { token, password, confirmPassword, verificationCode } = req.body;

    // Validar campos obrigatórios
    const requiredCheck = validateRequiredFields(req.body, ['token', 'password', 'confirmPassword', 'verificationCode']);
    if (!requiredCheck.valid) {
      return res.status(400).json({ error: requiredCheck.message });
    }

    // Verificar se as senhas coincidem
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não coincidem' });
    }

    const sanitizedCode = String(verificationCode).trim();
    if (!/^\d{6}$/.test(sanitizedCode)) {
      return res.status(400).json({ error: 'Código de verificação inválido' });
    }

    // Validar token
    const validation = await SignupToken.validate(token);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Token inválido',
        message: validation.error,
      });
    }

    // Validar código de verificação enviado por e-mail
    const codeValidation = await SignupToken.validateVerificationCode(token, sanitizedCode);
    if (!codeValidation.valid) {
      return res.status(400).json({
        error: 'Código de verificação inválido',
        message: codeValidation.error,
      });
    }

    const { name, email } = validation.tokenData;

    // Validar dados de registro
    const dataValidation = validateRegistrationData({ name, email, password });
    if (!dataValidation.valid) {
      return res.status(400).json({ error: dataValidation.message });
    }

    // Verificar se o e-mail já está cadastrado
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'E-mail já cadastrado',
        message: 'Já existe uma conta com este e-mail',
      });
    }

    // Criar usuário
    const newUser = await User.create({
      name,
      email,
      password,
      role: 'student',
    });

    // Inicializar progresso do usuário (50 frases)
    await Progress.initializeForUser(newUser.id);

    // Marcar token como usado
    await SignupToken.markAsUsed(token);

    // Gerar token JWT para login automático
    const authToken = TokenService.generateAuthToken(newUser);

    res.status(201).json({
      message: 'Cadastro realizado com sucesso',
      token: authToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Erro no cadastro:', error.message);
    res.status(500).json({ error: 'Erro ao realizar cadastro' });
  }
};

/**
 * Criar conta com compra aprovada (sem depender de e-mail)
 */
export const claimPurchaseAccess = async (req, res) => {
  try {
    const { purchaseId, email, cpf, password, confirmPassword } = req.body;

    const requiredCheck = validateRequiredFields(req.body, ['purchaseId', 'email', 'cpf', 'password', 'confirmPassword']);
    if (!requiredCheck.valid) {
      return res.status(400).json({ error: requiredCheck.message });
    }

    const parsedPurchaseId = Number.parseInt(String(purchaseId), 10);
    if (!Number.isInteger(parsedPurchaseId) || parsedPurchaseId <= 0) {
      return res.status(400).json({ error: 'ID da compra inválido' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'E-mail inválido' });
    }

    if (!isValidCPF(cpf)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não coincidem' });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedCpf = normalizeCPF(cpf);
    const purchase = await Purchase.findById(parsedPurchaseId);

    if (!purchase) {
      return res.status(404).json({ error: 'Compra não encontrada' });
    }

    if (purchase.payment_status !== 'approved') {
      return res.status(403).json({ error: 'Pagamento ainda não aprovado' });
    }

    if (purchase.user_id) {
      return res.status(409).json({
        error: 'Esta compra já está vinculada a uma conta',
        message: 'Faça login para acessar suas aulas',
      });
    }

    const purchaseEmail = normalizeEmail(purchase.email);
    const purchaseCpf = normalizeCPF(purchase.cpf);

    if (!purchaseCpf || normalizedEmail !== purchaseEmail || normalizedCpf !== purchaseCpf) {
      return res.status(403).json({
        error: 'Dados da compra não conferem',
        message: 'Use o mesmo e-mail e CPF usados no pagamento',
      });
    }

    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        error: 'E-mail já cadastrado',
        message: 'Esta conta já existe. Faça login normalmente',
      });
    }

    const dataValidation = validateRegistrationData({
      name: purchase.name,
      email: normalizedEmail,
      password,
    });

    if (!dataValidation.valid) {
      return res.status(400).json({ error: dataValidation.message });
    }

    const newUser = await User.create({
      name: purchase.name,
      email: normalizedEmail,
      password,
      role: 'student',
    });

    await Progress.initializeForUser(newUser.id);

    const linkedPurchase = await Purchase.attachUserToPurchase(purchase.id, newUser.id);
    if (!linkedPurchase) {
      await User.delete(newUser.id);
      return res.status(409).json({
        error: 'Esta compra já foi utilizada para cadastro',
        message: 'Faça login para continuar',
      });
    }

    const signupToken = await SignupToken.findByPurchaseId(purchase.id);
    if (signupToken && !signupToken.used) {
      await SignupToken.markAsUsed(signupToken.token);
    }

    const authToken = TokenService.generateAuthToken(newUser);

    return res.status(201).json({
      message: 'Conta criada com sucesso',
      token: authToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Erro ao liberar acesso por compra:', error.message);
    return res.status(500).json({ error: 'Erro ao criar conta com esta compra' });
  }
};

/**
 * Verificar autenticação (para validar token no frontend)
 */
export const verifyAuth = async (req, res) => {
  try {
    // O middleware authenticate já validou o token e adicionou req.user
    res.json({
      authenticated: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Erro ao verificar autenticacao:', error.message);
    res.status(500).json({ error: 'Erro ao verificar autenticacao' });
  }
};

/**
 * Solicitar reset de senha
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-mail não fornecido' });
    }

    const user = await User.findByEmail(email);

    // Por segurança, sempre retornar sucesso mesmo se o e-mail não existir
    if (!user) {
      return res.json({
        message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha',
      });
    }

    // Gerar token de reset
    const resetToken = TokenService.generatePasswordResetToken(user);

    // Enviar e-mail (implementar quando necessário)
    // await emailService.sendPasswordResetEmail({ name: user.name, email, resetToken });

    res.json({
      message: 'Se o e-mail existir, você receberá instruções para redefinir sua senha',
    });
  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error.message);
    res.status(500).json({ error: 'Erro ao solicitar reset de senha' });
  }
};

/**
 * Reset de senha com token
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    const requiredCheck = validateRequiredFields(req.body, ['token', 'newPassword', 'confirmPassword']);
    if (!requiredCheck.valid) {
      return res.status(400).json({ error: requiredCheck.message });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não coincidem' });
    }

    // Verificar token
    const decoded = TokenService.verifyTokenType(token, 'password_reset');

    // Atualizar senha
    await User.updatePassword(decoded.id, newPassword);

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao resetar senha:', error.message);

    if (error.message.includes('Token')) {
      return res.status(400).json({ error: 'Token invalido ou expirado' });
    }

    res.status(500).json({ error: 'Erro ao resetar senha' });
  }
};

/**
 * Validar token de criação de senha
 */
export const validateSetPasswordToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token não fornecido' });
    }

    const validation = await PasswordSetToken.validate(token);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Token inválido',
        message: validation.error,
      });
    }

    const user = await User.findById(validation.tokenData.user_id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      valid: true,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Erro ao validar token de senha:', error.message);
    res.status(500).json({ error: 'Erro ao validar token' });
  }
};

/**
 * Definir senha com token
 */
export const setPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    const requiredCheck = validateRequiredFields(req.body, ['token', 'password', 'confirmPassword']);
    if (!requiredCheck.valid) {
      return res.status(400).json({ error: requiredCheck.message });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não coincidem' });
    }

    const validation = await PasswordSetToken.validate(token);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Token inválido',
        message: validation.error,
      });
    }

    const user = await User.findById(validation.tokenData.user_id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const dataValidation = validateRegistrationData({
      name: user.name,
      email: user.email,
      password,
    });

    if (!dataValidation.valid) {
      return res.status(400).json({ error: dataValidation.message });
    }

    await User.updatePassword(user.id, password);
    await PasswordSetToken.markAsUsed(token);

    const authToken = TokenService.generateAuthToken(user);

    res.json({
      message: 'Senha definida com sucesso',
      token: authToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro ao definir senha:', error.message);
    res.status(500).json({ error: 'Erro ao definir senha' });
  }
};

export default {
  login,
  validateSignupToken,
  sendSignupVerificationCode,
  signup,
  claimPurchaseAccess,
  verifyAuth,
  requestPasswordReset,
  resetPassword,
  validateSetPasswordToken,
  setPassword,
};
