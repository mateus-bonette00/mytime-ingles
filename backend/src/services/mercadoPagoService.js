import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { config } from '../config/env.js';

class MercadoPagoService {
  constructor() {
    // Configurar cliente do Mercado Pago
    console.log('🔧 Inicializando Mercado Pago Service');
    console.log('🔑 Access Token (primeiros 20 chars):', config.mercadoPago.accessToken?.substring(0, 20));
    console.log('🔑 Public Key (primeiros 20 chars):', config.mercadoPago.publicKey?.substring(0, 20));

    this.client = new MercadoPagoConfig({
      accessToken: config.mercadoPago.accessToken,
    });

    this.preference = new Preference(this.client);
    this.payment = new Payment(this.client);

    console.log('✅ Mercado Pago Service inicializado');
  }

  /**
   * Criar preferência de pagamento
   * @param {object} params - { name, email, cpf, purchaseId }
   * purchaseId é usado como external_reference para vincular webhook à compra
   */
  async createPreference({ name, email, cpf, purchaseId }) {
    try {
      const purchaseQuery = `purchase_id=${purchaseId}`;
      const backUrls = {
        success: `${config.frontendUrl}/pagamento/sucesso?${purchaseQuery}`,
        failure: `${config.frontendUrl}/pagamento/falha?${purchaseQuery}`,
        pending: `${config.frontendUrl}/pagamento/pendente?${purchaseQuery}`,
      };

      console.log('🔍 Back URLs:', backUrls);

      const preferenceData = {
        items: [
          {
            title: 'Inglês na Mala com Teacher Ediane - 25 Frases Essenciais para sua Próxima Viagem Internacional',
            description: 'Curso de inglês para viagens com áudios nativos - De R$ 97,00 por R$ 34,90',
            quantity: 1,
            unit_price: config.mercadoPago.coursePrice,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: name,
          email: email,
          identification: cpf ? {
            type: 'CPF',
            number: cpf,
          } : undefined,
        },
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12,
        },
        back_urls: backUrls,
        auto_return: 'approved',
        statement_descriptor: 'MYTIME INGLES',
        external_reference: String(purchaseId),
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      // Adicionar notification_url se configurada (precisa ser URL publica)
      if (config.mercadoPago.webhookUrl) {
        preferenceData.notification_url = config.mercadoPago.webhookUrl;
        console.log('🔔 Webhook URL:', config.mercadoPago.webhookUrl);
      } else {
        console.warn('⚠️  WEBHOOK_URL não configurada. Configure no .env para receber notificações do MP.');
      }

      const response = await this.preference.create({ body: preferenceData });

      return {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
      };
    } catch (error) {
      console.error('❌ Erro ao criar preferência no Mercado Pago:', error);
      throw new Error('Erro ao criar preferência de pagamento: ' + error.message);
    }
  }

  /**
   * Buscar informações de um pagamento
   */
  async getPayment(paymentId) {
    try {
      const response = await this.payment.get({ id: paymentId });
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar pagamento:', error);
      throw new Error('Erro ao buscar pagamento: ' + error.message);
    }
  }

  /**
   * Processar notificação de webhook
   */
  async processWebhookNotification(data) {
    try {
      const { type, data: notificationData } = data;

      if (type === 'payment') {
        const paymentId = notificationData.id;
        const paymentInfo = await this.getPayment(paymentId);

        return {
          paymentId,
          status: paymentInfo.status,
          statusDetail: paymentInfo.status_detail,
          amount: paymentInfo.transaction_amount,
          paymentMethod: paymentInfo.payment_method_id,
          payerEmail: paymentInfo.payer?.email,
          externalReference: paymentInfo.external_reference,
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      throw new Error('Erro ao processar webhook: ' + error.message);
    }
  }

  async getPaymentAndMap(paymentId) {
    try {
      const paymentInfo = await this.getPayment(paymentId);

      return {
        paymentId,
        status: paymentInfo.status,
        statusDetail: paymentInfo.status_detail,
        amount: paymentInfo.transaction_amount,
        paymentMethod: paymentInfo.payment_method_id,
        payerEmail: paymentInfo.payer?.email,
        externalReference: paymentInfo.external_reference,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar pagamento:', error);
      return null;
    }
  }

  /**
   * Mapear status do Mercado Pago para status interno
   */
  mapPaymentStatus(mercadoPagoStatus) {
    const statusMap = {
      approved: 'approved',
      pending: 'pending',
      in_process: 'pending',
      in_mediation: 'pending',
      rejected: 'rejected',
      cancelled: 'rejected',
      refunded: 'refunded',
      charged_back: 'refunded',
    };

    return statusMap[mercadoPagoStatus] || 'pending';
  }

  /**
   * Criar pagamento PIX
   */
  async createPixPayment({ name, email, cpf, amount }) {
    try {
      const paymentData = {
        transaction_amount: amount || config.mercadoPago.coursePrice,
        description: '50 Frases Essenciais para Viagens',
        payment_method_id: 'pix',
        payer: {
          email: email,
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ') || name.split(' ')[0],
          identification: cpf ? {
            type: 'CPF',
            number: cpf,
          } : undefined,
        },
      };

      const response = await this.payment.create({ body: paymentData });

      return {
        id: response.id,
        status: response.status,
        qr_code: response.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: response.point_of_interaction?.transaction_data?.ticket_url,
      };
    } catch (error) {
      console.error('❌ Erro ao criar pagamento PIX:', error);
      throw new Error('Erro ao criar pagamento PIX: ' + error.message);
    }
  }

  /**
   * Processar reembolso
   */
  async refundPayment(paymentId) {
    try {
      // Implementar lógica de reembolso quando necessário
      console.log(`⚠️ Reembolso solicitado para pagamento ${paymentId}`);
      // const refund = await this.client.refund.create({ payment_id: paymentId });
      // return refund;
      return { message: 'Reembolso a ser implementado' };
    } catch (error) {
      console.error('❌ Erro ao processar reembolso:', error);
      throw new Error('Erro ao processar reembolso: ' + error.message);
    }
  }
}

export default new MercadoPagoService();
