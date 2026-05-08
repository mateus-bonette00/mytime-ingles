import pool from '../config/database.js';

class Progress {
  /**
   * Inicializar progresso para um usuário (criar 50 registros)
   */
  static async initializeForUser(user_id) {
    await pool.query(
      `INSERT INTO user_progress (user_id, phrase_number, completed)
       SELECT $1, p.phrase_number, false
       FROM phrases p
       ON CONFLICT (user_id, phrase_number) DO NOTHING`,
      [user_id]
    );
    return true;
  }

  /**
   * Obter progresso completo do usuário
   */
  static async getUserProgress(user_id) {
    const result = await pool.query(
      `SELECT phrase_number, completed, completed_at
       FROM user_progress
       WHERE user_id = $1
       ORDER BY phrase_number ASC`,
      [user_id]
    );

    return result.rows;
  }

  /**
   * Obter estatísticas de progresso do usuário
   */
  static async getUserStats(user_id) {
    const result = await pool.query(
      `SELECT
         COUNT(p.phrase_number)::INT as total_phrases,
         COUNT(CASE WHEN up.completed = true THEN 1 END)::INT as phrases_studied,
         COUNT(CASE WHEN up.completed = true THEN 1 END)::INT as phrases_completed,
         COALESCE(
           ROUND(
             (COUNT(CASE WHEN up.completed = true THEN 1 END)::NUMERIC / NULLIF(COUNT(p.phrase_number), 0)) * 100,
             2
           ),
           0
         ) as completion_percentage,
         MAX(up.completed_at) as last_study_date
       FROM phrases p
       LEFT JOIN user_progress up
         ON up.user_id = $1
        AND up.phrase_number = p.phrase_number`,
      [user_id]
    );

    return result.rows[0];
  }

  /**
   * Marcar frase como estudada
   */
  static async markAsCompleted(user_id, phrase_number) {
    const result = await pool.query(
      `INSERT INTO user_progress (user_id, phrase_number, completed, completed_at)
       VALUES ($1, $2, true, NOW())
       ON CONFLICT (user_id, phrase_number)
       DO UPDATE SET
         completed = true,
         completed_at = NOW(),
         updated_at = NOW()
       RETURNING *`,
      [user_id, phrase_number]
    );

    return result.rows[0];
  }

  /**
   * Desmarcar frase como estudada
   */
  static async markAsIncomplete(user_id, phrase_number) {
    const result = await pool.query(
      `UPDATE user_progress
       SET completed = false,
           completed_at = NULL,
           updated_at = NOW()
       WHERE user_id = $1 AND phrase_number = $2
       RETURNING *`,
      [user_id, phrase_number]
    );

    return result.rows[0] || null;
  }

  /**
   * Obter próxima frase não estudada
   */
  static async getNextIncompletePhrase(user_id) {
    const result = await pool.query(
      `SELECT phrase_number
       FROM user_progress
       WHERE user_id = $1 AND completed = false
       ORDER BY phrase_number ASC
       LIMIT 1`,
      [user_id]
    );

    return result.rows[0] || null;
  }

  /**
   * Resetar progresso do usuário
   */
  static async resetUserProgress(user_id) {
    const result = await pool.query(
      `UPDATE user_progress
       SET completed = false,
           completed_at = NULL,
           updated_at = NOW()
       WHERE user_id = $1
       RETURNING user_id`,
      [user_id]
    );

    return result.rows.length > 0;
  }

  /**
   * Obter status de uma frase específica
   */
  static async getPhraseStatus(user_id, phrase_number) {
    const result = await pool.query(
      `SELECT * FROM user_progress
       WHERE user_id = $1 AND phrase_number = $2`,
      [user_id, phrase_number]
    );

    return result.rows[0] || null;
  }

  /**
   * Deletar progresso de um usuário
   */
  static async deleteUserProgress(user_id) {
    const result = await pool.query(
      'DELETE FROM user_progress WHERE user_id = $1 RETURNING user_id',
      [user_id]
    );

    return result.rows.length > 0;
  }

  /**
   * Estatísticas gerais de progresso (para admin)
   */
  static async getGlobalStats() {
    const result = await pool.query(
      `SELECT
         COUNT(DISTINCT user_id) as total_users_studying,
         COUNT(*) as total_progress_entries,
         COUNT(CASE WHEN completed = true THEN 1 END) as total_completed,
         ROUND((COUNT(CASE WHEN completed = true THEN 1 END)::NUMERIC / COUNT(*)) * 100, 2) as overall_completion_rate,
         COUNT(DISTINCT CASE WHEN completed = true THEN user_id END) as users_with_progress
       FROM user_progress`
    );

    return result.rows[0];
  }

  /**
   * Frases mais estudadas (para admin)
   */
  static async getMostStudiedPhrases(limit = 10) {
    const result = await pool.query(
      `SELECT
         phrase_number,
         COUNT(CASE WHEN completed = true THEN 1 END) as completion_count,
         ROUND((COUNT(CASE WHEN completed = true THEN 1 END)::NUMERIC / COUNT(DISTINCT user_id)) * 100, 2) as completion_rate
       FROM user_progress
       GROUP BY phrase_number
       ORDER BY completion_count DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
}

export default Progress;
