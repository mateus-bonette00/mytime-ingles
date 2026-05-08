-- ========================================
-- MIGRATION: Protecao extra para cadastro por token
-- Data: 2026-03-10
-- Objetivo: exigir codigo de verificacao enviado para o e-mail da compra
-- ========================================

ALTER TABLE signup_tokens
  ADD COLUMN IF NOT EXISTS verification_code_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS verification_code_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verification_code_sent_at TIMESTAMP;

