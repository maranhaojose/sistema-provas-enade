import type { AreaCategory, Difficulty, StudyArea } from "../types/question";

export const areaCategories: readonly AreaCategory[] = [
  "Todas as Áreas",
  "Fundamentos",
  "Desenvolvimento",
  "Infraestrutura",
  "Matemática e Teoria",
];

export const availableYears: readonly number[] = [2023, 2022, 2021, 2019, 2017];

export const difficultyOptions: ReadonlyArray<Difficulty | "Todas"> = [
  "Todas",
  "Fácil",
  "Média",
  "Difícil",
];

export interface GlobalStudySummary {
  readonly baseAnswered: number;
  readonly baseCorrect: number;
  readonly totalBankQuestions: number;
  readonly completedExams: number;
  readonly weeklyGoalTarget: number;
  readonly weeklyGoalCurrent: number;
}

export const globalStudySummary: GlobalStudySummary = {
  baseAnswered: 142,
  baseCorrect: 108,
  totalBankQuestions: 320,
  completedExams: 6,
  weeklyGoalTarget: 50,
  weeklyGoalCurrent: 38,
};

export const studyAreas: readonly StudyArea[] = [
  {
    id: "area-eng-software",
    slug: "engenharia-de-software",
    title: "Engenharia de Software",
    category: "Desenvolvimento",
    description:
      "Arquitetura, padrões de projeto GoF, princípios SOLID, engenharia de requisitos, testes automatizados e metodologias ágeis.",
    subtopics: ["Padrões GoF", "SOLID", "Scrum & Kanban", "Testes de Software", "UML"],
    totalQuestions: 48,
    answeredQuestions: 32,
    accuracyPercent: 81,
    defaultDifficulty: "Fácil",
    years: [2023, 2022, 2021, 2019, 2017],
    status: "Em andamento",
    iconName: "Code2",
  },
  {
    id: "area-banco-dados",
    slug: "banco-de-dados",
    title: "Banco de Dados",
    category: "Desenvolvimento",
    description:
      "Modelagem relacional, formas normais (1FN a BCNF), consultas SQL avançadas, indexação, controle de concorrência e transações ACID.",
    subtopics: ["Normalização", "SQL & Álgebra", "Transações ACID", "Índices B-Tree", "NoSQL"],
    totalQuestions: 44,
    answeredQuestions: 26,
    accuracyPercent: 77,
    defaultDifficulty: "Média",
    years: [2023, 2021, 2019, 2017],
    status: "Alta incidência",
    iconName: "Database",
  },
  {
    id: "area-grafos-algoritmos",
    slug: "grafos-e-algoritmos",
    title: "Grafos e Algoritmos",
    category: "Matemática e Teoria",
    description:
      "Análise assintótica, algoritmos de busca e ordenação, caminhos mínimos (Dijkstra, Bellman-Ford), árvores geradoras e programação dinâmica.",
    subtopics: ["Complexidade O(n)", "Dijkstra & BFS/DFS", "Programação Dinâmica", "NP-Completude"],
    totalQuestions: 42,
    answeredQuestions: 18,
    accuracyPercent: 72,
    defaultDifficulty: "Difícil",
    years: [2023, 2022, 2021, 2019],
    status: "Alta incidência",
    iconName: "GitFork",
  },
  {
    id: "area-redes",
    slug: "redes-de-computadores",
    title: "Redes de Computadores",
    category: "Infraestrutura",
    description:
      " Pilha TCP/IP e modelo OSI, controle de congestionamento (slow start), endereçamento IPv4/IPv6, sub-redes, roteamento, DNS e segurança.",
    subtopics: ["TCP/UDP & Slow Start", "Endereçamento CIDR", "Roteamento OSPF/BGP", " Segurança & TLS"],
    totalQuestions: 38,
    answeredQuestions: 15,
    accuracyPercent: 67,
    defaultDifficulty: "Difícil",
    years: [2023, 2022, 2021, 2017],
    status: "Recomendado",
    iconName: "Network",
  },
  {
    id: "area-sistemas-operacionais",
    slug: "sistemas-operacionais",
    title: "Sistemas Operacionais",
    category: "Infraestrutura",
    description:
      "Gerência de processos e threads, escalonamento de CPU, sincronização, impasses (deadlocks), memória virtual, paginação e sistemas de arquivos.",
    subtopics: ["Escalonamento", "Semáforos & Mutex", "Memória Virtual", "Deadlocks"],
    totalQuestions: 36,
    answeredQuestions: 14,
    accuracyPercent: 79,
    defaultDifficulty: "Média",
    years: [2023, 2021, 2019, 2017],
    status: "Em andamento",
    iconName: "Terminal",
  },
  {
    id: "area-arquitetura",
    slug: "arquitetura-de-computadores",
    title: "Arquitetura de Computadores",
    category: "Infraestrutura",
    description:
      "Hierarquia de memória (cache L1/L2, AMAT), pipeline de instruções, hazards de dados e controle, conjunto de instruções RISC/CISC e paralelismo.",
    subtopics: ["Memória Cache & AMAT", "Pipeline & Hazards", "RISC vs CISC", "Multiprocessadores"],
    totalQuestions: 34,
    answeredQuestions: 12,
    accuracyPercent: 75,
    defaultDifficulty: "Média",
    years: [2023, 2022, 2019, 2017],
    status: "Em andamento",
    iconName: "Cpu",
  },
  {
    id: "area-ia",
    slug: "inteligencia-artificial",
    title: "Inteligência Artificial",
    category: "Matemática e Teoria",
    description:
      "Busca heurística (A*, Minimax), aprendizado de máquina supervisionado e não supervisionado, métricas de avaliação, redes neurais e lógica.",
    subtopics: ["Busca Heurística A*", "Machine Learning", "Árvores de Decisão", "Redes Neurais"],
    totalQuestions: 32,
    answeredQuestions: 5,
    accuracyPercent: 80,
    defaultDifficulty: "Média",
    years: [2023, 2022, 2021],
    status: "Recomendado",
    iconName: "BrainCircuit",
  },
  {
    id: "area-estrutura-dados",
    slug: "estrutura-de-dados",
    title: "Estrutura de Dados",
    category: "Fundamentos",
    description:
      "Listas encadeadas, pilhas, filas de prioridade (heaps), árvores binárias de busca, árvores balanceadas (AVL, Rubro-Negra) e tabelas hash.",
    subtopics: ["Busca Binária", "Árvores AVL & B", "Tabelas Hash", "Filas & Pilhas"],
    totalQuestions: 46,
    answeredQuestions: 20,
    accuracyPercent: 75,
    defaultDifficulty: "Média",
    years: [2023, 2022, 2021, 2019, 2017],
    status: "Alta incidência",
    iconName: "Layers",
  },
];
