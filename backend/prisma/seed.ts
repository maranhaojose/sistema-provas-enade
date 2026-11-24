import { runFixtureSeed } from "./seed-utils.js";

/**
 * Seed das três contas fixture (aluno, professor e coordenador).
 * Pré-condições e avisos: ver README.md e docs/runbook-cutover-postgresql.md.
 */
runFixtureSeed().catch((error: unknown) => {
  console.error("Falha ao executar o seed:", error);
  process.exitCode = 1;
});
