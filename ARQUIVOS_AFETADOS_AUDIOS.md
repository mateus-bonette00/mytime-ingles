# Arquivos Relacionados ao Sistema de Áudios

## Resumo de Impacto

| Tipo | Quantidade | Exemplos |
|------|-----------|----------|
| Arquivos de Áudio | 50 | 1.m4a.mp4, 1b.m4a.mp4, ... 25b.m4a.mp4 |
| Arquivos de BD | 1 | schema.sql |
| Modelos | 1 | Phrase.js |
| Rotas | 2 | progress.js, admin.js |
| Controllers | 2 | progressController.js, adminController.js |
| Páginas React | 2 | LessonPage.jsx, StudentDashboard.jsx |
| CSS | 1 | LessonPage.css |
| Serviços | 1 | api.js (indiretamente) |
| **Total** | **10 arquivos de código** | **+ 50 arquivos de áudio** |

---

## Detalhamento por Categoria

### 1. Arquivos de Áudio (50 arquivos)

**Localização**: `/home/mateus/Documentos/Projetos/mytime-ingles/audios/`

**Tamanho**: 4.9 MB total

**Arquivos**:
```
Principais (1-25):
1.m4a.mp4, 2.m4a.mp4, 3.m4a.mp4, 4.m4a.mp4, 5.m4a.mp4,
6.m4a.mp4, 7.m4a.mp4, 8.m4a.mp4, 9.m4a.mp4, 10.m4a.mp4,
11.m4a.mp4, 12.m4a.mp4, 13.m4a.mp4, 14.m4a.mp4, 15.m4a.mp4,
16.m4a.mp4, 17.m4a.mp4, 18.m4a.mp4, 19.m4a.mp4, 20.m4a.mp4,
21.m4a.mp4, 22.m4a.mp4, 23.m4a.mp4, 24.m4a.mp4, 25.m4a.mp4

Variações "b" (1b-25b):
1b.m4a.mp4, 2b.m4a.mp4, 3b.m4a.mp4, 4b.m4a.mp4, 5b.m4a.mp4,
6b.m4a.mp4, 7b.m4a.mp4, 8b.m4a.mp4, 9b.m4a.mp4, 10b.m4a.mp4,
11b.m4a.mp4, 12b.m4a.mp4, 13b.m4a.mp4, 14 b.m4a.mp4, 15 b.m4a.mp4,
16b.m4a.mp4, 17 b.m4a.mp4, 18b.m4a.mp4, 19b.m4a.mp4, 20b.m4a.mp4,
21b.m4a.mp4, 22b.m4a.mp4, 23b.m4a.mp4, 24b.m4a.mp4, 25b.m4a.mp4
```

**Inconsistências Identificadas**:
- 3 arquivos com espaços nos nomes: `14 b.m4a.mp4`, `15 b.m4a.mp4`, `17 b.m4a.mp4`
- Todos os outros usam padrão sem espaço

**Status**: Arquivos presentes e funcionais

---

### 2. Banco de Dados

#### Arquivo: `/home/mateus/Documentos/Projetos/mytime-ingles/database/schema.sql`

**Linhas críticas**: 97-114 (definição da tabela `phrases`)

