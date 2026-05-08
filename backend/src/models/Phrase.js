import pool from '../config/database.js';

class Phrase {
  /**
   * Criar nova frase
   */
  static async create({ phrase_number, text_en, text_pt, audio_url, duration_seconds, category, module_id }) {
    try {
      const result = await pool.query(
        `INSERT INTO phrases (phrase_number, text_en, text_pt, audio_url, duration_seconds, category, module_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [phrase_number, text_en, text_pt, audio_url, duration_seconds, category, module_id || null]
      );

      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Número de frase já existe');
      }
      throw error;
    }
  }

  /**
   * Buscar frase por número
   */
  static async findByNumber(phrase_number) {
    const result = await pool.query(
      'SELECT * FROM phrases WHERE phrase_number = $1',
      [phrase_number]
    );

    return result.rows[0] || null;
  }

  /**
   * Buscar frase por ID
   */
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM phrases WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Listar todas as frases
   */
  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM phrases ORDER BY phrase_number ASC'
    );

    return result.rows;
  }

  /**
   * Listar frases por categoria
   */
  static async findByCategory(category) {
    const result = await pool.query(
      'SELECT * FROM phrases WHERE category = $1 ORDER BY phrase_number ASC',
      [category]
    );

    return result.rows;
  }

  /**
   * Atualizar frase
   */
  static async update(phrase_number, updates) {
    const allowedFields = ['text_en', 'text_pt', 'audio_url', 'duration_seconds', 'category', 'module_id'];
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
      `UPDATE phrases SET ${fields}, updated_at = NOW()
       WHERE phrase_number = $1
       RETURNING *`,
      [phrase_number, ...values]
    );

    return result.rows[0] || null;
  }

  /**
   * Deletar frase
   */
  static async delete(phrase_number) {
    const result = await pool.query(
      'DELETE FROM phrases WHERE phrase_number = $1 RETURNING id',
      [phrase_number]
    );

    return result.rows[0] || null;
  }

  /**
   * Contar total de frases
   */
  static async count() {
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM phrases'
    );

    return parseInt(result.rows[0].total);
  }

  /**
   * Buscar frases com status de progresso do usuário
   */
  static async findAllWithUserProgress(user_id) {
    const result = await pool.query(
      `SELECT
         p.*,
         COALESCE(up.completed, false) as user_completed,
         up.completed_at as user_completed_at,
         m.name as module_name,
         m.image_url as module_image_url
       FROM phrases p
       LEFT JOIN user_progress up ON p.phrase_number = up.phrase_number AND up.user_id = $1
       LEFT JOIN modules m ON p.module_id = m.id
       ORDER BY p.phrase_number ASC`,
      [user_id]
    );

    return result.rows;
  }

  /**
   * Buscar uma frase com status de progresso do usuário
   */
  static async findByNumberWithUserProgress(phrase_number, user_id) {
    const result = await pool.query(
      `SELECT
         p.*,
         COALESCE(up.completed, false) as user_completed,
         up.completed_at as user_completed_at,
         m.name as module_name,
         m.image_url as module_image_url
       FROM phrases p
       LEFT JOIN user_progress up ON p.phrase_number = up.phrase_number AND up.user_id = $1
       LEFT JOIN modules m ON p.module_id = m.id
       WHERE p.phrase_number = $2`,
      [user_id, phrase_number]
    );

    return result.rows[0] || null;
  }

  /**
   * Estatísticas de frases
   */
  static async getStats() {
    const result = await pool.query(
      `SELECT
         COUNT(*) as total_phrases,
         COUNT(DISTINCT category) as total_categories,
         AVG(duration_seconds) as average_duration
       FROM phrases`
    );

    return result.rows[0];
  }

  /**
   * Reordenar frases - recebe array de { id, phrase_number }
   * Usa transacao: primeiro move para negativos temporarios, depois para os finais
   */
  static async reorder(items) {
    if (!items.length) return;

    const sanitized = items.map(item => ({
      id: parseInt(item.id),
      phrase_number: parseInt(item.phrase_number)
    }));

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Passo 1: mover todos para numeros negativos temporarios (evita conflito UNIQUE)
      for (let i = 0; i < sanitized.length; i++) {
        await client.query(
          'UPDATE phrases SET phrase_number = $1 WHERE id = $2',
          [-(i + 1000), sanitized[i].id]
        );
      }

      // Passo 2: mover para os numeros finais
      for (const item of sanitized) {
        await client.query(
          'UPDATE phrases SET phrase_number = $1, updated_at = NOW() WHERE id = $2',
          [item.phrase_number, item.id]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Criar múltiplas frases em lote
   */
  static async createBulk(phrases) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const insertedPhrases = [];

      for (const phrase of phrases) {
        const result = await client.query(
          `INSERT INTO phrases (phrase_number, text_en, text_pt, audio_url, duration_seconds, category)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (phrase_number) DO UPDATE SET
             text_en = EXCLUDED.text_en,
             text_pt = EXCLUDED.text_pt,
             audio_url = EXCLUDED.audio_url,
             duration_seconds = EXCLUDED.duration_seconds,
             category = EXCLUDED.category,
             updated_at = NOW()
           RETURNING *`,
          [phrase.phrase_number, phrase.text_en, phrase.text_pt, phrase.audio_url, phrase.duration_seconds, phrase.category]
        );

        insertedPhrases.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return insertedPhrases;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default Phrase;
