# Índice - Auditoria do Sistema de Áudios

## Documentação Criada

Esta auditoria gerou 4 documentos principais para entender o sistema de áudios do projeto MyTime Inglês:

### 1. RELATORIO_SISTEMA_AUDIOS.md (13 KB)
**Relatório Completo e Detalhado**

Documento mais abrangente da auditoria. Contém:
- Localização dos arquivos de áudio
- Como os áudios são usados (banco de dados, backend, frontend)
- Detalhamento de todas as páginas e componentes
- Padrões de referência a áudio no código
- Lista completa de 50 áudios
- Fluxo de dados (diagrama ASCII)
- Problemas críticos identificados
- Resumo executivo

**Use este documento para**: Compreensão completa do sistema

---

### 2. SUMARIO_AUDIOS.txt (4.5 KB)
**Sumário Executivo Rápido**

Documento conciso com visão geral. Contém:
- Localização e tamanho dos áudios
- Como são usados (resumido)
- Árvore de componentes que usam áudio
- Padrões de referência
- Quantidade de áudios
- Problemas críticos (resumidos)
- Recomendações
- Arquivos importantes

**Use este documento para**: Visão geral rápida (5 minutos de leitura)

---

### 3. DIAGRAMA_FLUXO_AUDIOS.txt (11 KB)
**Diagramas e Arquitetura Visual**

Documento visual com diagramas ASCII. Contém:
1. Fluxo de carregamento de áudio passo-a-passo
2. Arquitetura de armazenamento e referência
3. Componentes e funções envolvidas
4. Endpoints da API
5. Estrutura de dados
6. Padrão de resposta da API

**Use este documento para**: Entender visualmente o fluxo e arquitetura

---

### 4. ARQUIVOS_AFETADOS_AUDIOS.md (12 KB)
**Mapeamento Detalhado de Arquivos**

Documento técnico com referências de código. Contém:
- Resumo de impacto (tabela)
- Detalhamento por categoria (8 seções)
- Linhas de código específicas
- Mapeamento de dependências
- Resumo de impacto técnico
- Checklist de arquivos
- Arquivos não relacionados

**Use este documento para**: Entender qual arquivo afeta o quê

---

## Respostas Diretas às Suas Perguntas

### 1. Onde estão os arquivos de áudio?

**Resposta**: `/home/mateus/Documentos/Projetos/mytime-ingles/audios/`

**Tamanho**: 4.9 MB
**Quantidade**: 50 arquivos

Veja: SUMARIO_AUDIOS.txt (seção 1) ou RELATORIO_SISTEMA_AUDIOS.md (seção 1)

---

### 2. Como os áudios são usados na plataforma?

**Resposta**: 
1. Banco de dados: Tabela `phrases` com campo `audio_url`
2. Backend: API REST retorna `audio_url` para cada frase
3. Frontend: Reprodutor HTML5 com controles customizados
4. Fluxo: DB → API → React → <audio> tag → arquivo

Veja: 
- SUMARIO_AUDIOS.txt (seção 2)
- RELATORIO_SISTEMA_AUDIOS.md (seção 2)
- DIAGRAMA_FLUXO_AUDIOS.txt (seção 1)

---

### 3. Quais páginas ou componentes usam áudio?

**Resposta**: 
- Principal: `LessonPage.jsx` (reprodutor com controles)
- Secundário: `StudentDashboard.jsx` (acesso indireto)
- Estilos: `LessonPage.css`

Veja:
- SUMARIO_AUDIOS.txt (seção 3)
- RELATORIO_SISTEMA_AUDIOS.md (seção 3)
- ARQUIVOS_AFETADOS_AUDIOS.md (seção 6)

---

### 4. Como os áudios estão atualmente referenciados?

**Resposta**:
- Campo: `audio_url`
- Padrão: `/audios/{número}.m4a.mp4` ou `/audios/{número}b.m4a.mp4`
- Extensão: `.m4a.mp4`
- Problema: Seed data referencia `.mp3` (incompatível)

Veja:
- SUMARIO_AUDIOS.txt (seção 4)
- RELATORIO_SISTEMA_AUDIOS.md (seção 4)
- RELATORIO_SISTEMA_AUDIOS.md (seção 7 - Problemas)

---

### 5. Quantos áudios existem na pasta?

**Resposta**: 50 arquivos (4.9 MB)

- 25 áudios principais: 1.m4a.mp4 a 25.m4a.mp4
- 25 variações "b": 1b.m4a.mp4 a 25b.m4a.mp4

Nota: 3 arquivos têm espaços nos nomes (14 b, 15 b, 17 b)

Veja:
- SUMARIO_AUDIOS.txt (seção 5)
- RELATORIO_SISTEMA_AUDIOS.md (seção 5)

---

## Problemas Críticos Encontrados

### 1. Incompatibilidade de Formato (CRÍTICO)
- Schema SQL referencia `.mp3` (`/audios/phrase_01.mp3`)
- Arquivos reais são `.m4a.mp4` (1.m4a.mp4, etc.)
- Seed data não funciona com nomes reais

Veja: RELATORIO_SISTEMA_AUDIOS.md (seção 7.1)

