import { PrismaClient, AdminAccessLevel, UserRole } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

/** Gera um hash no formato `salt:hash` adequado apenas para dados de desenvolvimento. */
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

async function main(): Promise<void> {
  // Senha temporária gerada a cada execução: nunca versionada no repositório.
  const temporaryPassword = randomBytes(9).toString("base64url");
  const passwordHash = hashPassword(temporaryPassword);

  const student = await prisma.user.upsert({
    where: { email: "ana.moraes@enade.edu.br" },
    update: {
      name: "Ana Beatriz Moraes",
      role: UserRole.STUDENT,
      isActive: true,
      passwordHash,
    },
    create: {
      name: "Ana Beatriz Moraes",
      email: "ana.moraes@enade.edu.br",
      passwordHash,
      role: UserRole.STUDENT,
      isActive: true,
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {
      registration: "2021.1.04512",
      course: "Sistemas de Computação",
      semester: 6,
      weeklyGoalTarget: 20,
      showTimerInExam: true,
      instantFeedback: true,
    },
    create: {
      userId: student.id,
      registration: "2021.1.04512",
      course: "Sistemas de Computação",
      semester: 6,
      weeklyGoalTarget: 20,
      showTimerInExam: true,
      instantFeedback: true,
    },
  });

  const professor = await prisma.user.upsert({
    where: { email: "carlos.lima@enade.edu.br" },
    update: {
      name: "Carlos Eduardo Lima",
      role: UserRole.PROFESSOR,
      isActive: true,
      passwordHash,
    },
    create: {
      name: "Carlos Eduardo Lima",
      email: "carlos.lima@enade.edu.br",
      passwordHash,
      role: UserRole.PROFESSOR,
      isActive: true,
    },
  });

  await prisma.professorProfile.upsert({
    where: { userId: professor.id },
    update: {
      institutionalId: "SIAPE-1234567",
      department: "Departamento de Computação",
      academicTitle: "Doutor",
      specializationAreas: ["banco-de-dados", "engenharia-de-software"],
      isVerified: true,
    },
    create: {
      userId: professor.id,
      institutionalId: "SIAPE-1234567",
      department: "Departamento de Computação",
      academicTitle: "Doutor",
      specializationAreas: ["banco-de-dados", "engenharia-de-software"],
      isVerified: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "marina.costa@enade.edu.br" },
    update: {
      name: "Marina Costa",
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash,
    },
    create: {
      name: "Marina Costa",
      email: "marina.costa@enade.edu.br",
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: admin.id },
    update: {
      employeeCode: "ADM-001",
      sector: "Coordenação de Curso",
      accessLevel: AdminAccessLevel.COORDINATOR,
    },
    create: {
      userId: admin.id,
      employeeCode: "ADM-001",
      sector: "Coordenação de Curso",
      accessLevel: AdminAccessLevel.COORDINATOR,
    },
  });

  console.log("Seed concluído: 3 usuários e seus perfis especializados criados.");
  console.log(`Senha temporária compartilhada (ambiente local): ${temporaryPassword}`);
}

main()
  .catch((error: unknown) => {
    console.error("Falha ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