**Código relevante**:
```sql
CREATE TABLE IF NOT EXISTS phrases (
  id SERIAL PRIMARY KEY,
  phrase_number INTEGER UNIQUE NOT NULL CHECK (phrase_number >= 1 AND phrase_number <= 50),
  text_en VARCHAR(500) NOT NULL,
  text_pt VARCHAR(500),
  audio_url VARCHAR(500) NOT NULL,  <-- CAMPO DE ÁUDIO
  duration_seconds INTEGER,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Seed Data**: Linhas 179-190

**Problema**: Referencia `.mp3` em vez de `.m4a.mp4`
```sql
INSERT INTO phrases (phrase_number, text_en, text_pt, audio_url, category) VALUES
(1, 'Where is the bathroom?', 'Onde fica o banheiro?', '/audios/phrase_01.mp3', 'general'),
(2, 'How much does this cost?', 'Quanto custa isso?', '/audios/phrase_02.mp3', 'general'),
-- ... até frase 10
```

**Impacto**: CRÍTICO - Seed data não funciona com nomes reais de arquivo

**Recomendação**: Atualizar para `/audios/1.m4a.mp4`, `/audios/2.m4a.mp4`, etc.

---

### 3. Modelos (Backend)

#### Arquivo: `/home/mateus/Documentos/Projetos/mytime-ingles/backend/src/models/Phrase.js`

**Funções relacionadas a áudio**:

| Função | Linha | Operação | Campo |
|--------|-------|----------|-------|
| `create()` | 7-23 | INSERT | audio_url |
| `update()` | 75-98 | UPDATE | audio_url (campo permitido) |
| `createBulk()` | 177-211 | INSERT BULK | audio_url |
| `findByNumberWithUserProgress()` | 144-157 | SELECT | audio_url retornado |
| `findAllWithUserProgress()` | 126-139 | SELECT | audio_url retornado |

**Campos aceitos na atualização** (linha 76):
```javascript
const allowedFields = ['text_en', 'text_pt', 'audio_url', 'duration_seconds', 'category'];
```

**Status**: Modelo completamente funcional para operações CRUD com áudio

---

### 4. Rotas (Backend)

#### Arquivo: `/home/mateus/Documentos/Projetos/mytime-ingles/backend/src/routes/progress.js`

**Endpoints com áudio**:

| Método | Rota | Função | Retorna audio_url |
|--------|------|--------|------------------|
| GET | `/phrases` | getPhrasesWithProgress | SIM |
| GET | `/phrases/:phraseNumber` | getPhraseByNumber | SIM |
| POST | `/phrases/:phraseNumber/complete` | markPhraseCompleted | NÃO |
| POST | `/phrases/:phraseNumber/incomplete` | markPhraseIncomplete | NÃO |

**Código relevante** (linha 17):
```javascript
router.get('/phrases/:phraseNumber', progressController.getPhraseByNumber);
```

**Status**: Funcional

---

#### Arquivo: `/home/mateus/Documentos/Projetos/mytime-ingles/backend/src/routes/admin.js`

**Endpoints com gerenciamento de áudio**:

| Método | Rota | Função | Campo audio_url |
|--------|------|--------|-----------------|
| POST | `/phrases` | createPhrase | Aceita (req.body) |
| PUT | `/phrases/:phraseNumber` | updatePhrase | Aceita (req.body) |
| DELETE | `/phrases/:phraseNumber` | deletePhrase | Referência removida |
| POST | `/phrases/bulk` | createBulkPhrases | Aceita array |

**Status**: Funcional para CRUD

---

### 5. Controllers (Backend)

#### Arquivo: `/home/mateus/Documentos/Projetos/mytime-ingles/backend/src/controllers/progressController.js`

**Funções relacionadas**:

| Função | Linha | Retorna audio_url |
|--------|-------|------------------|
| `getPhraseByNumber()` | 43-56 | SIM (via Phrase model) |
| `getPhrasesWithProgress()` | 34-41 | SIM (via Phrase model) |

**Exemplo de resposta** (linha 52):
```javascript
res.json({ phrase });  // phrase inclui audio_url
```

**Status**: Funcional

---

#### Arquivo: `/home/mateus/Documentos/Projetos/mytime-ingles/backend/src/controllers/adminController.js`

**Funções relacionadas**:

| Função | Linha | Operação | Campo |
|--------|-------|----------|-------|
| `createPhrase()` | 56-63 | INSERT | Recebe audio_url via req.body |
| `updatePhrase()` | 65-73 | UPDATE | Pode atualizar audio_url |
| `deletePhrase()` | 75-83 | DELETE | Remove referência |
| `createBulkPhrases()` | 85-93 | INSERT BULK | Importa audio_url em lote |

**Código relevante** (linha 58):
```javascript
const phrase = await Phrase.create(req.body);
// req.body deve incluir: audio_url, text_en, text_pt, phrase_number, etc.
```

**Status**: Funcional, aceita audio_url

**Falta**: Validação se arquivo de áudio existe antes de salvar

---

### 6. Frontend - Páginas

#### Arquivo: `/home/mateus/Documentos/Projetos/mytime-ingles/frontend/src/pages/LessonPage.jsx`

**Linhas críticas**: 1-181

**Elementos relacionados a áudio**:

| Elemento | Linha | Funcionalidade |
|----------|-------|----------------|
| audioRef | 10 | useRef para elemento <audio> |
| playing | 14 | State: está reproduzindo? |
| currentTime | 15 | State: posição atual |
| duration | 16 | State: duração total |
| fetchPhrase() | 22-31 | GET /api/progress/phrases/:phraseNumber |
| handlePlayPause() | 33-40 | Reproduz/pausa áudio |
| handleTimeUpdate() | 42-44 | onTimeUpdate listener |
| handleLoadedMetadata() | 46-48 | onLoadedMetadata listener |
| handleSeek() | 50-56 | Permite navegar no áudio |
| handleRepeat() | 70-74 | Reinicia o áudio |
| <audio> tag | 120-126 | Element HTML5 |

**Código principal** (linhas 120-126):
```javascript
<audio
  ref={audioRef}
  src={phrase.audio_url}  // <-- REFERÊNCIA CRÍTICA
  onTimeUpdate={handleTimeUpdate}
  onLoadedMetadata={handleLoadedMetadata}
  onEnded={() => setPlaying(false)}
