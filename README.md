# SimulaENADE — Interface de resolução de simulados

Interface pós-login de uma plataforma de simulados e resolução de questões para o **ENADE**
(Exame Nacional de Desempenho dos Estudantes), construída em **React 18 + Vite + TypeScript**,
**Tailwind CSS** e **Lucide React**, com dados mockados no padrão da prova.

A aplicação abre diretamente no ambiente logado de resolução — não há tela de login.

---

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

Outros comandos:

```bash
npm run build      # type-check + build de produção
npm run preview    # serve o build de produção
npm run typecheck  # apenas verificação de tipos
```

Requisitos: Node.js 18+.

---

## Estrutura do projeto

```
.
├── index.html
├── package.json
├── tailwind.config.js        # tokens de design (cores brand, sombras, animações)
├── postcss.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
└── src
    ├── main.tsx              # bootstrap do React
    ├── App.tsx               # composição do layout e orquestração de estado
    ├── index.css             # diretivas Tailwind + base + acessibilidade
    ├── types
    │   └── question.ts       # contratos de domínio (Question, Answer, Stats...)
    ├── data
    │   └── questions.ts      # 5 questões ENADE mockadas + metadados + perfil
    ├── hooks
    │   └── useSimulado.ts    # regra de negócio do simulado (seleção, confirmação, notas)
    ├── lib
    │   └── utils.ts          # cn(), indexToLetter(), formatPercent()
    └── components
        ├── Header.tsx           # header fixo: marca, área, progresso, acertos, perfil
        ├── QuestionSidebar.tsx  # grade de navegação + legenda + card de progresso
        ├── QuestionCard.tsx     # enunciado, apoio, comando, alternativas, ações
        ├── FeedbackBanner.tsx   # feedback de acerto/erro + resolução comentada
        └── ResultsModal.tsx     # modal de desempenho final e reinício
```

---

## Regras de negócio implementadas

| Regra | Onde vive |
| --- | --- |
| Selecionar alternativa A–E (sem confirmar) | `useSimulado.selectAlternative` |
| “Responder Questão” desabilitado sem seleção | `QuestionCard` (`disabled={selection === null}`) |
| Bloqueio das alternativas após confirmar | `selectAlternative` ignora questões confirmadas + `disabled` nos botões |
| Acerto: destaque verde + banner de sucesso | `FeedbackBanner` (`isCorrect`) |
| Erro: alternativa marcada em vermelho, correta revelada em verde, banner de alerta | `QuestionCard.resolveState` + `FeedbackBanner` |
| Resolução comentada sempre após confirmar | `FeedbackBanner` |
| Navegação anterior/próxima e por salto na grade | `goToPrevious`, `goToNext`, `goToQuestion` |
| Status da questão na grade (atual/acertou/errou/não respondida) | `getStatus` |
| Progresso e acertos em tempo real no header | `stats` derivado de `answers` |
| “Ver desempenho final” liberado só ao responder tudo | `stats.isFinished` |
| Reiniciar simulado | `restart()` |

Regras de cor da grade lateral, em ordem de prioridade:
`acertou/errou` (questão confirmada) → `atual` (índice selecionado) → `não respondida`.

---

## Design

- **Paleta:** base `slate` (neutros), primária `brand` (índigo `#4f46e5`), semânticas
  `emerald` (acerto) e `rose` (erro); dificuldade em `emerald`/`amber`/`rose`.
- **Tipografia:** Inter para interface, JetBrains Mono para blocos de código.
- **Layout:** grid `300px | 1fr` em `lg+`, empilhado no mobile (navegação compacta e recolhível
  primeiro, questão em seguida). Header sticky com progresso e indicadores.
- **Acessibilidade:** navegação por teclado com `focus-visible` consistente, `aria-pressed` nas
  alternativas, `aria-current="step"` na questão atual, `role="progressbar"`, `role="dialog"` +
  `aria-modal` no resultado, fechamento por `Esc`, `aria-live` no feedback e respeito a
  `prefers-reduced-motion`.

---

## Conteúdo mockado

Cinco questões completas (texto-base, eventual bloco de apoio, comando, 5 alternativas,
gabarito e justificativa detalhada) cobrindo:

1. Algoritmos e Estruturas de Dados — busca binária e complexidade (ENADE 2021)
2. Banco de Dados — normalização e 3FN (ENADE 2019)
3. Redes de Computadores — TCP slow start (ENADE 2022)
4. Engenharia de Software — padrão Strategy (ENADE 2017)
5. Arquitetura de Computadores — AMAT com cache L1 (ENADE 2023)

Para adicionar questões, basta inserir novos objetos no array `questions` em
`src/data/questions.ts` — a interface se adapta automaticamente (grade, contadores e progresso).
