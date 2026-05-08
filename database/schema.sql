-- ========================================
-- SCHEMA DO BANCO DE DADOS - MyTime Inglês
-- ========================================

-- Criar banco de dados
-- CREATE DATABASE mytime_ingles;

-- Conectar ao banco
-- \c mytime_ingles;

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABELA: users
-- Armazena todos os usuários (alunos e admins)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ========================================
-- TABELA: purchases
-- Armazena todas as compras realizadas
-- ========================================
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50), -- 'pix', 'credit_card', 'boleto'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'refunded'
  mercadopago_id VARCHAR(255) UNIQUE,
  mercadopago_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_email ON purchases(email);
CREATE INDEX idx_purchases_mercadopago_id ON purchases(mercadopago_id);
CREATE INDEX idx_purchases_status ON purchases(payment_status);

-- ========================================
-- TABELA: signup_tokens
-- Armazena tokens únicos para cadastro de novos alunos
-- ========================================
CREATE TABLE IF NOT EXISTS signup_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  purchase_id INTEGER REFERENCES purchases(id) ON DELETE CASCADE,
  used BOOLEAN DEFAULT FALSE,
  verification_code_hash VARCHAR(255),
  verification_code_expires_at TIMESTAMP,
  verification_code_attempts INTEGER DEFAULT 0,
  verification_code_sent_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_signup_tokens_token ON signup_tokens(token);
CREATE INDEX idx_signup_tokens_email ON signup_tokens(email);
CREATE INDEX idx_signup_tokens_used ON signup_tokens(used);

-- ========================================
-- TABELA: password_set_tokens
-- Tokens temporários para criação de senha após compra
-- ========================================
CREATE TABLE IF NOT EXISTS password_set_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_set_tokens_token ON password_set_tokens(token);
CREATE INDEX idx_password_set_tokens_user_id ON password_set_tokens(user_id);
CREATE INDEX idx_password_set_tokens_expires_at ON password_set_tokens(expires_at);

-- ========================================
-- TABELA: user_progress
-- Armazena o progresso de cada aluno nas frases
-- ========================================
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  phrase_number INTEGER NOT NULL CHECK (phrase_number >= 1 AND phrase_number <= 50),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, phrase_number)
);

-- Índices para performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_completed ON user_progress(completed);

-- ========================================
-- TABELA: modules
-- Armazena os módulos do curso (categorias dinâmicas)
-- ========================================
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  image_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_modules_sort_order ON modules(sort_order);

