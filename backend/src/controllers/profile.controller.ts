import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma.js";
import {
  updateAdminProfileSchema,
  updateProfessorProfileSchema,
  updateStudentProfileSchema,
} from "../schemas/profile.schema.js";
import { toPublicUser } from "./auth.controller.js";

const profileIncludes = {
  studentProfile: true,
  professorProfile: true,
  adminProfile: true,
} as const;

function sendValidationError(reply: FastifyReply, error: { flatten: () => unknown }): void {
  reply.status(400).send({
    error: "ValidationError",
    message: "Dados de perfil inválidos.",
    details: error.flatten(),
  });
}

function sendProfileNotFound(reply: FastifyReply): void {
  reply.status(404).send({
    error: "NotFound",
    message: "Perfil especializado não encontrado para esta sessão.",
  });
}

export async function updateStudentProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = updateStudentProfileSchema.safeParse(request.body);
  if (!parsed.success) {
    sendValidationError(reply, parsed.error);
    return;
  }

  const { name, ...profileData } = parsed.data;
  const profile = await prisma.studentProfile.findUnique({
    where: { id: request.user.profileId },
    select: { userId: true },
  });

  if (!profile || profile.userId !== request.user.sub) {
    sendProfileNotFound(reply);
    return;
  }

  const user = await prisma.user.update({
    where: { id: request.user.sub },
    data: {
      ...(name === undefined ? {} : { name: name.trim() }),
      studentProfile: { update: profileData },
    },
    include: profileIncludes,
  });

  reply.send({ user: toPublicUser(user) });
}

export async function updateProfessorProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = updateProfessorProfileSchema.safeParse(request.body);
  if (!parsed.success) {
    sendValidationError(reply, parsed.error);
    return;
  }

  const { name, ...profileData } = parsed.data;
  const profile = await prisma.professorProfile.findUnique({
    where: { id: request.user.profileId },
    select: { userId: true },
  });

  if (!profile || profile.userId !== request.user.sub) {
    sendProfileNotFound(reply);
    return;
  }

  const user = await prisma.user.update({
    where: { id: request.user.sub },
    data: {
      ...(name === undefined ? {} : { name: name.trim() }),
      professorProfile: {
        update: {
          ...profileData,
          ...(profileData.academicTitle === undefined
            ? {}
            : { academicTitle: profileData.academicTitle?.trim() || null }),
        },
      },
    },
    include: profileIncludes,
  });

  reply.send({ user: toPublicUser(user) });
}

export async function updateAdminProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const parsed = updateAdminProfileSchema.safeParse(request.body);
  if (!parsed.success) {
    sendValidationError(reply, parsed.error);
    return;
  }

  const { name, ...profileData } = parsed.data;
  const profile = await prisma.adminProfile.findUnique({
    where: { id: request.user.profileId },
    select: { userId: true },
  });

  if (!profile || profile.userId !== request.user.sub) {
    sendProfileNotFound(reply);
    return;
  }

  const user = await prisma.user.update({
    where: { id: request.user.sub },
    data: {
      ...(name === undefined ? {} : { name: name.trim() }),
      adminProfile: {
        update: {
          ...profileData,
          ...(profileData.sector === undefined ? {} : { sector: profileData.sector.trim() }),
        },
      },
    },
    include: profileIncludes,
  });

  reply.send({ user: toPublicUser(user) });
}
