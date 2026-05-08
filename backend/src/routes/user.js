import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate, hasActivePurchase } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticacao
router.use(authenticate);

// GET /api/users/profile - Obter perfil do usuario
router.get('/profile', userController.getProfile);

// PUT /api/users/profile - Atualizar perfil
router.put('/profile', userController.updateProfile);

// PUT /api/users/password - Atualizar senha
router.put('/password', userController.updatePassword);

// GET /api/users/purchase-info - Obter informacoes da compra
router.get('/purchase-info', userController.getPurchaseInfo);

// POST /api/users/cancel-course - Cancelar curso (garantia de 7 dias)
router.post('/cancel-course', userController.cancelCourse);

// GET /api/users/verify-access - Verificar se usuario tem acesso ativo (usado pelo frontend)
router.get('/verify-access', hasActivePurchase, (req, res) => {
  res.json({ hasAccess: true });
});

export default router;
