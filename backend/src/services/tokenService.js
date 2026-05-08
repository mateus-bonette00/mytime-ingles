import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

class TokenService {
  /**
   * Gerar token JWT
   */
  static generateToken(payload, expiresIn = config.jwt.expiresIn) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  }

  /**
   * Verificar e decodificar token JWT
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      }
      throw error;
    }
  }

  /**
   * Decodificar token sem verificar (útil para debug)
   */
  static decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Gerar token de autenticação para usuário
   */
  static generateAuthToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      type: 'auth',
    };

    return this.generateToken(payload);
  }

  /**
   * Gerar token de refresh (validade maior)
   */
  static generateRefreshToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      type: 'refresh',
    };

    return this.generateToken(payload, '7d');
  }

  /**
   * Gerar token de reset de senha
   */
  static generatePasswordResetToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      type: 'password_reset',
    };

    return this.generateToken(payload, '1h');
  }

  /**
   * Verificar se o token é de um tipo específico
   */
  static verifyTokenType(token, expectedType) {
    const decoded = this.verifyToken(token);

    if (decoded.type !== expectedType) {
      throw new Error(`Token inválido. Esperado tipo: ${expectedType}`);
    }

    return decoded;
  }

  /**
   * Extrair token do header Authorization
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new Error('Header de autorização não encontrado');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Formato de token inválido. Use: Bearer <token>');
    }

    return parts[1];
  }
}

export default TokenService;
