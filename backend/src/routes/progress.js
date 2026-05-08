import express from 'express';
import progressController from '../controllers/progressController.js';
import { authenticate, hasActivePurchase } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticacao + compra ativa
router.use(authenticate);
router.use(hasActivePurchase);

// GET /api/progress/modules - Obter modulos com progresso do aluno
router.get('/modules', progressController.getModulesWithProgress);

// GET /api/progress - Obter progresso do usuario
router.get('/', progressController.getUserProgress);

// GET /api/progress/phrases - Obter todas as frases com progresso
router.get('/phrases', progressController.getPhrasesWithProgress);

// GET /api/progress/phrases/:phraseNumber - Obter uma frase especifica com progresso
router.get('/phrases/:phraseNumber', progressController.getPhraseByNumber);

// POST /api/progress/phrases/:phraseNumber/complete - Marcar frase como concluida
router.post('/phrases/:phraseNumber/complete', progressController.markPhraseCompleted);

// POST /api/progress/phrases/:phraseNumber/incomplete - Marcar frase como nao concluida
router.post('/phrases/:phraseNumber/incomplete', progressController.markPhraseIncomplete);

export default router;
