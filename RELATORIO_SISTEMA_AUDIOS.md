# RELATÓRIO DE AUDITORIA - SISTEMA DE ÁUDIOS - MyTime Inglês

## 1. LOCALIZAÇÃO DOS ARQUIVOS DE ÁUDIO

### Diretório Principal
- **Caminho**: `/home/mateus/Documentos/Projetos/mytime-ingles/audios/`
- **Tamanho Total**: 4.9 MB
- **Quantidade de Arquivos**: 50 arquivos de áudio

### Estrutura de Nomes
Os arquivos de áudio seguem um padrão de nomenclatura específico:
- Formato: `{número}.m4a.mp4` ou `{número}b.m4a.mp4`
- Exemplo: `1.m4a.mp4`, `1b.m4a.mp4`, `2.m4a.mp4`, `2b.m4a.mp4`, etc.
- Variação: Alguns arquivos têm espaços nos nomes (ex: `14 b.m4a.mp4`, `15 b.m4a.mp4`, `17 b.m4a.mp4`)

### Classificação dos Áudios
Os 50 arquivos estão divididos em dois grupos:
- **Áudios principais**: 1.m4a.mp4 a 25.m4a.mp4 (25 arquivos)
- **Áudios alternativos (variações "b")**: 1b.m4a.mp4 a 25b.m4a.mp4 (25 arquivos)

---

## 2. COMO OS ÁUDIOS SÃO USADOS NA PLATAFORMA

### Integração com Banco de Dados
O banco de dados (PostgreSQL) possui uma tabela `phrases` que armazena informações sobre cada frase com áudio:

**Campos principais da tabela `phrases`:**
```sql
- id: identificador único
- phrase_number: número da frase (1-50)
- text_en: texto em inglês
- text_pt: tradução em português
- audio_url: URL/caminho do arquivo de áudio
- duration_seconds: duração em segundos
- category: categoria (airport, hotel, restaurant, general)
```

### Modelo de Dados (Backend)
**Arquivo**: `/home/mateus/Documentos/Projetos/mytime-ingles/backend/src/models/Phrase.js`

O modelo Phrase gerencia todas as operações de áudio:
- `create()`: cria nova frase com áudio
- `findByNumber()`: busca frase por número
- `update()`: atualiza informações de áudio
- `createBulk()`: cria múltiplas frases com áudio em lote
- `findAllWithUserProgress()`: retorna frases com áudio e progresso do usuário
- `findByNumberWithUserProgress()`: retorna uma frase específica com áudio e progresso

### Referência em Seed Data (Schema SQL)
**Arquivo**: `/home/mateus/Documentos/Projetos/mytime-ingles/database/schema.sql`

O schema inclui seed data com 10 frases de exemplo:
```sql
(1, 'Where is the bathroom?', 'Onde fica o banheiro?', '/audios/phrase_01.mp3', 'general'),
(2, 'How much does this cost?', 'Quanto custa isso?', '/audios/phrase_02.mp3', 'general'),
...até frase 10
```

**Nota importante**: O seed data referencia arquivos `.mp3` (`/audios/phrase_XX.mp3`), mas os arquivos reais no diretório são `.m4a.mp4`.

---

## 3. PÁGINAS E COMPONENTES QUE USAM ÁUDIO

### Frontend (React)

#### 1. **LessonPage.jsx** (Página Principal de Lições)
**Arquivo**: `/home/mateus/Documentos/Projetos/mytime-ingles/frontend/src/pages/LessonPage.jsx`

Funcionalidades relacionadas a áudio:
- Reproduz o áudio da frase usando a tag HTML5 `<audio>`
- Referencia: `phrase.audio_url` (obtida da API)
- Controles de áudio implementados:
  - **Play/Pause**: botão para reproduzir e pausar (▶️/⏸️)
  - **Barra de progresso**: permite navegar ao longo do áudio
  - **Contador de tempo**: mostra tempo atual e duração total
  - **Botão de repetição**: reinicia o áudio
- Hooks React utilizados:
  - `useRef(audioRef)`: referência ao elemento de áudio
  - `useState(playing)`: controla estado de reprodução
  - `useState(currentTime)`: rastreia tempo atual
  - `useState(duration)`: armazena duração total

**Eventos de áudio monitorados:**
```javascript
- onTimeUpdate: atualiza tempo atual de reprodução
- onLoadedMetadata: obtém duração total do áudio
- onEnded: marca áudio como finalizado
```

#### 2. **StudentDashboard.jsx** (Dashboard do Aluno)
**Arquivo**: `/home/mateus/Documentos/Projetos/mytime-ingles/frontend/src/pages/StudentDashboard.jsx`

