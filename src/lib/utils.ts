/**
 * Concatena classes condicionais sem dependências externas.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Converte um índice (0-4) na letra correspondente (A-E). */
export function indexToLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

/** Formata um percentual com no máximo uma casa decimal, em pt-BR. */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value);
}
