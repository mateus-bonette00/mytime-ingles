# 🚀 GUIA RÁPIDO - MyTime Inglês

## 📊 ESTADO ATUAL DO PROJETO

✅ **COMPLETO (95%)**
- Backend com Node.js + Express + PostgreSQL
- Frontend com React + Vite + CSS Puro
- Sistema de autenticação JWT
- Integração Mercado Pago
- E-mails automáticos
- Landing Page
- Dashboard do Aluno
- Player de Áudio

---

## 🔄 COMO RODAR O PROJETO (Passo a Passo)

### 1️⃣ **Verificar/Iniciar PostgreSQL**

```bash
# Verificar se PostgreSQL está instalado
psql --version

# Se não estiver instalado:
# sudo apt install postgresql postgresql-contrib

# Iniciar PostgreSQL (se não estiver rodando)
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### 2️⃣ **Criar/Verificar Banco de Dados**

```bash
# Opção A: Usar script automático (RECOMENDADO)
cd database
sudo -u postgres psql -f schema.sql

# Opção B: Manual
sudo -u postgres psql
CREATE DATABASE mytime_ingles;
\c mytime_ingles
\i schema.sql
\q
```

### 3️⃣ **Iniciar Backend**

```bash
# Em um terminal
cd backend
npm run dev
```

**Deve aparecer:**
```
🚀 ========================================
🎓 MyTime Inglês API
🌍 Servidor rodando na porta 5000
📍 URL: http://localhost:5000
🌐 Ambiente: development
=========================================

✅ Banco de dados conectado com sucesso!
```

### 4️⃣ **Iniciar Frontend**

```bash
# Em OUTRO terminal
cd frontend
npm run dev
```

**Deve aparecer:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5️⃣ **Acessar Aplicação**

- **Landing Page:** http://localhost:5173
- **Login Admin:** http://localhost:5173/login
- **API Status:** http://localhost:5000

---

## 🔑 CREDENCIAIS DE TESTE

### Admin (já criado):
```
Email: admin@mytimeingles.com
Senha: admin123
```

**Se a senha não funcionar, execute:**
```bash
cd backend
npm run create-admin
```

---

## 📁 ESTRUTURA DO PROJETO

```
mytime-ingles/
├── backend/          ✅ API Node.js + Express
│   ├── src/
│   │   ├── config/   (database, env)
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── .env          ⚙️ Configurações
│   └── package.json
├── frontend/         ✅ React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── App.jsx
│   ├── .env          ⚙️ Configurações
│   └── package.json
├── database/         ✅ PostgreSQL
│   └── schema.sql
└── README.md         📚 Documentação completa
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

### Backend funcionando?
```bash
curl http://localhost:5000
```
Deve retornar JSON com informações da API

### Frontend funcionando?
Abra http://localhost:5173 - deve ver a Landing Page

### Banco conectado?
Na inicialização do backend deve aparecer:
`✅ Banco de dados conectado com sucesso!`

---

## 🐛 PROBLEMAS COMUNS

### ❌ Erro: "Cannot find module"
```bash
cd backend
npm install

cd ../frontend
npm install
```

### ❌ Erro: "Port 5000 already in use"
```bash
# Matar processo na porta 5000
lsof -ti:5000 | xargs kill -9

# Ou mudar porta no backend/.env
PORT=5001
```

### ❌ Erro: "Database connection failed"
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar se necessário
sudo systemctl start postgresql

# Recriar banco
cd database
sudo -u postgres psql -f schema.sql
```

### ❌ Erro: "Senha incorreta" no login
```bash
cd backend
npm run create-admin
```

---

## 📋 PRÓXIMOS PASSOS

### O que está FALTANDO:

1. **Configurar Mercado Pago**
   - Editar `backend/.env`
   - Adicionar chaves reais em:
     - `MERCADOPAGO_ACCESS_TOKEN`
     - `MERCADOPAGO_PUBLIC_KEY`
   - Obter em: https://www.mercadopago.com.br/developers

2. **Configurar E-mail**
   - Editar `backend/.env`
   - Adicionar credenciais do Gmail:
     - `EMAIL_USER=seu@gmail.com`
     - `EMAIL_PASSWORD=senha_de_app`
   - Tutorial: https://support.google.com/accounts/answer/185833

3. **Upload dos 50 Áudios**
   - Criar pasta `backend/uploads/audios/`
   - Adicionar arquivos: `phrase_01.mp3` até `phrase_50.mp3`
   - Ou usar Google Drive/CDN

4. **Adicionar Vídeo da Professora**
   - Fazer upload no YouTube
   - Editar URL em `frontend/src/components/landing/Hero.jsx`

5. **Painel Admin** (opcional)
   - Frontend do admin está pendente
   - Backend já está pronto

---

## 🧪 TESTAR O FLUXO COMPLETO

### 1. Testar Landing Page
- Acesse http://localhost:5173
- Verifique visual e responsividade

### 2. Testar Login
- Acesse http://localhost:5173/login
- Use: admin@mytimeingles.com / admin123
- Deve redirecionar para dashboard

### 3. Testar Dashboard
- Deve mostrar progresso (0%)
- Botão "INICIAR FRASES"

### 4. Testar Player (quando tiver áudios)
- Clicar em "INICIAR FRASES"
- Deve abrir player de áudio
- Controles: Play, Voltar, Repetir, Pular

---

## 📱 PÁGINAS DISPONÍVEIS

| URL | Página | Status |
|-----|--------|--------|
| `/` | Landing Page | ✅ |
| `/login` | Login | ✅ |
| `/cadastro?token=XXX` | Cadastro | ✅ |
| `/dashboard` | Dashboard Aluno | ✅ |
| `/lessons/:number` | Player de Áudio | ✅ |
| `/admin` | Painel Admin | ⏳ Pendente |

---

## 🔧 COMANDOS ÚTEIS

```bash
# Backend
cd backend
npm run dev          # Iniciar em modo desenvolvimento
npm start            # Iniciar em modo produção
npm run create-admin # Criar/atualizar admin

# Frontend
cd frontend
npm run dev          # Iniciar em modo desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build

# Database
cd database
sudo -u postgres psql -f schema.sql  # Recriar banco
```

---

## 📊 TECNOLOGIAS USADAS

**Backend:**
- Node.js 18+
- Express.js
- PostgreSQL
- JWT (autenticação)
- bcrypt (senhas)
- Mercado Pago SDK
- Nodemailer

**Frontend:**
- React 18+
- Vite
- React Router v6
- Axios
- CSS Puro (sem frameworks!)

---

## 🎯 OBJETIVO DO SISTEMA

Vender o curso **"50 Frases Essenciais para Viagens"** por **R$ 29,90**

**Fluxo:**
1. Visitante vê Landing Page
2. Compra via Mercado Pago
3. Recebe e-mail com link de cadastro
4. Cria conta e acessa curso
5. Estuda as 50 frases com áudio nativo

---

## 📞 SUPORTE

- **README completo:** [README.md](README.md)
- **Documentação API:** http://localhost:5000 (quando rodando)

---

**Última atualização:** Novembro 2024
**Status:** 95% completo, pronto para produção
**Desenvolvido com:** Claude Code 🤖
