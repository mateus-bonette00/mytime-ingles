import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
const router = express.Router();

// POST /api/payments/create-preference - Criar preferencia de pagamento (publico)
router.post('/create-preference', paymentController.createPaymentPreference);

// POST /api/payments/webhook - Webhook do Mercado Pago (publico, validado internamente)
router.post('/webhook', paymentController.handleWebhook);

// GET /api/payments/status/:purchaseId - Buscar status de pagamento (publico para check pos-compra)
router.get('/status/:purchaseId', paymentController.getPaymentStatus);

// POST /api/payments/test-approve/:purchaseId - Aprovar compra manualmente (admin only)
router.post('/test-approve/:purchaseId', authenticate, isAdmin, paymentController.testApprovePurchase);

export default router;
