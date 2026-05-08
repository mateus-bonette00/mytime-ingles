import TokenService from '../services/tokenService.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';

/**
 * Middleware de autenticacao
 * Verifica se o usuario possui um token JWT valido do tipo 'auth'
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token nao fornecido' });
    }

    const token = TokenService.extractTokenFromHeader(authHeader);
    const decoded = TokenService.verifyToken(token);

    // Verify token type - only accept auth tokens
    if (decoded.type && decoded.type !== 'auth') {
      return res.status(401).json({ error: 'Token invalido para esta operacao' });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuario nao encontrado' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.message === 'Token expirado') {
      return res.status(401).json({ error: 'Token expirado' });
    }

    return res.status(401).json({ error: 'Token invalido' });
  }
};

/**
 * Middleware opcional de autenticacao
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = TokenService.extractTokenFromHeader(authHeader);
    const decoded = TokenService.verifyToken(token);

    if (decoded.type && decoded.type !== 'auth') return next();

    const user = await User.findById(decoded.id);
    if (user) {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }
    next();
  } catch {
    next();
  }
};

/**
 * Middleware para verificar se o usuario e admin
 * Deve ser usado APOS o middleware authenticate
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nao autenticado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  next();
};

/**
 * Middleware para verificar se o usuario e estudante
 */
export const isStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nao autenticado' });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Este recurso e apenas para estudantes' });
  }

  next();
};

/**
 * Middleware para verificar se o usuario tem compra ativa (pagamento aprovado)
 * Admins sao liberados automaticamente
 * Deve ser usado APOS authenticate
 */
export const hasActivePurchase = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Nao autenticado' });
    }

    // Admins bypass purchase check
    if (req.user.role === 'admin') {
      return next();
    }

    // Check by user_id
    const purchases = await Purchase.findByUserId(req.user.id);
    const hasApproved = purchases.some(p => p.payment_status === 'approved');

    if (hasApproved) {
      return next();
    }

    // Fallback: check by email
    const byEmail = await Purchase.findByEmail(req.user.email);
    const hasApprovedByEmail = byEmail.some(p => p.payment_status === 'approved');

    if (hasApprovedByEmail) {
      return next();
    }

    return res.status(403).json({
      error: 'Acesso negado',
      code: 'NO_ACTIVE_PURCHASE',
      message: 'Voce precisa de uma compra ativa para acessar este recurso',
    });
  } catch (error) {
    console.error('Erro ao verificar compra:', error.message);
    return res.status(500).json({ error: 'Erro ao verificar acesso' });
  }
};

/**
 * Middleware para verificar se o usuario pode acessar seus proprios dados
 * ou se e admin
 */
export const canAccessUserData = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Nao autenticado' });
  }

  const requestedUserId = parseInt(req.params.userId || req.params.id);

  // Admin pode acessar dados de qualquer usuario
  if (req.user.role === 'admin') {
    return next();
  }

  // Usuario so pode acessar seus proprios dados
  if (req.user.id !== requestedUserId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  next();
};

export default { authenticate, optionalAuth, isAdmin, isStudent, hasActivePurchase, canAccessUserData };
