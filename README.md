# 🎓 MyTime Inglês - Plataforma de Ensino Online

Sistema completo de ensino de inglês online com integração de pagamentos e gestão de alunos.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Deploy](#deploy)

---

## 🎯 Sobre o Projeto

O **MyTime Inglês** é uma plataforma completa de ensino de inglês online, focada no curso "50 Frases Essenciais para Viagens Internacionais". O sistema inclui:

- 🌐 Landing Page profissional para vendas
- 💳 Integração com Mercado Pago (PIX, Cartão, Boleto)
- 📧 Sistema de e-mails automáticos
- 🎓 Plataforma de estudos com player de áudio
- 📊 Painel administrativo completo
- 🔐 Sistema de autenticação seguro (JWT)

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** 18+
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas
- **Mercado Pago SDK** - Pagamentos
- **Nodemailer** - Envio de e-mails

### Frontend
- **React.js** 18+
- **Vite** - Build tool
- **React Router DOM** v6 - Rotas
- **Axios** - Requisições HTTP
- **CSS puro** - Estilização (sem frameworks)

### Banco de Dados
- **PostgreSQL** 14+

---

## ✨ Funcionalidades

### Para Alunos:
- ✅ Compra do curso via Mercado Pago
- ✅ Cadastro seguro com token único
- ✅ Login e autenticação
- ✅ Dashboard com progresso visual
- ✅ Player de áudio com 50 frases
- ✅ Legendas sincronizadas
- ✅ Marcação de progresso
- ✅ Acesso vitalício

### Para Administradores:
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de alunos
- ✅ Relatórios de vendas
- ✅ Upload de conteúdo (áudios/frases)
- ✅ Visualização de pagamentos

---

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado
- npm ou yarn

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/mytime-ingles.git
cd mytime-ingles
```

### 2. Instale as dependências do backend

```bash
cd backend
npm install
```

### 3. Instale as dependências do frontend

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuração

### 1. Configurar Banco de Dados

#### Opção A: Usando o script automático

```bash
cd database
chmod +x create_database.sh
./create_database.sh
```

#### Opção B: Manual

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Criar banco de dados
CREATE DATABASE mytime_ingles;

# Conectar ao banco
\c mytime_ingles

# Executar schema
\i schema.sql
```

### 2. Configurar variáveis de ambiente do Backend

Copie o arquivo `.env.example` e configure:

```bash
cd backend
cp .env.example .env
nano .env
```

Edite as seguintes variáveis:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mytime_ingles
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=sua_chave_secreta_super_segura
JWT_EXPIRES_IN=24h

# Mercado Pago (obter em https://www.mercadopago.com.br/developers)
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=seu_public_key_aqui
COURSE_PRICE=29.90

# Email (usar Gmail App Password ou SendGrid)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app
EMAIL_FROM="MyTime Inglês <noreply@mytimeingles.com>"

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Configurar variáveis de ambiente do Frontend

```bash
cd frontend
cp .env.example .env
nano .env
```

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Uso

### Iniciar o Backend

```bash
cd backend
npm run dev
```

O servidor estará rodando em: `http://localhost:5000`

### Iniciar o Frontend

```bash
cd frontend
npm run dev
```

O frontend estará rodando em: `http://localhost:5173`

### Acessar a aplicação

- **Landing Page:** http://localhost:5173
- **Login:** http://localhost:5173/login
- **API:** http://localhost:5000
- **API Docs:** http://localhost:5000/

---

## 📁 Estrutura do Projeto

```
mytime-ingles/
├── backend/
│   ├── src/
│   │   ├── config/         # Configurações (DB, env)
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── models/         # Modelos do banco
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares (auth, etc)
│   │   ├── services/       # Serviços (email, mercadopago)
│   │   ├── utils/          # Utilitários (validações)
│   │   └── server.js       # Servidor principal
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── mytime_logo.jpeg
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/    # Componentes da Landing Page
│   │   │   ├── auth/       # Componentes de autenticação
│   │   │   ├── student/    # Componentes do aluno
│   │   │   ├── admin/      # Componentes admin
│   │   │   └── shared/     # Componentes compartilhados
│   │   ├── pages/          # Páginas principais
│   │   ├── services/       # Serviços (API, auth)
│   │   ├── styles/         # Estilos globais
│   │   ├── App.jsx         # Componente principal
│   │   └── main.jsx        # Ponto de entrada
│   ├── .env
│   └── package.json
├── database/
│   ├── schema.sql          # Schema do PostgreSQL
│   └── create_database.sh  # Script de criação
└── README.md
```

---

## 🌐 API Endpoints

### Autenticação

```
POST   /api/auth/login                - Login de usuário
POST   /api/auth/signup               - Cadastro com token
GET    /api/auth/validate-token       - Validar token de cadastro
GET    /api/auth/verify               - Verificar autenticação
POST   /api/auth/request-password-reset - Solicitar reset de senha
POST   /api/auth/reset-password       - Resetar senha
```

### Pagamentos

```
POST   /api/payments/create-preference - Criar preferência Mercado Pago
POST   /api/payments/webhook           - Webhook Mercado Pago
GET    /api/payments/status/:id        - Status do pagamento
```

### Usuários

```
GET    /api/users/profile              - Obter perfil
PUT    /api/users/profile              - Atualizar perfil
PUT    /api/users/password             - Atualizar senha
```

### Progresso

```
GET    /api/progress                   - Obter progresso do usuário
GET    /api/progress/phrases           - Listar todas as frases
GET    /api/progress/phrases/:number   - Obter frase específica
POST   /api/progress/phrases/:number/complete   - Marcar como concluída
POST   /api/progress/phrases/:number/incomplete - Desmarcar
```

### Admin (requer autenticação de admin)

```
GET    /api/admin/dashboard            - Estatísticas gerais
GET    /api/admin/students             - Listar alunos
GET    /api/admin/purchases            - Listar compras
GET    /api/admin/sales                - Vendas por dia
POST   /api/admin/phrases              - Criar frase
PUT    /api/admin/phrases/:number      - Atualizar frase
DELETE /api/admin/phrases/:number      - Deletar frase
POST   /api/admin/phrases/bulk         - Criar múltiplas frases
```

---

## 🔐 Segurança

O sistema implementa as seguintes medidas de segurança:

- ✅ Senhas criptografadas com bcrypt (salt rounds: 10)
- ✅ Tokens JWT com expiração (24h)
- ✅ Tokens de cadastro únicos e expiráveis (48h)
- ✅ CORS configurado
- ✅ Validação de entrada em todas as rotas
- ✅ Proteção contra SQL injection
- ✅ Proteção contra XSS
- ✅ Rate limiting (implementar em produção)

---

## 🚀 Deploy

### Deploy no Digital Ocean (Recomendado)

#### 1. Criar Droplet

- Acesse https://www.digitalocean.com
- Crie um Droplet Ubuntu 22.04
- Tamanho recomendado: $12/mês (2GB RAM)

#### 2. Configurar servidor

```bash
# Conectar via SSH
ssh root@seu_ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar PostgreSQL
apt install -y postgresql postgresql-contrib

# Instalar Nginx
apt install -y nginx

# Instalar PM2
npm install -g pm2
```

#### 3. Clonar e configurar projeto

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/mytime-ingles.git
cd mytime-ingles

# Configurar backend
cd backend
npm install
cp .env.example .env
nano .env  # Editar variáveis de produção

# Configurar banco de dados
cd ../database
chmod +x create_database.sh
./create_database.sh

# Build do frontend
cd ../frontend
npm install
npm run build
```

#### 4. Configurar PM2

```bash
cd backend
pm2 start src/server.js --name mytime-api
pm2 startup
pm2 save
```

#### 5. Configurar Nginx

```bash
nano /etc/nginx/sites-available/mytime
```

```nginx
server {
    listen 80;
    server_name seu_dominio.com;

    # Frontend
    location / {
        root /root/mytime-ingles/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/mytime /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 6. Configurar SSL (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d seu_dominio.com
```

---

## 📝 Próximos Passos

- [ ] Implementar Painel Administrativo completo
- [ ] Adicionar mais métodos de pagamento
- [ ] Implementar sistema de certificados
- [ ] Adicionar notificações push
- [ ] Criar app mobile (React Native)
- [ ] Implementar gamificação
- [ ] Adicionar testes automatizados

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

**MyTime Inglês Team**

- Website: [mytimeingles.com](https://mytimeingles.com)
- Email: contato@mytimeingles.com

---

## 🙏 Agradecimentos

- Mercado Pago pela API de pagamentos
- React.js e Vite pela incrível experiência de desenvolvimento
- PostgreSQL pela robustez do banco de dados

---

**Desenvolvido com ❤️ por Mateus Bonette**
