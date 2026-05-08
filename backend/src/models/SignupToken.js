import pool from '../config/database.js';
import crypto from 'crypto';

class SignupToken {
  /**
   * Gerar token único
   */
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Gerar código de verificação de 6 dígitos
   */
  static generateVerificationCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  /**
   * Hash do código de verificação
   */
  static hashVerificationCode(code) {
    return crypto.createHash('sha256').update(String(code)).digest('hex');
  }

  /**
   * Criar novo token de cadastro
   */
  static async create({ email, name, purchase_id, expiresInHours = 48 }) {
    const token = this.generateToken();
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + expiresInHours);

    const result = await pool.query(
      `INSERT INTO signup_tokens (token, email, name, purchase_id, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [token, email, name, purchase_id, expires_at]
    );

    return result.rows[0];
  }

  /**
   * Buscar token
   */
  static async findByToken(token) {
    const result = await pool.query(
      'SELECT * FROM signup_tokens WHERE token = $1',
      [token]
    );

    return result.rows[0] || null;
  }

  /**
   * Validar token
   */
  static async validate(token) {
    const tokenData = await this.findByToken(token);

    if (!tokenData) {
      return { valid: false, error: 'Token não encontrado' };
    }

    if (tokenData.used) {
      return { valid: false, error: 'Token já foi utilizado' };
    }

    if (new Date() > new Date(tokenData.expires_at)) {
      return { valid: false, error: 'Token expirado' };
    }

    return { valid: true, tokenData };
  }

  /**
   * Marcar token como usado
   */
  static async markAsUsed(token) {
    const result = await pool.query(
      `UPDATE signup_tokens
       SET used = true,
           verification_code_hash = NULL,
           verification_code_expires_at = NULL,
           verification_code_attempts = 0,
           verification_code_sent_at = NULL
       WHERE token = $1
       RETURNING *`,
      [token]
    );

    return result.rows[0] || null;
  }

  /**
   * Buscar tokens por e-mail
   */
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM signup_tokens WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );

    return result.rows;
  }

  /**
   * Buscar tokens por purchase_id
   */
  static async findByPurchaseId(purchase_id) {
    const result = await pool.query(
      'SELECT * FROM signup_tokens WHERE purchase_id = $1',
      [purchase_id]
    );

    return result.rows[0] || null;
  }

  /**
   * Limpar tokens expirados (pode ser executado periodicamente)
   */
  static async deleteExpired() {
    const result = await pool.query(
      'DELETE FROM signup_tokens WHERE expires_at < NOW() AND used = false RETURNING id'
    );

    return result.rows.length;
  }

  /**
   * Deletar token
   */
  static async delete(token) {
    const result = await pool.query(
      'DELETE FROM signup_tokens WHERE token = $1 RETURNING id',
      [token]
    );

    return result.rows[0] || null;
  }

  /**
   * Contar tokens ativos (não usados e não expirados)
   */
  static async countActive() {
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM signup_tokens WHERE used = false AND expires_at > NOW()'
    );

    return parseInt(result.rows[0].total);
  }

  /**
   * Salvar código de verificação para o token
   */
  static async saveVerificationCode(token, code, expiresInMinutes = 60) {
    const verification_code_hash = this.hashVerificationCode(code);
    const verification_code_expires_at = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const result = await pool.query(
      `UPDATE signup_tokens
       SET verification_code_hash = $1,
           verification_code_expires_at = $2,
           verification_code_attempts = 0,
           verification_code_sent_at = NOW()
       WHERE token = $3
       RETURNING id, token, email, name, verification_code_expires_at, verification_code_sent_at`,
      [verification_code_hash, verification_code_expires_at, token]
    );

    return result.rows[0] || null;
  }

  /**
   * Limpar código de verificação (obrigar novo envio)
   */
  static async clearVerificationCode(token) {
    const result = await pool.query(
      `UPDATE signup_tokens
       SET verification_code_hash = NULL,
           verification_code_expires_at = NULL,
           verification_code_attempts = 0,
           verification_code_sent_at = NULL
       WHERE token = $1
       RETURNING id`,
      [token]
    );

    return result.rows[0] || null;
  }

  /**
   * Validar código de verificação
   */
  static async validateVerificationCode(token, code, maxAttempts = 5) {
    const tokenData = await this.findByToken(token);

    if (!tokenData) {
      return { valid: false, error: 'Token não encontrado' };
    }

    if (tokenData.used) {
      return { valid: false, error: 'Token já foi utilizado' };
    }

    if (!tokenData.verification_code_hash || !tokenData.verification_code_expires_at) {
      return { valid: false, error: 'Solicite um código de verificação por e-mail' };
    }

    if ((tokenData.verification_code_attempts || 0) >= maxAttempts) {
      return { valid: false, error: 'Limite de tentativas atingido. Solicite um novo código' };
    }

    if (new Date() > new Date(tokenData.verification_code_expires_at)) {
      return { valid: false, error: 'Código de verificação expirado. Solicite um novo código' };
    }

    const providedHash = this.hashVerificationCode(code);
    if (providedHash !== tokenData.verification_code_hash) {
      const attemptsResult = await pool.query(
        `UPDATE signup_tokens
         SET verification_code_attempts = COALESCE(verification_code_attempts, 0) + 1
         WHERE token = $1
         RETURNING verification_code_attempts`,
        [token]
      );

      const attempts = attemptsResult.rows[0]?.verification_code_attempts || (tokenData.verification_code_attempts || 0) + 1;

      if (attempts >= maxAttempts) {
        await this.clearVerificationCode(token);
        return {
          valid: false,
          error: 'Código inválido. Limite de tentativas atingido. Solicite um novo código',
        };
      }

      return {
        valid: false,
        error: `Código inválido. Você ainda tem ${maxAttempts - attempts} tentativa(s)`,
      };
    }

    return { valid: true, tokenData };
  }
}

export default SignupToken;
