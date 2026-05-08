import pool from '../config/database.js';

class Purchase {
  /**
   * Criar nova compra
   */
  static async create({ user_id, name, email, cpf, amount, payment_method, mercadopago_id }) {
    const result = await pool.query(
      `INSERT INTO purchases (user_id, name, email, cpf, amount, payment_method, payment_status, mercadopago_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
       RETURNING *`,
      [user_id, name, email, cpf, amount, payment_method, mercadopago_id]
    );

    return result.rows[0];
  }

  /**
   * Buscar compra por ID
   */
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM purchases WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Vincular compra ao usuário (somente se ainda não estiver vinculada)
   */
  static async attachUserToPurchase(id, user_id) {
    const result = await pool.query(
      `UPDATE purchases
       SET user_id = $1,
           updated_at = NOW()
       WHERE id = $2 AND user_id IS NULL
       RETURNING *`,
      [user_id, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Buscar compra por ID do Mercado Pago
   */
  static async findByMercadoPagoId(mercadopago_id) {
    const result = await pool.query(
      'SELECT * FROM purchases WHERE mercadopago_id = $1',
      [mercadopago_id]
    );

    return result.rows[0] || null;
  }

  /**
   * Buscar compras por e-mail
   */
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM purchases WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );

    return result.rows;
  }

  /**
   * Buscar compras por usuário
   */
  static async findByUserId(user_id) {
    const result = await pool.query(
      'SELECT * FROM purchases WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );

    return result.rows;
  }

  /**
   * Atualizar status do pagamento
   */
  static async updatePaymentStatus(id, status, mercadopago_payment_id = null) {
    const result = await pool.query(
      `UPDATE purchases
       SET payment_status = $1,
           mercadopago_payment_id = COALESCE($2, mercadopago_payment_id),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, mercadopago_payment_id, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Atualizar mercadopago_id de uma compra (após criar preferência)
   */
  static async updateMercadoPagoId(id, mercadopago_id) {
    const result = await pool.query(
      `UPDATE purchases
       SET mercadopago_id = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [mercadopago_id, id]
    );

    return result.rows[0] || null;
  }

  /**
   * Atualizar status por ID do Mercado Pago
   */
  static async updatePaymentStatusByMercadoPagoId(mercadopago_id, status, payment_id = null) {
    const result = await pool.query(
      `UPDATE purchases
       SET payment_status = $1,
           mercadopago_payment_id = COALESCE($2, mercadopago_payment_id),
           updated_at = NOW()
       WHERE mercadopago_id = $3
       RETURNING *`,
      [status, payment_id, mercadopago_id]
    );

    return result.rows[0] || null;
  }

  /**
   * Listar todas as compras (para admin)
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, u.name as user_name
      FROM purchases p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      params.push(filters.status);
      query += ` AND p.payment_status = $${params.length}`;
    }

    if (filters.startDate) {
      params.push(filters.startDate);
      query += ` AND p.created_at >= $${params.length}`;
    }

    if (filters.endDate) {
      params.push(filters.endDate);
      query += ` AND p.created_at <= $${params.length}`;
    }

    query += ' ORDER BY p.created_at DESC';

    if (filters.limit) {
      params.push(filters.limit);
      query += ` LIMIT $${params.length}`;
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Estatísticas de vendas
   */
  static async getStats(startDate = null, endDate = null) {
    let query = `
      SELECT
        COUNT(*) as total_purchases,
        COUNT(CASE WHEN payment_status = 'approved' THEN 1 END) as approved_purchases,
        COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_purchases,
        COUNT(CASE WHEN payment_status = 'rejected' THEN 1 END) as rejected_purchases,
        SUM(CASE WHEN payment_status = 'approved' THEN amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN payment_status = 'approved' THEN amount ELSE NULL END) as average_sale_value
      FROM purchases
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND created_at >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND created_at <= $${params.length}`;
    }

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  /**
   * Vendas por dia (últimos N dias)
   */
  static async getSalesByDay(days = 30) {
    const safeDays = Math.max(1, Math.min(365, parseInt(days) || 30));
    const result = await pool.query(
      `SELECT
         DATE(created_at) as date,
         COUNT(*) as total_sales,
         COUNT(CASE WHEN payment_status = 'approved' THEN 1 END) as approved_sales,
         SUM(CASE WHEN payment_status = 'approved' THEN amount ELSE 0 END) as daily_revenue
       FROM purchases
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [safeDays]
    );

    return result.rows;
  }

  /**
   * Deletar compra
   */
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM purchases WHERE id = $1 RETURNING id',
      [id]
    );

    return result.rows[0] || null;
  }
}

export default Purchase;