-- ========================================
-- TABELA: phrases
-- Armazena as 50 frases do curso com áudios
-- ========================================
CREATE TABLE IF NOT EXISTS phrases (
  id SERIAL PRIMARY KEY,
  phrase_number INTEGER UNIQUE NOT NULL CHECK (phrase_number >= 1 AND phrase_number <= 50),
  text_en VARCHAR(500) NOT NULL,
  text_pt VARCHAR(500),
  audio_url VARCHAR(500),
  duration_seconds INTEGER,
  category VARCHAR(100), -- 'airport', 'hotel', 'restaurant', 'general'
  module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX idx_phrases_number ON phrases(phrase_number);
CREATE INDEX idx_phrases_category ON phrases(category);
CREATE INDEX idx_phrases_module_id ON phrases(module_id);

-- ========================================
-- TABELA: landing_page_content
-- Armazena conteúdo editável da landing page
-- ========================================
CREATE TABLE IF NOT EXISTS landing_page_content (
  id SERIAL PRIMARY KEY,
  section VARCHAR(100) UNIQUE NOT NULL, -- 'hero', 'about', 'testimonials', 'faq'
  content JSONB NOT NULL, -- Conteúdo flexível em JSON
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- TABELA: testimonials
-- Armazena depoimentos de alunos
-- ========================================
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  photo_url VARCHAR(500),
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_testimonials_active ON testimonials(is_active);
CREATE INDEX idx_testimonials_order ON testimonials(display_order);

-- ========================================
-- TABELA: faq
-- Armazena perguntas frequentes
-- ========================================
CREATE TABLE IF NOT EXISTS faq (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_faq_active ON faq(is_active);
CREATE INDEX idx_faq_order ON faq(display_order);

-- ========================================
-- SEED DATA: Admin user
-- Criar usuário admin padrão (senha: admin123)
-- ========================================
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Administrador',
  'admin@mytimeingles.com',
  '$2b$10$rKYJqgXvBqHp5xKYJqgXve4mJLh2cD8vU3E1XqYJqgXvBqHp5xKYJ', -- senha: admin123
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- SEED DATA: 50 Frases com áudios (.mp3)
-- Padrão: número (a) e número + b (repetição em inglês)
-- ========================================
INSERT INTO phrases (phrase_number, text_en, text_pt, audio_url, category) VALUES
(1, 'Where is the bathroom?', 'Onde fica o banheiro?', '/audios/1.mp3', 'general'),
(2, 'How much does this cost?', 'Quanto custa isso?', '/audios/2.mp3', 'general'),
(3, 'Can you help me, please?', 'Você pode me ajudar, por favor?', '/audios/3.mp3', 'general'),
(4, 'I would like to check in.', 'Eu gostaria de fazer o check-in.', '/audios/4.mp3', 'hotel'),
(5, 'Where is my gate?', 'Onde fica meu portão de embarque?', '/audios/5.mp3', 'airport'),
(6, 'Can I see the menu, please?', 'Posso ver o cardápio, por favor?', '/audios/6.mp3', 'restaurant'),
(7, 'I need a taxi to the airport.', 'Preciso de um táxi para o aeroporto.', '/audios/7.mp3', 'general'),
(8, 'What time is breakfast?', 'Que horas é o café da manhã?', '/audios/8.mp3', 'hotel'),
(9, 'Do you speak English?', 'Você fala inglês?', '/audios/9.mp3', 'general'),
(10, 'I have a reservation.', 'Eu tenho uma reserva.', '/audios/10.mp3', 'hotel'),
(11, 'What is your name?', 'Qual é o seu nome?', '/audios/11.mp3', 'general'),
(12, 'Nice to meet you.', 'Prazer em conhecê-lo.', '/audios/12.mp3', 'general'),
(13, 'How are you today?', 'Como você está hoje?', '/audios/13.mp3', 'general'),
(14, 'I would like water, please.', 'Eu gostaria de água, por favor.', '/audios/14.mp3', 'restaurant'),
(15, 'Can you speak more slowly?', 'Você pode falar mais devagar?', '/audios/15.mp3', 'general'),
(16, 'Where is the train station?', 'Onde fica a estação de trem?', '/audios/16.mp3', 'general'),
(17, 'Do you have any rooms available?', 'Vocês têm quartos disponíveis?', '/audios/17.mp3', 'hotel'),
(18, 'What time do you close?', 'A que horas vocês fecham?', '/audios/18.mp3', 'general'),
(19, 'I am allergic to nuts.', 'Sou alérgico a nozes.', '/audios/19.mp3', 'restaurant'),
(20, 'Can I get the check, please?', 'Posso pedir a conta, por favor?', '/audios/20.mp3', 'restaurant'),
(21, 'Where is the nearest hospital?', 'Onde fica o hospital mais próximo?', '/audios/21.mp3', 'general'),
(22, 'I need a hotel room for two nights.', 'Preciso de um quarto de hotel por duas noites.', '/audios/22.mp3', 'hotel'),
(23, 'Can you recommend a restaurant?', 'Você pode recomendar um restaurante?', '/audios/23.mp3', 'restaurant'),
(24, 'What is the flight number?', 'Qual é o número do voo?', '/audios/24.mp3', 'airport'),
(25, 'Thank you very much.', 'Muito obrigado.', '/audios/25.mp3', 'general'),
(26, 'Where is the bathroom?', 'Onde fica o banheiro?', '/audios/1b.mp3', 'general'),
(27, 'How much does this cost?', 'Quanto custa isso?', '/audios/2b.mp3', 'general'),
(28, 'Can you help me, please?', 'Você pode me ajudar, por favor?', '/audios/3b.mp3', 'general'),
(29, 'I would like to check in.', 'Eu gostaria de fazer o check-in.', '/audios/4b.mp3', 'hotel'),
(30, 'Where is my gate?', 'Onde fica meu portão de embarque?', '/audios/5b.mp3', 'airport'),
(31, 'Can I see the menu, please?', 'Posso ver o cardápio, por favor?', '/audios/6b.mp3', 'restaurant'),
(32, 'I need a taxi to the airport.', 'Preciso de um táxi para o aeroporto.', '/audios/7b.mp3', 'general'),
(33, 'What time is breakfast?', 'Que horas é o café da manhã?', '/audios/8b.mp3', 'hotel'),
(34, 'Do you speak English?', 'Você fala inglês?', '/audios/9b.mp3', 'general'),
(35, 'I have a reservation.', 'Eu tenho uma reserva.', '/audios/10b.mp3', 'hotel'),
(36, 'What is your name?', 'Qual é o seu nome?', '/audios/11b.mp3', 'general'),
(37, 'Nice to meet you.', 'Prazer em conhecê-lo.', '/audios/12b.mp3', 'general'),
(38, 'How are you today?', 'Como você está hoje?', '/audios/13b.mp3', 'general'),
(39, 'I would like water, please.', 'Eu gostaria de água, por favor.', '/audios/14b.mp3', 'restaurant'),
(40, 'Can you speak more slowly?', 'Você pode falar mais devagar?', '/audios/15b.mp3', 'general'),
(41, 'Where is the train station?', 'Onde fica a estação de trem?', '/audios/16b.mp3', 'general'),
(42, 'Do you have any rooms available?', 'Vocês têm quartos disponíveis?', '/audios/17b.mp3', 'hotel'),
(43, 'What time do you close?', 'A que horas vocês fecham?', '/audios/18b.mp3', 'general'),
(44, 'I am allergic to nuts.', 'Sou alérgico a nozes.', '/audios/19b.mp3', 'restaurant'),
(45, 'Can I get the check, please?', 'Posso pedir a conta, por favor?', '/audios/20b.mp3', 'restaurant'),
(46, 'Where is the nearest hospital?', 'Onde fica o hospital mais próximo?', '/audios/21b.mp3', 'general'),
(47, 'I need a hotel room for two nights.', 'Preciso de um quarto de hotel por duas noites.', '/audios/22b.mp3', 'hotel'),
(48, 'Can you recommend a restaurant?', 'Você pode recomendar um restaurante?', '/audios/23b.mp3', 'restaurant'),
(49, 'What is the flight number?', 'Qual é o número do voo?', '/audios/24b.mp3', 'airport'),
(50, 'Thank you very much.', 'Muito obrigado.', '/audios/25b.mp3', 'general')
ON CONFLICT (phrase_number) DO NOTHING;

-- ========================================
-- SEED DATA: Depoimentos de exemplo
-- ========================================
INSERT INTO testimonials (name, photo_url, rating, text, display_order) VALUES
('Maria Silva', '/images/testimonial-1.jpg', 5, 'O curso é excelente! Consegui me comunicar tranquilamente na minha viagem aos EUA. Recomendo!', 1),
('João Santos', '/images/testimonial-2.jpg', 5, 'Método prático e direto ao ponto. Em uma semana já estava confiante para viajar.', 2),
('Ana Costa', '/images/testimonial-3.jpg', 5, 'A professora explica muito bem e os áudios são de nativos. Valeu cada centavo!', 3)
ON CONFLICT DO NOTHING;

-- ========================================
-- SEED DATA: FAQ de exemplo
-- ========================================
INSERT INTO faq (question, answer, display_order) VALUES
('Quanto tempo tenho para completar o curso?', 'Você tem acesso vitalício ao curso! Estude no seu próprio ritmo, sem pressa.', 1),
('Funciona em celular?', 'Sim! A plataforma é 100% responsiva e funciona perfeitamente em celulares, tablets e computadores.', 2),
('Preciso ter conhecimento prévio de inglês?', 'Não! O curso foi desenvolvido para iniciantes que querem aprender frases práticas para viagens.', 3),
('Como funciona a garantia?', 'Você tem 7 dias para experimentar o curso. Se não gostar, devolvemos 100% do seu dinheiro.', 4),
('Recebo certificado?', 'O foco do curso é aprendizado prático para viagens. Não emitimos certificado, mas você aprende frases essenciais!', 5)
ON CONFLICT DO NOTHING;

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View para estatísticas de progresso dos alunos
CREATE OR REPLACE VIEW student_progress_stats AS
SELECT
  u.id as user_id,
  u.name,
  u.email,
  COUNT(up.id) as phrases_studied,
  COUNT(CASE WHEN up.completed = true THEN 1 END) as phrases_completed,
  ROUND((COUNT(CASE WHEN up.completed = true THEN 1 END)::NUMERIC / 50) * 100, 2) as completion_percentage
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
WHERE u.role = 'student'
GROUP BY u.id, u.name, u.email;

-- View para estatísticas de vendas
CREATE OR REPLACE VIEW sales_stats AS
SELECT
  DATE(created_at) as sale_date,
  COUNT(*) as total_sales,
  COUNT(CASE WHEN payment_status = 'approved' THEN 1 END) as approved_sales,
  SUM(CASE WHEN payment_status = 'approved' THEN amount ELSE 0 END) as total_revenue,
  payment_method
FROM purchases
GROUP BY DATE(created_at), payment_method
ORDER BY sale_date DESC;

-- ========================================
-- FUNÇÕES ÚTEIS
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phrases_updated_at BEFORE UPDATE ON phrases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- PERMISSÕES (ajustar conforme necessário)
-- ========================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mytime_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mytime_user;

-- ========================================
-- FIM DO SCHEMA
-- ========================================

COMMENT ON DATABASE mytime_ingles IS 'Database for MyTime Inglês - English Learning Platform';
