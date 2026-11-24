import { randomBytes, scryptSync } from "node:crypto";
import { existsSync } from "node:fs";
import { chmod, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { AdminAccessLevel, Prisma, PrismaClient, UserRole } from "@prisma/client";

/**
 * Fixtures de desenvolvimento compartilhadas por `seed.ts` e
 * `seed-test-users.ts`. Alterações aqui afetam os dois comandos de propósito.
 */
type StudentFixture = {
  readonly kind: "student";
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly profile: {
    readonly registration: string;
    readonly course: string;
    readonly semester: number;
    readonly weeklyGoalTarget: number;
    readonly showTimerInExam: boolean;
    readonly instantFeedback: boolean;
  };
};

type ProfessorFixture = {
  readonly kind: "professor";
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly profile: {
    readonly institutionalId: string;
    readonly department: string;
    readonly academicTitle: string;
    readonly specializationAreas: readonly string[];
    readonly isVerified: boolean;
  };
};

type AdminFixture = {
  readonly kind: "admin";
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly profile: {
    readonly employeeCode: string;
    readonly sector: string;
    readonly accessLevel: AdminAccessLevel;
  };
};

export type Fixture = StudentFixture | ProfessorFixture | AdminFixture;

export const fixtures: readonly Fixture[] = [
  {
    kind: "student",
    email: "ana.moraes@enade.edu.br",
    name: "Ana Beatriz Moraes",
    role: UserRole.STUDENT,
    profile: {
      registration: "2021.1.04512",
      course: "Sistemas de Computação",
      semester: 6,
      weeklyGoalTarget: 20,
      showTimerInExam: true,
      instantFeedback: true,
    },
  },
  {
    kind: "professor",
    email: "carlos.lima@enade.edu.br",
    name: "Carlos Eduardo Lima",
    role: UserRole.PROFESSOR,
    profile: {
      institutionalId: "SIAPE-1234567",
      department: "Departamento de Computação",
      academicTitle: "Doutor",
      specializationAreas: ["banco-de-dados", "engenharia-de-software"],
      isVerified: true,
    },
  },
  {
    kind: "admin",
    email: "marina.costa@enade.edu.br",
    name: "Marina Costa",
    role: UserRole.ADMIN,
    profile: {
      employeeCode: "ADM-001",
      sector: "Coordenação de Curso",
      accessLevel: AdminAccessLevel.COORDINATOR,
    },
  },
];

export const fixtureEmails: readonly string[] = fixtures.map((fixture) => fixture.email);

const localDatabaseHosts = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
  "db", // serviço PostgreSQL do docker-compose.yml
]);

// O Prisma executa o seed a partir de `backend/`; o fallback cobre execuções
// a partir da raiz com `--schema backend/prisma/schema.prisma`.
const prismaDirectory = existsSync(join(process.cwd(), "prisma", "schema.prisma"))
  ? join(process.cwd(), "prisma")
  : join(process.cwd(), "backend", "prisma");
const credentialsFile = join(prismaDirectory, ".dev-seed-credentials.json");

export class SeedGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeedGuardError";
  }
}

export class FixtureDivergenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FixtureDivergenceError";
  }
}

/** Aborta seeds fora de um ambiente local explicitamente autorizado. */
export function assertSeedEnvironment(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== "development" && env.NODE_ENV !== "test") {
    throw new SeedGuardError(
      'Seed bloqueado: NODE_ENV deve ser "development" ou "test".',
    );
  }

  if (env.ALLOW_DEV_SEED !== "true") {
    throw new SeedGuardError(
      "Seed bloqueado: defina ALLOW_DEV_SEED=true para autorizar a carga de fixtures locais.",
    );
  }

  if (!env.DATABASE_URL) {
    throw new SeedGuardError("Seed bloqueado: DATABASE_URL não está definida.");
  }

  let databaseUrl: URL;
  try {
    databaseUrl = new URL(env.DATABASE_URL);
  } catch {
    throw new SeedGuardError("Seed bloqueado: DATABASE_URL é inválida.");
  }

  if (databaseUrl.protocol !== "postgresql:" && databaseUrl.protocol !== "postgres:") {
    throw new SeedGuardError(
      "Seed bloqueado: o seed de contas suporta apenas PostgreSQL.",
    );
  }

  if (!localDatabaseHosts.has(databaseUrl.hostname)) {
    if (env.ALLOW_DEV_SEED_NONLOCAL !== "true") {
      throw new SeedGuardError(
        `Seed bloqueado: host "${databaseUrl.hostname}" não parece local. ` +
          "Use um banco local ou defina ALLOW_DEV_SEED_NONLOCAL=true com autorização explícita.",
      );
    }
    console.warn(
      `AVISO: seed autorizado contra o host não local "${databaseUrl.hostname}".`,
    );
  }
}

function assertFieldsMatch(
  actual: object | null,
  expected: Record<string, unknown>,
  label: string,
): void {
  if (!actual) return;

  const values = actual as unknown as Record<string, unknown>;
  for (const [field, expectedValue] of Object.entries(expected)) {
    const actualValue = values[field];
    const matches =
      Array.isArray(expectedValue) || Array.isArray(actualValue)
        ? JSON.stringify(actualValue) === JSON.stringify(expectedValue)
        : actualValue === expectedValue;

    if (!matches) {
      throw new FixtureDivergenceError(
        `${label}: campo "${field}" divergente da fixture. ` +
          "Retome o banco local ou corrija o registro manualmente antes de rodar o seed.",
      );
    }
  }
}

