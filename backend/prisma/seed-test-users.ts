import { runFixtureSeed } from "./seed-utils.js";

/**
 * Alias do seed de contas para teste manual da interface (ambiente local).
 * Uso: npm run prisma:seed:test
 *
 * As mesmas guardas, fixtures e política de credenciais de `seed.ts` se
 * aplicam; não há senha fixa versionada nem promoção a SUPER_ADMIN.
 */
runFixtureSeed().catch((error: unknown) => {
  console.error("Falha ao criar contas de teste:", error);
  process.exitCode = 1;
});
