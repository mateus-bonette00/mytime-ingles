import Purchase from '../models/Purchase.js';
import SignupToken from '../models/SignupToken.js';
import PasswordSetToken from '../models/PasswordSetToken.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import mercadoPagoService from '../services/mercadoPagoService.js';
import emailService from '../services/emailService.js';
import brevoService from '../services/brevoService.js';
import { normalizeCPF, validatePurchaseData } from '../utils/validators.js';
import { config } from '../config/env.js';

/**
 * Criar preferência de pagamento no Mercado Pago
 * Fluxo: criar Purchase (pending) -> criar Preference (com purchaseId) -> atualizar Purchase com mercadopago_id
 */
export const createPaymentPreference = async (req, res) => {
  try {
    const { name, email, cpf } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedCpf = normalizeCPF(cpf);

    // Validar dados
    const validation = validatePurchaseData({ name, email: normalizedEmail, cpf: normalizedCpf });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }

    // 1. Criar registro de compra PRIMEIRO (status pending, sem mercadopago_id ainda)
    const purchase = await Purchase.create({
      user_id: null,
      name,
      email: normalizedEmail,
      cpf: normalizedCpf,
      amount: config.mercadoPago.coursePrice,
      payment_method: null,
      mercadopago_id: `pending_${Date.now()}`,
    });

    // 2. Criar preferência no Mercado Pago com purchaseId como external_reference
    const preference = await mercadoPagoService.createPreference({
      name,
      email: normalizedEmail,
      cpf: normalizedCpf,
      purchaseId: purchase.id,
    });

    // 3. Atualizar purchase com o ID real da preferência do MP
    await Purchase.updatePaymentStatus(purchase.id, 'pending', null);
    await Purchase.updateMercadoPagoId(purchase.id, preference.id);

    console.log(`✅ Preferência criada: ${preference.id} | Purchase: ${purchase.id}`);

    res.json({
      message: 'Preferência criada com sucesso',
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      purchase_id: purchase.id,
    });
  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    res.status(500).json({
      error: 'Erro ao criar preferência de pagamento',
      message: error.message,
    });
  }
};

/**
 * Webhook do Mercado Pago
 * Idempotente: se compra já está approved, não duplica token/email
 */
export const handleWebhook = async (req, res) => {
  try {
    // Responder 200 imediatamente para o MP não reenviar
    res.status(200).json({ message: 'Webhook recebido' });

    console.log('📨 Webhook recebido:', JSON.stringify(req.body));

    const { type, topic, data, resource } = req.body;

    const isWebhookV2 = type === 'payment' && data?.id;
    const isIPN = topic === 'payment' && resource;

    if (!isWebhookV2 && !isIPN) {
      console.log('ℹ️  Webhook ignorado (type:', type, ', topic:', topic, ')');
      return;
    }

    let paymentId;
    if (isWebhookV2) {
      paymentId = data.id;
    } else {
      paymentId = resource.includes('/') ? resource.split('/').pop() : resource;
    }

    const paymentInfo = await mercadoPagoService.getPaymentAndMap(paymentId);

    if (!paymentInfo) {
      console.log('ℹ️  Webhook sem dados de pagamento');
      return;
    }

    // external_reference contém o purchase.id
    const purchaseId = parseInt(paymentInfo.externalReference, 10);

    if (!purchaseId || isNaN(purchaseId)) {
      console.error('❌ external_reference inválido:', paymentInfo.externalReference);
      return;
    }

    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
      console.error('❌ Compra não encontrada para ID:', purchaseId);
      return;
    }

    // Mapear status do MP para status interno
    const internalStatus = mercadoPagoService.mapPaymentStatus(paymentInfo.status);

    console.log(`📊 Pagamento ${paymentInfo.paymentId}: ${paymentInfo.status} -> ${internalStatus} | Purchase: ${purchaseId}`);

    // Idempotência: se já está approved, não processar novamente
    if (purchase.payment_status === 'approved') {
      console.log('ℹ️  Compra já aprovada, ignorando webhook duplicado');
      return;
    }

    // Atualizar status da compra
    await Purchase.updatePaymentStatus(
      purchase.id,
      internalStatus,
      String(paymentInfo.paymentId)
    );

    // Se aprovado, criar usuário e enviar email com link de criação de senha
    if (internalStatus === 'approved') {
      try {
        const existingUser = await User.findByEmail(purchase.email);

        if (!existingUser) {
          const newUser = await User.create({
            name: purchase.name,
            email: purchase.email,
            password: 'temporary_' + Date.now(),
            role: 'student',
          });

          await Progress.initializeForUser(newUser.id);
          await Purchase.attachUserToPurchase(purchase.id, newUser.id);

          const passwordToken = await PasswordSetToken.create({
            user_id: newUser.id,
            expiresInHours: 24,
          });

          try {
            await brevoService.sendSetPasswordEmail({
              name: purchase.name,
              email: purchase.email,
              token: passwordToken.token,
            });
            console.log('✅ Usuário criado e email enviado via Brevo para:', purchase.email);
          } catch (emailError) {
            console.error('⚠️  Usuário criado mas erro ao enviar email:', emailError.message);
            console.log('🔑 Token manual:', passwordToken.token);
          }
        } else {
          console.log('ℹ️  Usuário já existe para purchase:', purchase.id);
          await Purchase.attachUserToPurchase(purchase.id, existingUser.id);
        }
      } catch (error) {
        console.error('⚠️  Erro ao processar pagamento aprovado:', error.message);
      }
    }
  } catch (error) {
    // Não retornar erro (já respondemos 200)
    console.error('❌ Erro ao processar webhook:', error);
  }
};

