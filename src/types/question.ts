/**
 * Tipos de domínio do SimulaENADE.
 * Todas as estruturas são imutáveis (`readonly`) na camada de dados.
 */

/** Letras válidas de alternativa. */
export type AlternativeLetter = "A" | "B" | "C" | "D" | "E";

/** Nível de dificuldade exibido no cabeçalho da questão. */
export type Difficulty = "Fácil" | "Média" | "Difícil";

/** Bloco opcional de apoio (código, tabela textual, dados). */
export interface QuestionSupportBlock {
  /** Título do bloco, ex.: "Trecho de código — busca binária". */
  readonly title: string;
  /** Conteúdo pré-formatado (preserva quebras de linha e alinhamento). */
  readonly content: string;
  /** Linguagem destacada no rodapé do bloco (opcional). */
  readonly language?: string;
}

export interface Alternative {
  readonly letter: AlternativeLetter;
  readonly text: string;
}

export interface Question {
  readonly id: string;
  /** Edição da prova, ex.: 2023. */
  readonly year: number;
  /** Tema/disciplina, ex.: "Algoritmos e Estruturas de Dados". */
  readonly subject: string;
  /** Componente específico do curso, ex.: "Sistemas de Computação". */
  readonly courseArea: string;
  readonly difficulty: Difficulty;
  /** Texto-base contextualizado (um item por parágrafo). */
  readonly statement: readonly string[];
  /** Bloco de apoio opcional exibido entre o texto-base e o comando. */
  readonly supportBlock?: QuestionSupportBlock;
  /** Comando direto da questão. */
  readonly command: string;
  readonly alternatives: readonly Alternative[];
  /** Índice (0-4) da alternativa correta no array `alternatives`. */
  readonly correctIndex: number;
  /** Resolução comentada exibida após a confirmação. */
  readonly explanation: string;
}

/** Resposta registrada pelo aluno para uma questão. */
export interface Answer {
  readonly questionId: string;
  /** Índice da alternativa marcada (0-4). */
  readonly selectedIndex: number;
  /** `true` após o clique em "Responder Questão". */
  readonly confirmed: boolean;
}

/** Mapa de respostas indexado pelo id da questão. */
export type AnswerMap = Readonly<Record<string, Answer>>;

/** Situação derivada de uma questão na navegação lateral. */
export type QuestionStatus = "unanswered" | "current" | "correct" | "incorrect";

export interface StudentProfile {
  readonly name: string;
  readonly registration: string;
  readonly initials: string;
  readonly course: string;
}

export interface ExamMeta {
  readonly title: string;
  readonly course: string;
  readonly year: number;
  readonly totalQuestions: number;
  readonly durationMinutes: number;
}
