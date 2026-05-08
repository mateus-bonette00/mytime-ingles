import pool from '../config/database.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

class User {
  /**
   * Criar novo usuário
   */
  static async create({ name, email, password, role = 'student' }) {
    try {
      // Hash da senha
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [name, email, password_hash, role]
      );

      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('E-mail já cadastrado');
      }
      throw error;
    }
  }

  /**
   * Buscar usuário por e-mail
   */
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  /**
   * Buscar usuário por ID
   */
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Buscar usuário por ID (incluindo password_hash)
   */
  static async findByIdWithPassword(id) {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Verificar senha
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Atualizar usuário
   */
  static async update(id, updates) {
    const allowedFields = ['name', 'email'];
    const fields = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    if (!fields) {
      throw new Error('Nenhum campo válido para atualizar');
    }

    const values = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map(key => updates[key]);

    const result = await pool.query(
      `UPDATE users SET ${fields}, updated_at = NOW()
       WHERE id = $1
       RETURNING id, name, email, role, updated_at`,
      [id, ...values]
    );

    return result.rows[0] || null;
  }

  /**
   * Atualizar senha
   */
  static async updatePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const result = await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email`,
      [password_hash, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Listar todos os alunos (para admin)
   */
  static async findAllStudents() {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.created_at,
              COUNT(up.id) as phrases_studied,
              COUNT(CASE WHEN up.completed = true THEN 1 END) as phrases_completed,
              ROUND((COUNT(CASE WHEN up.completed = true THEN 1 END)::NUMERIC / 50) * 100, 2) as completion_percentage
       FROM users u
       LEFT JOIN user_progress up ON u.id = up.user_id
       WHERE u.role = 'student'
       GROUP BY u.id, u.name, u.email, u.created_at
       ORDER BY u.created_at DESC`
    );

    return result.rows;
  }

  /**
   * Deletar usuário
   */
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Contar total de usuários
   */
  static async countByRole(role = 'student') {
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM users WHERE role = $1',
      [role]
    );

    return parseInt(result.rows[0].total);
  }
}

export default User;