- Mostra progresso do aluno (porcentagem de frases estudadas)
- Link para iniciar as lições (que carregam os áudios)
- Não manipula áudio diretamente, mas fornece acesso às lições

#### 3. **CSS para Controles de Áudio**
**Arquivo**: `/home/mateus/Documentos/Projetos/mytime-ingles/frontend/src/pages/LessonPage.css`

Estilos principais:
- `.audio-controls`: container dos controles
- `.play-btn`: botão redondo (60x60px) com gradiente
- `.audio-progress`: barra de progresso horizontal
- `.audio-progress-fill`: preenchimento animado da barra
- `.audio-time`: exibição de tempo (MM:SS / MM:SS)

### Backend (Node.js/Express)

#### 1. **Progress Route** (`/api/progress`)
**Arquivo**: `/home/mateus/Documentos/Projetos/mytime-ingles/backend/src/routes/progress.js`

Endpoint: `GET /api/progress/phrases/:phraseNumber`
- Retorna a frase com seu áudio (audio_url)
- Retorna também o status de conclusão do usuário

#### 2. **Progress Controller**
**Arquivo**: `/home/mateus/Documentos/Projetos/mytime-ingles/backend/src/controllers/progressController.js`

Funções relacionadas:
- `getPhraseByNumber()`: busca frase específica com áudio
- `getPhrasesWithProgress()`: lista todas as frases com áudio e progresso

#### 3. **Admin Routes** (`/api/admin`)
**Arquivo**: `/home/mateus/Documentos/Projetos/mytime-ingles/backend/src/routes/admin.js`

Endpoints para gerenciar áudios:
```
POST /api/admin/phrases - Criar nova frase com áudio
PUT /api/admin/phrases/:phraseNumber - Atualizar frase e áudio
DELETE /api/admin/phrases/:phraseNumber - Deletar frase e referência
POST /api/admin/phrases/bulk - Criar múltiplas frases com áudio
```

#### 4. **Admin Controller**
**Arquivo**: `/home/mateus/Documentos/Projetos/mytime-ingles/backend/src/controllers/adminController.js`

Funções:
- `createPhrase()`: recebe dados incluindo `audio_url`
- `updatePhrase()`: permite atualizar `audio_url`
- `createBulkPhrases()`: cria frases em lote com `audio_url`

---

## 4. PADRÕES DE REFERÊNCIA A ÁUDIO NO CÓDIGO

### Termos Utilizados
| Termo | Ocorrências | Contexto |
|-------|-------------|---------|
| `audio` | Múltiplas | Tag HTML, ref, useState |
| `audio_url` | Crítico | Campo do banco de dados e API |
| `playing` | Estado | Controla reprodução |
| `currentTime` | Estado | Rastreia posição no áudio |
| `duration` | Estado | Armazena duração total |
| `.m4a.mp4` | Arquivos reais | Extensão dos arquivos de áudio |
| `.mp3` | Seed data | Extensão referenciada no schema (não implementada) |

### Padrões em Arquivos de Código

#### Frontend (LessonPage.jsx)
```javascript
// Referência ao áudio
<audio
  ref={audioRef}
  src={phrase.audio_url}  // URL da API
  onTimeUpdate={handleTimeUpdate}
  onLoadedMetadata={handleLoadedMetadata}
  onEnded={() => setPlaying(false)}
/>

// Controles
audioRef.current?.play()
audioRef.current?.pause()
audioRef.current.currentTime = newTime
```

#### Backend (Database)
```sql
-- Campo para armazenar URL do áudio
audio_url VARCHAR(500) NOT NULL

-- Seed data
INSERT INTO phrases (..., audio_url, ...)
VALUES (..., '/audios/phrase_01.mp3', ...)
```

#### API (Admin Controller)
```javascript
// Criação com áudio
const phrase = await Phrase.create({
  phrase_number,
  text_en,
  text_pt,
  audio_url,      // Campo necessário
  duration_seconds,
  category
});
```

---

## 5. QUANTIDADE E LISTA COMPLETA DE ÁUDIOS

### Total: 50 arquivos (4.9 MB)

#### Grupo 1 - Áudios Principais (1-25)
```
1.m4a.mp4       11.m4a.mp4      21.m4a.mp4
2.m4a.mp4       12.m4a.mp4      22.m4a.mp4
3.m4a.mp4       13.m4a.mp4      23.m4a.mp4
4.m4a.mp4       14.m4a.mp4      24.m4a.mp4
5.m4a.mp4       15.m4a.mp4      25.m4a.mp4
6.m4a.mp4       16.m4a.mp4
7.m4a.mp4       17.m4a.mp4
8.m4a.mp4       18.m4a.mp4
9.m4a.mp4       19.m4a.mp4
10.m4a.mp4      20.m4a.mp4
```