### 2. Nomes Inconsistentes
- 3 arquivos com espaços: `14 b.m4a.mp4`, `15 b.m4a.mp4`, `17 b.m4a.mp4`
- Demais sem espaço: `1b.m4a.mp4`, `2b.m4a.mp4`, etc.

Veja: RELATORIO_SISTEMA_AUDIOS.md (seção 7.2)

### 3. Significado Obscuro das Variações "b"
- Por que 25 áudios "b"?
- Possível: Diferentes locutores
- Possível: Diferentes velocidades
- Falta: Documentação

Veja: RELATORIO_SISTEMA_AUDIOS.md (seção 7.3)

### 4. Falta de Validação
- Não há validação se arquivo existe antes de salvar em BD
- URLs inválidas podem ser persistidas

Veja: RELATORIO_SISTEMA_AUDIOS.md (seção 7.4)

---

## Arquivos Críticos para o Sistema de Áudio

### Backend
- `/backend/src/models/Phrase.js` - Gerencia dados de áudio
- `/backend/src/routes/progress.js` - Endpoints de áudio
- `/backend/src/routes/admin.js` - Admin endpoints
- `/backend/src/controllers/progressController.js` - Lógica
- `/backend/src/controllers/adminController.js` - Lógica

### Frontend
- `/frontend/src/pages/LessonPage.jsx` - Reprodutor principal
- `/frontend/src/pages/LessonPage.css` - Estilos de áudio
- `/frontend/src/pages/StudentDashboard.jsx` - Acesso

### Database
- `/database/schema.sql` - Definição e seed data

### Áudios
- `/audios/` - 50 arquivos de áudio

Veja: ARQUIVOS_AFETADOS_AUDIOS.md para detalhes completos

---

## Fluxo de Carregamento de Áudio (Resumido)

```
Usuário acessa /lessons/1
    ↓
LessonPage.jsx carrega
    ↓
Faz GET /api/progress/phrases/1
    ↓
Backend retorna {phrase: {audio_url: "/audios/1.m4a.mp4", ...}}
    ↓
Frontend renderiza <audio src="/audios/1.m4a.mp4" />
    ↓
Usuário clica Play
    ↓
audioRef.current?.play()
    ↓
HTML5 Audio Tag reproduz arquivo
    ↓
onTimeUpdate, onLoadedMetadata, onEnded disparam eventos
    ↓
Interface atualiza com progresso
```

Veja: DIAGRAMA_FLUXO_AUDIOS.txt para versão detalhada

---

## Recomendações Imediatas

1. **Sincronizar nomes** de arquivos no schema.sql com arquivos reais
2. **Renomear arquivos** com espaços para padrão sem espaço
3. **Documentar propósito** das variações "b"
4. **Implementar validação** de audio_url na API

Veja: SUMARIO_AUDIOS.txt (seção "RECOMENDAÇÕES")

---

## Como Usar Esta Documentação

### Se você tem 5 minutos
Leia: SUMARIO_AUDIOS.txt

### Se você tem 15 minutos
Leia: 
1. SUMARIO_AUDIOS.txt
2. DIAGRAMA_FLUXO_AUDIOS.txt (seção 1-2)

### Se você tem 30 minutos
Leia: RELATORIO_SISTEMA_AUDIOS.md (completo)

### Se você precisa entender detalhes técnicos
Leia: ARQUIVOS_AFETADOS_AUDIOS.md

### Se você precisa rastrear um problema
1. Procure o arquivo em ARQUIVOS_AFETADOS_AUDIOS.md
2. Leia a seção correspondente
3. Veja as linhas de código específicas
4. Consulte DIAGRAMA_FLUXO_AUDIOS.txt para contexto

---

## Estatísticas da Auditoria

| Métrica | Valor |
|---------|-------|
| Arquivos de áudio | 50 |
| Tamanho total de áudio | 4.9 MB |
| Arquivos de código afetados | 10 |
| Endpoints de API | 9 |
| Componentes React | 2 |
| Problemas críticos | 4 |
| Documentos criados | 4 |
| Linhas de documentação | 1000+ |

---

## Próximos Passos Sugeridos

1. **Revisar** RELATORIO_SISTEMA_AUDIOS.md seção 7 (Problemas)
2. **Sincronizar** nomes de arquivo no schema.sql
3. **Implementar** validação de audio_url na API
4. **Documentar** o propósito das variações "b"
5. **Considerar** cloud storage ou CDN para áudios

---

## Notas Técnicas

- Banco de dados: PostgreSQL
- Backend: Node.js/Express
- Frontend: React (Vite)
- Reprodução: HTML5 `<audio>` tag
- Armazenamento: Sistema de arquivos (servidor estático)
- Extensão de áudio: `.m4a.mp4` (formato M4A)

---

## Contato/Dúvidas

Se você tiver dúvidas sobre:
- **Localização de arquivos**: Veja seção 1 de qualquer documento
- **Como funciona**: Veja DIAGRAMA_FLUXO_AUDIOS.txt
- **Qual arquivo afeta o quê**: Veja ARQUIVOS_AFETADOS_AUDIOS.md
- **Problemas**: Veja RELATORIO_SISTEMA_AUDIOS.md seção 7

---

Gerado em: 05 de Fevereiro de 2026
Projeto: MyTime Inglês
Auditoria: Sistema de Áudios
