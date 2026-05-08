import pool from '../config/database.js';

class Module {
  static async create({ name, image_url, sort_order }) {
    const result = await pool.query(
      `INSERT INTO modules (name, image_url, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, image_url || null, sort_order || 0]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM modules ORDER BY sort_order ASC, id ASC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM modules WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findAllWithStats() {
    const result = await pool.query(
      `SELECT m.*,
              COUNT(p.id) as phrase_count
       FROM modules m
       LEFT JOIN phrases p ON p.module_id = m.id
       GROUP BY m.id
       ORDER BY m.sort_order ASC, m.id ASC`
    );
    return result.rows;
  }

  static async findAllWithUserProgress(userId) {
    const result = await pool.query(
      `SELECT m.*,
              COUNT(p.id) as phrase_count,
              COUNT(CASE WHEN up.completed = true THEN 1 END) as phrases_completed,
              MIN(p.phrase_number) as first_phrase_number
       FROM modules m
       LEFT JOIN phrases p ON p.module_id = m.id
       LEFT JOIN user_progress up ON up.phrase_number = p.phrase_number AND up.user_id = $1
       GROUP BY m.id
       ORDER BY m.sort_order ASC, m.id ASC`,
      [userId]
    );
    return result.rows;
  }

  static async update(id, updates) {
    const fields = [];
    const values = [id];
    let idx = 2;

    if (updates.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(updates.name);
    }
    if (updates.image_url !== undefined) {
      fields.push(`image_url = $${idx++}`);
      values.push(updates.image_url);
    }
    if (updates.sort_order !== undefined) {
      fields.push(`sort_order = $${idx++}`);
      values.push(updates.sort_order);
    }

    if (!fields.length) return null;

    const result = await pool.query(
      `UPDATE modules SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    // Desassociar frases antes de deletar
    await pool.query('UPDATE phrases SET module_id = NULL WHERE module_id = $1', [id]);
    const result = await pool.query(
      'DELETE FROM modules WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  }
}

export default Module;
