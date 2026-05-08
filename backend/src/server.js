import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar rotas
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
import userRoutes from './routes/user.js';
import progressRoutes from './routes/progress.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Trust proxy (Nginx reverse proxy na frente)
app.set('trust proxy', 1);

// ========== SECURITY MIDDLEWARES ==========

// Helmet - Security headers (CSP, X-Frame-Options, etc)
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API (frontend handles it)
  crossOriginEmbedderPolicy: false,
}));

// CORS - Restrict origins
const allowedOrigins = config.nodeEnv === 'production'
  ? [config.frontendUrl].filter(Boolean)
  : [config.frontendUrl, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, server-to-server, webhooks)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
}));

// HPP - Protect against HTTP parameter pollution
app.use(hpp());

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ========== RATE LIMITING ==========

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisicoes. Tente novamente mais tarde.' },
});
app.use('/api', (req, res, next) => {
  if (req.path === '/payments/webhook') return next();
  return globalLimiter(req, res, next);
});

// Strict rate limit for auth endpoints (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/request-password-reset', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/claim-purchase', authLimiter);
app.use('/api/auth/set-password', authLimiter);

// Rate limit for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisicoes de pagamento. Tente novamente mais tarde.' },
});
app.use('/api/payments/create-preference', paymentLimiter);

// ========== STATIC FILES ==========

// Servir arquivos estaticos (audios)
const audiosPath = path.join(__dirname, '../audios');
app.use('/audios', express.static(audiosPath, {
  setHeaders: (res, filePath) => {
    // Permitir que o frontend (cross-origin) carregue os audios
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.ogg': 'audio/ogg',
      '.webm': 'audio/webm',
      '.flac': 'audio/flac',
    };
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
  }
}));

// Servir uploads (imagens de modulos, etc)
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ========== LOGGING (dev only) ==========

if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ========== ROUTES ==========

// Health check (public)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// ========== ERROR HANDLING ==========

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota nao encontrada' });
});

// Global error handler - NEVER leak internal details in production
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);

  if (err.message === 'Bloqueado pelo CORS') {
    return res.status(403).json({ error: 'Origem nao permitida' });
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: config.nodeEnv === 'production'
      ? 'Erro interno do servidor'
      : err.message,
  });
});

// ========== START SERVER ==========

const PORT = config.port;

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT} [${config.nodeEnv}]`);

  try {
    await pool.query('SELECT NOW()');
    console.log('Banco de dados conectado');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

export default app;
