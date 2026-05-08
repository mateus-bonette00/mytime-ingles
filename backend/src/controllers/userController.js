import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import securityLogger from '../services/securityLogger.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    delete user.password_hash;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updated = await User.update(req.user.id, { name, email });
    delete updated.password_hash;
    res.json({ message: 'Perfil atualizado', user: updated });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Este e-mail ja esta em uso por outra conta' });
    }
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres' });
    }

    const user = await User.findByIdWithPassword(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const isValid = await User.verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      securityLogger.logPasswordChange(req.user.id, req.user.email, false);
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    await User.updatePassword(req.user.id, newPassword);
    securityLogger.logPasswordChange(req.user.id, req.user.email, true);
    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error.message);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

export const getPurchaseInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar a compra mais recente aprovada do usuário (por user_id ou email)
    const purchases = await Purchase.findByUserId(req.user.id);
    let purchase = purchases.find(p => p.payment_status === 'approved');

    // Fallback: buscar por email se não encontrou por user_id
    if (!purchase) {
      const byEmail = await Purchase.findByEmail(user.email);
      purchase = byEmail.find(p => p.payment_status === 'approved');
    }

    // Se não encontrou aprovada, retorna a mais recente
    if (!purchase && purchases.length > 0) {
      purchase = purchases[0];
    }

    res.json({ purchase: purchase || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelCourse = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar compra aprovada
    const purchases = await Purchase.findByUserId(req.user.id);
    let purchase = purchases.find(p => p.payment_status === 'approved');

    if (!purchase) {
      const byEmail = await Purchase.findByEmail(user.email);
      purchase = byEmail.find(p => p.payment_status === 'approved');
    }

    if (!purchase) {
      return res.status(404).json({ error: 'Nenhuma compra ativa encontrada' });
    }

    // Verificar se está dentro dos 7 dias
    const purchaseDate = new Date(purchase.created_at);
    const now = new Date();
    const diffMs = now - purchaseDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      return res.status(400).json({ error: 'O prazo de 7 dias para cancelamento já expirou' });
    }

    // Atualizar status para refunded
    await Purchase.updatePaymentStatus(purchase.id, 'refunded');

    res.json({ message: 'Curso cancelado com sucesso. O reembolso será processado em até 5 dias úteis.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { getProfile, updateProfile, updatePassword, getPurchaseInfo, cancelCourse };