/>
```

**Status**: Totalmente implementado e funcional

---

#### Arquivo: `/home/mateus/Documentos/Projetos/mytime-ingles/frontend/src/pages/StudentDashboard.jsx`

**Relação com áudio**: Indireta

**Linhas relevantes**:
- Linha 30: `navigate('/lessons/1')` - leva para LessonPage onde áudio é reproduzido
- Nenhuma manipulação direta de áudio

**Status**: Funcional como ponto de entrada

---

### 7. Frontend - CSS

#### Arquivo: `/home/mateus/Documentos/Projetos/mytime-ingles/frontend/src/pages/LessonPage.css`

**Classes de áudio**:

| Classe | Linhas | Propósito |
|--------|--------|----------|
| `.audio-controls` | 76-81 | Container para controles |
| `.play-btn` | 83-97 | Botão redondo (▶️/⏸️) |
| `.audio-progress` | 99-106 | Barra de progresso |
| `.audio-progress-fill` | 108-112 | Preenchimento animado |
| `.audio-time` | 114-120 | Display de tempo (MM:SS / MM:SS) |

**Estilos principais**:
```css
.play-btn {
  width: 60px;
  height: 60px;
  background: var(--gradient-reverse);
  border: none;
  font-size: var(--text-3xl);
  cursor: pointer;
}

.audio-progress {
  flex: 1;
  height: 12px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  cursor: pointer;
}

.audio-progress-fill {
  height: 100%;
  background: var(--gradient-main);
  transition: width 0.1s linear;
}
```

**Status**: Totalmente implementado

---

### 8. Serviços (Frontend)

#### Arquivo: `/home/mateus/Documentos/Projetos/mytime-ingles/frontend/src/services/api.js`

**Relação com áudio**: Indireta

**Endpoints utilizados**:
- `api.get('/progress/phrases/:phraseNumber')` - retorna phrase com audio_url

**Status**: Funcional, sem alterações necessárias específicas para áudio

---

## Mapeamento de Dependências

```
DATABASE (schema.sql)
└── phrases table
    └── audio_url field
        └── referenced by Backend

BACKEND (Node.js/Express)
├── Phrase Model
│   ├── create(audio_url)
│   ├── update(audio_url)
│   └── createBulk(audio_url)
├── progressController
│   ├── getPhraseByNumber() -> retorna audio_url
│   └── getPhrasesWithProgress() -> retorna audio_url
├── adminController
│   ├── createPhrase() -> aceita audio_url
│   ├── updatePhrase() -> atualiza audio_url
│   └── createBulkPhrases() -> importa audio_url
└── Routes (progress, admin)
    └── expõem endpoints

FRONTEND (React)
├── LessonPage.jsx
│   ├── fetchPhrase() -> GET /api/progress/phrases/:phraseNumber
│   ├── audioRef -> <audio src={phrase.audio_url} />
│   ├── handlePlayPause() -> audioRef.current.play/pause()
│   ├── handleTimeUpdate() -> atualiza progresso
│   └── handleLoadedMetadata() -> obtém duração
├── LessonPage.css
│   ├── .play-btn (estilos do botão)
│   ├── .audio-progress (barra de progresso)
│   └── .audio-time (display de tempo)
└── StudentDashboard.jsx
    └── navigate('/lessons/1') -> leva para LessonPage

FILES (Filesystem)
└── /audios/
    ├── 1.m4a.mp4 ... 25.m4a.mp4 (25 principais)
    └── 1b.m4a.mp4 ... 25b.m4a.mp4 (25 variações)
```

---

## Resumo de Impacto Técnico

### Componentes Afetados por Mudança de Nome de Arquivo
Se renomear arquivos de áudio, será necessário atualizar:
1. `schema.sql` - seed data (linhas 179-190)
2. Banco de dados existente (se houver dados já inseridos)
3. URLs em produção (se houver referências em cache/CDN)

### Componentes Dependentes de `audio_url`
- `LessonPage.jsx` - depende de `phrase.audio_url` estar correto
- `api.js` - retorna resposta com `audio_url`
- Database - armazena `audio_url`

### Componentes Que Validam Entrada de `audio_url`
- NENHUM - não há validação de existência do arquivo
- RECOMENDAÇÃO: Implementar validação antes de salvar

---

## Checklist de Arquivos para Revisar

- [x] `/audios/` - Arquivos de áudio (50 arquivos)
- [x] `database/schema.sql` - Definição de tabela e seed data
- [x] `backend/src/models/Phrase.js` - Modelo de dados
- [x] `backend/src/routes/progress.js` - Rotas de progresso
- [x] `backend/src/routes/admin.js` - Rotas de admin
- [x] `backend/src/controllers/progressController.js` - Lógica de progresso
- [x] `backend/src/controllers/adminController.js` - Lógica de admin
- [x] `frontend/src/pages/LessonPage.jsx` - Página de lição (principal)
- [x] `frontend/src/pages/LessonPage.css` - Estilos de áudio
- [x] `frontend/src/pages/StudentDashboard.jsx` - Dashboard

---

## Arquivos NÃO Relacionados

Os seguintes arquivos **NÃO** usam áudio e não precisam de alterações:

- Landing page components
- Auth components
- Payment components
- User model
- Purchase model
- Footer, Header, etc.

