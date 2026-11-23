import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "@prisma/client";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthTokenPayload;
    user: AuthTokenPayload;
  }
}

/** Verifica o JWT e popula `request.user` com os dados da sessão. */
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
