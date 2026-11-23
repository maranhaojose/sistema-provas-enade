import { scryptSync, timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import {
  loginSchema,
  registerProfessorSchema,
  registerStudentSchema,
} from "../schemas/auth.schema.js";

const BCRYPT_ROUNDS = 10;

type UserWithProfiles = Prisma.UserGetPayload<{
  include: {
    studentProfile: true;
    professorProfile: true;
    adminProfile: true;
  };
}>;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Remove dados sensíveis e achata o perfil especializado para o frontend. */
function toPublicUser(user: UserWithProfiles) {
  const base = {
    id: user.id,
    name: user.name,
    email: user.email,
    initials: getInitials(user.name),
    isActive: user.isActive,
  };

  switch (user.role) {
    case UserRole.STUDENT: {
      const profile = user.studentProfile;
      if (!profile) {
        return { ...base, role: UserRole.STUDENT };
      }
      return {
        ...base,
        role: UserRole.STUDENT,
        registration: profile.registration,
        course: profile.course,
        semester: profile.semester,
        weeklyGoalTarget: profile.weeklyGoalTarget,
        showTimerInExam: profile.showTimerInExam,
        instantFeedback: profile.instantFeedback,
      };
    }
    case UserRole.PROFESSOR: {
      const profile = user.professorProfile;
      if (!profile) {
        return { ...base, role: UserRole.PROFESSOR };
      }
      return {
        ...base,
        role: UserRole.PROFESSOR,
        institutionalId: profile.institutionalId,
        department: profile.department,
        academicTitle: profile.academicTitle,
        specializationAreas: profile.specializationAreas,
        isVerified: profile.isVerified,
      };
    }
    case UserRole.ADMIN: {
      const profile = user.adminProfile;
      if (!profile) {
        return { ...base, role: UserRole.ADMIN };
      }
      return {
        ...base,
        role: UserRole.ADMIN,
        employeeCode: profile.employeeCode,
        sector: profile.sector,
        accessLevel: profile.accessLevel,
      };
    }
  }
}

function signToken(request: FastifyRequest, user: UserWithProfiles): string {
  return request.server.jwt.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
}

function sendValidationError(reply: FastifyReply, error: { flatten: () => unknown }) {
  return reply.status(400).send({
    error: "ValidationError",
    message: "Dados de cadastro ou login inválidos.",
    details: error.flatten(),
  });
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Aceita também o formato `salt:hash` usado pelo seed legado (scrypt). */
async function isPasswordValid(password: string, passwordHash: string): Promise<boolean> {
  if (passwordHash.startsWith("$2")) {
    return bcrypt.compare(password, passwordHash);
  }

  const [salt, expectedHex] = passwordHash.split(":");
  if (!salt || !expectedHex) return false;

  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== 64) return false;

  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(expected, actual);
}

async function findUserByEmail(email: string): Promise<UserWithProfiles | null> {
  return prisma.user.findUnique({
    where: { email },
    include: {
      studentProfile: true,
      professorProfile: true,
      adminProfile: true,
    },
  });
}

export async function registerStudentHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = registerStudentSchema.safeParse(request.body);
  if (!parsed.success) {
    sendValidationError(reply, parsed.error);
    return;
  }

  const data = parsed.data;
  const email = data.email.trim().toLowerCase();
  const registration = data.registration.trim();

  const [existingUser, existingRegistration] = await Promise.all([
    findUserByEmail(email),
    prisma.studentProfile.findUnique({ where: { registration } }),
  ]);

  if (existingUser || existingRegistration) {
    reply.status(409).send({
      error: "Conflict",
      message: "E-mail ou matrícula já cadastrados.",
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
        role: UserRole.STUDENT,
        studentProfile: {
          create: {
            registration,
            course: data.course.trim(),
            semester: data.semester,
          },
        },
      },
      include: {
        studentProfile: true,
        professorProfile: true,
        adminProfile: true,
      },
    });

    reply.status(201).send({ token: signToken(request, user), user: toPublicUser(user) });
  } catch (error) {
    if (isUniqueViolation(error)) {
      reply.status(409).send({
        error: "Conflict",
        message: "E-mail ou matrícula já cadastrados.",
      });
      return;
    }
    throw error;
  }
}

export async function registerProfessorHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = registerProfessorSchema.safeParse(request.body);
  if (!parsed.success) {
    sendValidationError(reply, parsed.error);
    return;
  }

  const data = parsed.data;
  const email = data.email.trim().toLowerCase();
  const institutionalId = data.institutionalId.trim();

  const [existingUser, existingInstitutionalId] = await Promise.all([
    findUserByEmail(email),
    prisma.professorProfile.findUnique({ where: { institutionalId } }),
  ]);

  if (existingUser || existingInstitutionalId) {
    reply.status(409).send({
      error: "Conflict",
      message: "E-mail ou matrícula funcional já cadastrados.",
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
        role: UserRole.PROFESSOR,
        professorProfile: {
          create: {
            institutionalId,
            department: data.department.trim(),
            academicTitle: data.academicTitle,
            specializationAreas: data.specializationAreas,
            isVerified: false,
          },
        },
      },
      include: {
        studentProfile: true,
        professorProfile: true,
        adminProfile: true,
      },
    });

    reply.status(201).send({ token: signToken(request, user), user: toPublicUser(user) });
  } catch (error) {
    if (isUniqueViolation(error)) {
      reply.status(409).send({
        error: "Conflict",
        message: "E-mail ou matrícula funcional já cadastrados.",
      });
      return;
    }
    throw error;
  }
}

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    sendValidationError(reply, parsed.error);
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await findUserByEmail(email);

  if (!user || !(await isPasswordValid(parsed.data.password, user.passwordHash))) {
    reply.status(401).send({
      error: "Unauthorized",
      message: "E-mail ou senha incorretos.",
    });
    return;
  }

  if (!user.isActive) {
    reply.status(403).send({
      error: "Forbidden",
      message: "Esta conta está desativada. Procure a administração do sistema.",
    });
    return;
  }

  reply.send({ token: signToken(request, user), user: toPublicUser(user) });
}

export async function getMeHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: request.user.sub },
    include: {
      studentProfile: true,
      professorProfile: true,
      adminProfile: true,
    },
  });

  if (!user || !user.isActive) {
    reply.status(401).send({
      error: "Unauthorized",
      message: "Sessão inválida ou usuário desativado.",
    });
    return;
  }

  reply.send({ user: toPublicUser(user) });
}
