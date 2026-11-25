import type { FastifyReply, FastifyRequest } from "fastify";
import { Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import {
  createAdminUserSchema,
  listUsersQuerySchema,
  updateUserStatusSchema,
} from "../schemas/admin.schema.js";
import { toPublicUser } from "./auth.controller.js";

const BCRYPT_ROUNDS = 10;

const profileIncludes = {
  studentProfile: true,
  professorProfile: true,
  adminProfile: true,
} as const;

function sendValidationError(reply: FastifyReply, error: { flatten: () => unknown }): void {
  reply.status(400).send({
    error: "ValidationError",
    message: "Dados administrativos inválidos.",
    details: error.flatten(),
  });
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createAdminUserHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = createAdminUserSchema.safeParse(request.body);
  if (!parsed.success) {
    sendValidationError(reply, parsed.error);
    return;
  }

  const data = parsed.data;
  const email = data.email.trim().toLowerCase();
  const employeeCode = data.employeeCode.trim();

  const [existingEmail, existingEmployeeCode] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.adminProfile.findUnique({ where: { employeeCode }, select: { id: true } }),
  ]);

  if (existingEmail || existingEmployeeCode) {
    reply.status(409).send({
      error: "Conflict",
      message: "E-mail ou código funcional já cadastrados.",
    });
    return;
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: UserRole.ADMIN,
        adminProfile: {
          create: {
            employeeCode,
            sector: data.sector.trim(),
            accessLevel: data.accessLevel,
          },
        },
      },
      include: profileIncludes,
    });

    reply.status(201).send({ user: toPublicUser(user) });
  } catch (error) {
    if (isUniqueViolation(error)) {
      reply.status(409).send({
        error: "Conflict",
        message: "E-mail ou código funcional já cadastrados.",
      });
      return;
    }
    throw error;
  }
}

export async function listUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = listUsersQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    sendValidationError(reply, parsed.error);
    return;
  }

  const { role, isActive, pendingProfessors } = parsed.data;
  const where: Prisma.UserWhereInput = {};

  if (pendingProfessors === "true") {
    where.role = UserRole.PROFESSOR;
    where.professorProfile = { is: { isVerified: false } };
  } else if (role) {
    where.role = role;
  }

  if (isActive) {
    where.isActive = isActive === "true";
  }

  const users = await prisma.user.findMany({
    where,
    include: profileIncludes,
    orderBy: { createdAt: "desc" },
  });

  reply.send({ users: users.map(toPublicUser) });
}

export async function verifyProfessorHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { profileId } = request.params as { profileId: string };
  const profile = await prisma.professorProfile.findUnique({
    where: { id: profileId },
    select: { id: true, userId: true, isVerified: true },
  });

  if (!profile) {
    reply.status(404).send({
      error: "NotFound",
      message: "Perfil docente não encontrado.",
    });
    return;
  }

  const updated = await prisma.professorProfile.update({
    where: { id: profileId },
    data: { isVerified: true },
    select: { id: true, userId: true, isVerified: true },
  });

  reply.send({ profile: updated });
}

export async function updateUserStatusHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { userId } = request.params as { userId: string };
  const parsed = updateUserStatusSchema.safeParse(request.body);
  if (!parsed.success) {
    sendValidationError(reply, parsed.error);
    return;
  }

  if (userId === request.user.sub) {
    reply.status(400).send({
      error: "BadRequest",
      message: "Não é possível alterar o status da própria conta.",
    });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existing) {
    reply.status(404).send({
      error: "NotFound",
      message: "Usuário não encontrado.",
    });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: parsed.data.isActive },
    select: { id: true, isActive: true },
  });

  reply.send({ user: updated });
}