/** Falha explicitamente quando uma identidade conhecida foi alterada fora do seed. */
export function assertExistingFixtureUser(
  existing: { name: string; role: UserRole; isActive: boolean } | null,
  fixture: Fixture,
): void {
  if (!existing) return;

  assertFieldsMatch(
    existing,
    { name: fixture.name, role: fixture.role, isActive: true },
    `Usuário ${fixture.email}`,
  );
}

async function assertProfileKind(
  tx: Prisma.TransactionClient,
  userId: string,
  fixture: Fixture,
): Promise<void> {
  const [student, professor, admin] = await Promise.all([
    tx.studentProfile.findUnique({ where: { userId } }),
    tx.professorProfile.findUnique({ where: { userId } }),
    tx.adminProfile.findUnique({ where: { userId } }),
  ]);

  const unexpected: string[] = [];
  if (fixture.kind !== "student" && student) unexpected.push("student_profiles");
  if (fixture.kind !== "professor" && professor) unexpected.push("professor_profiles");
  if (fixture.kind !== "admin" && admin) unexpected.push("admin_profiles");

  if (unexpected.length > 0) {
    throw new FixtureDivergenceError(
      `Usuário ${fixture.email}: perfil inesperado (${unexpected.join(", ")}) ` +
        `para a fixture ${fixture.kind}.`,
    );
  }

  return undefined;
}

async function upsertFixture(
  tx: Prisma.TransactionClient,
  fixture: Fixture,
  passwordHash: string,
): Promise<void> {
  const existing = await tx.user.findUnique({ where: { email: fixture.email } });
  assertExistingFixtureUser(existing, fixture);

  const user = await tx.user.upsert({
    where: { email: fixture.email },
    update: {},
    create: {
      email: fixture.email,
      name: fixture.name,
      role: fixture.role,
      isActive: true,
      passwordHash,
    },
  });

  await assertProfileKind(tx, user.id, fixture);

  switch (fixture.kind) {
    case "student": {
      const current = await tx.studentProfile.findUnique({ where: { userId: user.id } });
      assertFieldsMatch(current, fixture.profile, `Perfil de ${fixture.email}`);
      await tx.studentProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, ...fixture.profile },
      });
      break;
    }
    case "professor": {
      const current = await tx.professorProfile.findUnique({ where: { userId: user.id } });
      assertFieldsMatch(current, fixture.profile, `Perfil de ${fixture.email}`);
      await tx.professorProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          ...fixture.profile,
          specializationAreas: [...fixture.profile.specializationAreas],
        },
      });
      break;
    }
    case "admin": {
      const current = await tx.adminProfile.findUnique({ where: { userId: user.id } });
      assertFieldsMatch(current, fixture.profile, `Perfil de ${fixture.email}`);
      await tx.adminProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, ...fixture.profile },
      });
      break;
    }
  }
}

/** Hash dev-only, no formato `salt:hash`, compatível com o seed anterior. */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

async function saveCredentials(password: string): Promise<void> {
  const content = {
    warning: "LOCAL DEVELOPMENT ONLY — não versionar, não compartilhar.",
    generatedAt: new Date().toISOString(),
    password,
    accounts: fixtureEmails,
  };
  await writeFile(credentialsFile, `${JSON.stringify(content, null, 2)}\n`, {
    mode: 0o600,
  });
  await chmod(credentialsFile, 0o600);
}

/**
 * Carga atômica das três contas fixture. Credenciais de contas existentes não
 * são rotacionadas; quando alguma conta é criada, uma senha aleatória é gravada
 * apenas em arquivo local ignorado pelo Git (nunca no console).
 */
export async function runFixtureSeed(): Promise<void> {
  assertSeedEnvironment();

  const prisma = new PrismaClient();
  try {
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: [...fixtureEmails] } },
      select: { email: true, name: true, role: true, isActive: true },
    });
    const existingByEmail = new Map(existingUsers.map((user) => [user.email, user]));

    for (const fixture of fixtures) {
      assertExistingFixtureUser(existingByEmail.get(fixture.email) ?? null, fixture);
    }

    const missingCount = fixtures.length - existingUsers.length;
    const password = missingCount > 0 ? randomBytes(9).toString("base64url") : null;
    const passwordHash = password ? hashPassword(password) : "";

    await prisma.$transaction(async (tx) => {
      for (const fixture of fixtures) {
        await upsertFixture(tx, fixture, passwordHash);
      }
    });

    if (password) {
      await saveCredentials(password);
      console.log(
        "Seed concluído: contas criadas. Senha gerada e salva apenas em " +
          "backend/prisma/.dev-seed-credentials.json (uso local; não versionar).",
      );
    } else {
      console.log("Seed concluído: contas fixture já existiam; credenciais não alteradas.");
    }
  } finally {
    await prisma.$disconnect();
  }
}