#### Grupo 2 - Áudios Alternativos/Variações "b" (1b-25b)
```
1b.m4a.mp4      11b.m4a.mp4     21b.m4a.mp4
2b.m4a.mp4      12b.m4a.mp4     22b.m4a.mp4
3b.m4a.mp4      13b.m4a.mp4     23b.m4a.mp4
4b.m4a.mp4      14 b.m4a.mp4    24b.m4a.mp4
5b.m4a.mp4      15 b.m4a.mp4    25b.m4a.mp4
6b.m4a.mp4      16b.m4a.mp4
7b.m4a.mp4      17 b.m4a.mp4
8b.m4a.mp4      18b.m4a.mp4
9b.m4a.mp4      19b.m4a.mp4
10b.m4a.mp4     20b.m4a.mp4
```

**Nota sobre inconsistência de nomes**: Alguns arquivos têm espaços nos nomes (14 b, 15 b, 17 b) enquanto outros usam sem espaço (1b, 2b, etc.).

---

## 6. FLUXO DE DADOS - ÁUDIO NA PLATAFORMA

```
┌─────────────────────────────────────────────────┐
│           BANCO DE DADOS                        │
│  Tabela: phrases                                │
│  - phrase_number (1-50)                         │
│  - audio_url: /audios/[arquivo].m4a.mp4        │
│  - duration_seconds                             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           API BACKEND (Express)                 │
│  GET /api/progress/phrases/:phraseNumber        │
│  Retorna: { phrase: { audio_url, ... } }       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           FRONTEND (React)                      │
│  LessonPage.jsx                                 │
│  <audio src={phrase.audio_url} ref={audioRef}> │
│  Controles: Play, Progress, Tempo              │
└─────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           DIRETÓRIO DE ÁUDIOS                   │
│  /audios/1.m4a.mp4, /audios/2.m4a.mp4, etc.   │
│  (Servidor estático)                            │
└─────────────────────────────────────────────────┘
```

---

## 7. INCONSISTÊNCIAS E PROBLEMAS IDENTIFICADOS

### Issue 1: Incompatibilidade de Formato
- **Problema**: O schema SQL referencia arquivos `.mp3` (`/audios/phrase_01.mp3`)
- **Realidade**: Os arquivos reais são `.m4a.mp4`
- **Impacto**: Se usar o seed data padrão, os áudios não serão encontrados
- **Status**: Crítico - necessário atualizar referências

### Issue 2: Nomes de Arquivos Inconsistentes
- **Problema**: Alguns arquivos "b" têm espaços (`14 b.m4a.mp4`) e outros não (`1b.m4a.mp4`)
- **Impacto**: Possível erro ao referenciar estes arquivos específicos
- **Arquivos afetados**: 14 b.m4a.mp4, 15 b.m4a.mp4, 17 b.m4a.mp4

### Issue 3: Significado das Variações "b"
- **Pergunta**: Por que existem dois áudios para cada frase (1.m4a.mp4 e 1b.m4a.mp4)?
- **Possibilidade**: Áudios de diferentes locutores (nativo + aluno/lento)
- **Recomendação**: Documentar e padronizar o uso

### Issue 4: Falta de Validação de URL
- **Problema**: Não há validação do campo `audio_url` ao criar/atualizar frases
- **Risco**: URLs inválidas podem ser salvas no banco de dados
- **Recomendação**: Implementar validação antes de persistir

---

## 8. RESUMO EXECUTIVO

### Arquitetura de Áudio
- **Storage**: Sistema de arquivos (diretório `/audios/`)
- **Referência**: URL armazenada em banco de dados (`audio_url`)
- **Reprodução**: HTML5 `<audio>` tag no frontend React
- **Gerenciamento**: Admin panel via API REST

### Cobertura
- **Páginas que usam áudio**: 1 principal (LessonPage.jsx)
- **Componentes de controle**: Implementados na LessonPage
- **Endpoints de áudio**: 4 endpoints de progresso + 4 endpoints de admin
- **Quantos áudios**: 50 áudios (25 principais + 25 variações)

### Status Geral
- Implementação funcional para reprodução de áudio
- Sistema de gerenciamento via API para admins
- **Necessário**: Sincronizar nomes de arquivos com referências no banco