/**
 * Buscar status de pagamento
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
      return res.status(404).json({ error: 'Compra não encontrada' });
    }

    res.json({
      purchase_id: purchase.id,
      status: purchase.payment_status,
      amount: purchase.amount,
      payment_method: purchase.payment_method,
      created_at: purchase.created_at,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar status:', error);
    res.status(500).json({
      error: 'Erro ao buscar status do pagamento',
      message: error.message,
    });
  }
};

/**
 * ROTA DE TESTE - Aprovar compra manualmente e enviar email
 * Usar apenas em desenvolvimento
 */
export const testApprovePurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    console.log(`🧪 TESTE: Aprovando compra ID ${purchaseId} manualmente...`);

    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
      return res.status(404).json({ error: 'Compra não encontrada' });
    }

    if (purchase.payment_status === 'approved') {
      return res.status(400).json({ error: 'Compra já aprovada' });
    }

    // Atualizar status para aprovado
    await Purchase.updatePaymentStatus(
      purchase.id,
      'approved',
      `TEST-${Date.now()}`
    );

    let passwordToken = null;

    const existingUser = await User.findByEmail(purchase.email);

    if (!existingUser) {
      const newUser = await User.create({
        name: purchase.name,
        email: purchase.email,
        password: 'temporary_' + Date.now(),
        role: 'student',
      });

      await Progress.initializeForUser(newUser.id);
      await Purchase.attachUserToPurchase(purchase.id, newUser.id);

      passwordToken = await PasswordSetToken.create({
        user_id: newUser.id,
        expiresInHours: 24,
      });

      try {
        await brevoService.sendSetPasswordEmail({
          name: purchase.name,
          email: purchase.email,
          token: passwordToken.token,
        });
        console.log(`📧 Email enviado via Brevo para: ${purchase.email}`);
      } catch (emailError) {
        console.error('⚠️  Erro ao enviar email:', emailError.message);
      }
    } else {
      console.log('ℹ️  Usuário já existe para purchase:', purchase.id);
      await Purchase.attachUserToPurchase(purchase.id, existingUser.id);
    }

    const setPasswordLink = `${config.frontendUrl}/definir-senha?token=${passwordToken?.token || 'invalid'}`;

    res.json({
      success: true,
      message: 'Compra aprovada com sucesso!',
      purchase_id: purchase.id,
      token: passwordToken?.token,
      set_password_link: setPasswordLink,
    });
  } catch (error) {
    console.error('❌ Erro ao aprovar compra:', error);
    res.status(500).json({
      error: 'Erro ao aprovar compra',
      message: error.message,
    });
  }
};

export default {
  createPaymentPreference,
  handleWebhook,
  getPaymentStatus,
  testApprovePurchase,
};
