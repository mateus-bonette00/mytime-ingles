import pool from '../config/database.js';
import crypto from 'crypto';

class PasswordSetToken {
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static async create({ user_id, expiresInHours = 24 }) {
    const token = this.generateToken();
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + expiresInHours);

    const result = await pool.query(
      `INSERT INTO password_set_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, token, expires_at]
    );

    return result.rows[0];
  }

  static async findByToken(token) {
    const result = await pool.query(
      'SELECT * FROM password_set_tokens WHERE token = $1',
      [token]
    );

    return result.rows[0] || null;
  }

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

  static async markAsUsed(token) {
    const result = await pool.query(
      `UPDATE password_set_tokens
       SET used = true, used_at = NOW()
       WHERE token = $1
       RETURNING *`,
      [token]
    );

    return result.rows[0] || null;
  }

  static async findByUserId(user_id) {
    const result = await pool.query(
      'SELECT * FROM password_set_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [user_id]
    );

    return result.rows[0] || null;
  }

  static async deleteExpired() {
    const result = await pool.query(
      'DELETE FROM password_set_tokens WHERE expires_at < NOW() AND used = false RETURNING id'
    );

    return result.rows.length;
  }
}

export default PasswordSetToken;
