import type { FastifyReply, FastifyRequest } from "fastify";
import { UserRole, type AdminAccessLevel } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export interface JwtUserPayload {
  sub: string;
  email: string;
  role: UserRole;
  profileId: string;
  isVerified?: boolean;
  accessLevel?: AdminAccessLevel;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtUserPayload;
    user: JwtUserPayload;
  }
}

/** Verifica o JWT, popula `request.user` e garante que a conta ainda está ativa. */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({
      error: "Unauthorized",
      message: "Token de autenticação ausente, inválido ou expirado.",
    });
    return;
  }

  const isActive = await prisma.user.findUnique({
    where: { id: request.user.sub },
    select: { isActive: true },
  });

  if (!isActive?.isActive) {
    reply.status(401).send({
      error: "Unauthorized",
      message: "Esta conta foi desativada. Procure a administração do sistema.",
    });
  }
}

/** Restringe a rota aos papéis informados. Deve ser usado após `authenticate`. */
export function authorizeRoles(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      reply.status(401).send({
        error: "Unauthorized",
        message: "Usuário não autenticado.",
      });
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      reply.status(403).send({
        error: "Forbidden",
        message: `Acesso negado para o perfil ${request.user.role}.`,
      });
    }
  };
}
