# SimulaENADE — Plataforma de Provas e Simulados do ENADE

Plataforma completa de simulados e resolução de questões para o **ENADE** (Exame Nacional de Desempenho dos Estudantes). O ecossistema é composto por:

1. **Frontend SPA:** Interface moderna e acessível em **React 18 + Vite + TypeScript + Tailwind CSS**.
2. **Backend API:** Serviço REST em **Node.js + Fastify + Prisma ORM + SQLite**.
3. **Módulo Extrator (Parser):** Pipeline em **Python 3.12** utilizando **PyMuPDF** e **pdfplumber** para extração de questões e metadados diretamente dos PDFs oficiais das provas do ENADE.

---

## Arquitetura do Repositório

```
.
├── backend/                       # Backend REST (Node.js + TypeScript + Fastify + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma          # Modelos de dados (Exam, Question, Alternative)
│   │   └── dev.db                 # Banco SQLite local (ignorado pelo Git)
│   ├── src/
│   │   ├── controllers/           # Controllers de health check e questões
│   │   ├── routes/                # Definição e registro de rotas (/health, /api/questions)
│   │   ├── lib/                   # Singleton do Prisma Client
│   │   ├── app.ts                 # Configuração do Fastify, CORS e middlewares
│   │   └── server.ts              # Ponto de entrada com graceful shutdown
│   ├── package.json
│   └── tsconfig.json
│
├── pdf-parser/                    # Módulo Python para extração de provas em PDF
│   ├── requirements.txt           # Dependências (pymupdf, pdfplumber)
│   ├── test_pdf_reader.py         # Script de extração e validação de arquivos PDF
│   └── .venv/                     # Ambiente virtual Python isolado (ignorado pelo Git)
│
├── src/                           # Frontend React SPA
│   ├── components/                # Componentes visuais do simulado (Header, QuestionCard, etc.)
│   ├── hooks/                     # useSimulado (regras de negócio do simulado)
│   ├── types/                     # Tipos e contratos de domínio
│   └── data/                      # Dados mockados do simulador
│
├── index.html
├── package.json                   # Dependências do Frontend
├── tailwind.config.js
└── README.md
```

---

## Como Rodar

### 1. Frontend (React + Vite)

```bash
# Na raiz do projeto:
npm install
npm run dev
```

Acesse `http://localhost:5173`.

Outros comandos:

```bash
npm run build      # Type-check + build de produção
npm run preview    # Serve o build de produção localmente
npm run typecheck  # Apenas checagem estática de tipos
```

---

### 2. Backend (Fastify + Prisma)

```bash
cd backend
npm install
npm run prisma:generate   # Gera o Prisma Client
npm run dev               # Inicia o servidor com hot-reload (tsx) na porta 3333
```

Acesse:

- **Health Check:** `http://localhost:3333/health`
- **Listar Questões:** `http://localhost:3333/api/questions`

Outros comandos do backend:

```bash
npm run build      # Compila TypeScript para dist/ com tsup
npm start          # Roda a versão de produção (dist/server.mjs)
npm run typecheck  # Validação estática de tipos
```

#### Endpoints da API

| Método | Rota                  | Descrição                                                                                   |
| ------ | --------------------- | ------------------------------------------------------------------------------------------- |
| `GET`  | `/health`             | Status da API e probe de conectividade com o banco                                          |
| `GET`  | `/api/questions`      | Lista questões com suporte a paginação (`limit`, `offset`) e filtros (`area`, `difficulty`) |
| `GET`  | `/api/questions/:id`  | Retorna uma questão específica com suas alternativas e prova                                |
| `POST` | `/api/questions/seed` | Popula o banco com questões iniciais de exemplo (caso esteja vazio)                         |

---

### 3. Extrator de PDF (Python)

O módulo utiliza **PyMuPDF** como motor primário de alta performance e **pdfplumber** como motor secundário para análise de tabelas.

```bash
cd pdf-parser

# Criar e ativar o ambiente virtual (se ainda não existir):
python3 -m venv .venv
source .venv/bin/activate

# Instalar dependências:
pip install -r requirements.txt

# Executar teste automatizado de leitura:
python test_pdf_reader.py

# Ou testar com um arquivo PDF específico:
python test_pdf_reader.py /caminho/para/prova_enade.pdf
```

---

## Regras de Negócio do Simulado (Frontend)

| Regra                                                                              | Onde vive                                                               |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Selecionar alternativa A–E (sem confirmar)                                         | `useSimulado.selectAlternative`                                         |
| “Responder Questão” desabilitado sem seleção                                       | `QuestionCard` (`disabled={selection === null}`)                        |
| Bloqueio das alternativas após confirmar                                           | `selectAlternative` ignora questões confirmadas + `disabled` nos botões |
| Acerto: destaque verde + banner de sucesso                                         | `FeedbackBanner` (`isCorrect`)                                          |
| Erro: alternativa marcada em vermelho, correta revelada em verde, banner de alerta | `QuestionCard.resolveState` + `FeedbackBanner`                          |
| Resolução comentada sempre após confirmar                                          | `FeedbackBanner`                                                        |
| Navegação anterior/próxima e por salto na grade                                    | `goToPrevious`, `goToNext`, `goToQuestion`                              |
| Status da questão na grade (atual/acertou/errou/não respondida)                    | `getStatus`                                                             |
| Progresso e acertos em tempo real no header                                        | `stats` derivado de `answers`                                           |
| “Ver desempenho final” liberado só ao responder tudo                               | `stats.isFinished`                                                      |
| Reiniciar simulado                                                                 | `restart()`                                                             |

---

## Design e Acessibilidade

- **Paleta:** Base `slate` (neutros), primária `brand` (índigo `#4f46e5`), semânticas `emerald` (acerto) e `rose` (erro); dificuldade em `emerald`/`amber`/`rose`.
- **Tipografia:** Inter para interface, JetBrains Mono para blocos de código.
- **Layout:** Grid `300px | 1fr` em telas `lg+`, responsivo e recolhível no mobile.
- **Acessibilidade:** Navegação por teclado com `focus-visible`, `aria-pressed`, `aria-current="step"`, `role="progressbar"`, `role="dialog"` e suporte a `prefers-reduced-motion`.
