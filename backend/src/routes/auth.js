import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login - Login
router.post('/login', authController.login);

// GET /api/auth/validate-token - Validar token de cadastro
router.get('/validate-token', authController.validateSignupToken);

// POST /api/auth/signup/send-code - Enviar código de verificação para o e-mail do token
router.post('/signup/send-code', authController.sendSignupVerificationCode);

// POST /api/auth/signup - Cadastro com token
router.post('/signup', authController.signup);

// POST /api/auth/claim-purchase - Cadastro com compra aprovada (sem e-mail)
router.post('/claim-purchase', authController.claimPurchaseAccess);

// GET /api/auth/verify - Verificar autenticação
router.get('/verify', authenticate, authController.verifyAuth);

// POST /api/auth/request-password-reset - Solicitar reset de senha
router.post('/request-password-reset', authController.requestPasswordReset);

// POST /api/auth/reset-password - Resetar senha
router.post('/reset-password', authController.resetPassword);

// GET /api/auth/validate-set-password-token - Validar token de criação de senha
router.get('/validate-set-password-token', authController.validateSetPasswordToken);

// POST /api/auth/set-password - Definir senha com token
router.post('/set-password', authController.setPassword);

export default router;
