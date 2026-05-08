import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import adminController from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para upload de audio
const audiosDir = path.join(__dirname, '../../audios');
if (!fs.existsSync(audiosDir)) {
  fs.mkdirSync(audiosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: audiosDir,
  filename: (req, file, cb) => {
    const suffix = req.query.variant === 'b' ? 'b' : '';
    // Pegar apenas a ultima extensao real (ex: "1.m4a.wav" -> ".wav")
    const ext = path.extname(file.originalname).toLowerCase() || '.mp3';
    // Extrair o numero da frase do parametro da rota (ignora nome original do arquivo)
    cb(null, `${req.params.phraseNumber}${suffix}${ext}`);
  }
});

const allowedAudioTypes = [
  'audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/x-m4a',
  'audio/aac', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/wave',
  'audio/webm', 'audio/flac', 'audio/vnd.wave'
];
const allowedAudioExts = ['.mp3', '.m4a', '.aac', '.ogg', '.wav', '.webm', '.flac', '.mp4'];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedAudioTypes.includes(file.mimetype) || allowedAudioExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de audio nao suportado. Use mp3, m4a, aac, ogg, wav, webm ou flac.'));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }
});

// Configurar multer para upload de imagem de modulo
const uploadsDir = path.join(__dirname, '../../uploads/modules');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `module_${req.params.id || Date.now()}${ext}`);
  }
});

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPG, PNG ou WebP sao permitidas'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Todas as rotas requerem autenticação e permissão de admin
router.use(authenticate);
router.use(isAdmin);

// GET /api/admin/dashboard - Estatísticas do dashboard
router.get('/dashboard', adminController.getDashboardStats);

// GET /api/admin/students - Listar todos os alunos
router.get('/students', adminController.getAllStudents);

// PUT /api/admin/students/:id - Atualizar aluno
router.put('/students/:id', adminController.updateStudent);

// DELETE /api/admin/students/:id - Excluir aluno
router.delete('/students/:id', adminController.deleteStudent);

// GET /api/admin/purchases - Listar todas as compras
router.get('/purchases', adminController.getAllPurchases);

// GET /api/admin/sales - Vendas por dia
router.get('/sales', adminController.getSalesByDay);

// GET /api/admin/phrases - Listar todas as frases
router.get('/phrases', adminController.getAllPhrases);

// POST /api/admin/phrases - Criar nova frase
router.post('/phrases', adminController.createPhrase);

// PUT /api/admin/phrases/reorder - Reordenar frases (ANTES da rota :phraseNumber)
router.put('/phrases/reorder', adminController.reorderPhrases);

// PUT /api/admin/phrases/:phraseNumber - Atualizar frase
router.put('/phrases/:phraseNumber', adminController.updatePhrase);

// DELETE /api/admin/phrases/:phraseNumber - Deletar frase
router.delete('/phrases/:phraseNumber', adminController.deletePhrase);

// POST /api/admin/phrases/bulk - Criar múltiplas frases
router.post('/phrases/bulk', adminController.createBulkPhrases);

// POST /api/admin/create-student - Criar aluno com acesso gratuito
router.post('/create-student', adminController.createStudent);

// POST /api/admin/phrases/:phraseNumber/audio - Upload de audio
router.post('/phrases/:phraseNumber/audio', upload.single('audio'), adminController.uploadAudio);

// DELETE /api/admin/phrases/:phraseNumber/audio - Remover audio de uma frase
router.delete('/phrases/:phraseNumber/audio', adminController.deleteAudio);

// DELETE /api/admin/audios - Remover todos os audios
router.delete('/audios', adminController.deleteAllAudios);

// ========== MODULES ==========
// GET /api/admin/modules - Listar modulos
router.get('/modules', adminController.getModules);

// POST /api/admin/modules - Criar modulo
router.post('/modules', adminController.createModule);

// PUT /api/admin/modules/:id - Atualizar modulo
router.put('/modules/:id', adminController.updateModule);

// DELETE /api/admin/modules/:id - Deletar modulo
router.delete('/modules/:id', adminController.deleteModule);

// POST /api/admin/modules/:id/image - Upload imagem de capa
router.post('/modules/:id/image', uploadImage.single('image'), adminController.uploadModuleImage);

export default router;
