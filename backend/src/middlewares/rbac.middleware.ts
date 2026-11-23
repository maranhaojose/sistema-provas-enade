import type { FastifyReply, FastifyRequest } from "fastify";

/** Exige perfil de Aluno autenticado. */
export async function requireStudent(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (request.user.role !== "STUDENT") {
    reply.status(403).send({
      error: "Forbidden",
      message: "Recurso exclusivo para contas de Aluno.",
    });
  }
}

/** Exige perfil de Professor com cadastro validado pela Administração. */
export async function requireVerifiedProfessor(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { role, isVerified } = request.user;

  if (role !== "PROFESSOR" && role !== "ADMIN") {
    reply.status(403).send({
      error: "Forbidden",
      message: "Acesso restrito a Professores ou Administração.",
    });
    return;
  }

  if (role === "PROFESSOR" && !isVerified) {
    reply.status(403).send({
      error: "ProfessorNotVerified",
      message:
        "Seu perfil docente ainda aguarda validação da Coordenação/Administração para publicar ou editar questões.",
    });
  }
}

/** Exige perfil Administrativo (Coordenação ou Super Admin). */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (request.user.role !== "ADMIN") {
    reply.status(403).send({
      error: "Forbidden",
      message: "Acesso restrito à Administração.",
    });
  }
}

/** Exige nível máximo de Administração (criação de outros admins e gestão crítica). */
export async function requireSuperAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (
    request.user.role !== "ADMIN" ||
    request.user.accessLevel !== "SUPER_ADMIN"
  ) {
    reply.status(403).send({
      error: "Forbidden",
      message: "Operação permitida apenas para Super Administradores.",
    });
  }
}
