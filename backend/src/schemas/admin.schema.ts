import { z } from "zod";

export const createAdminUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail institucional inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  employeeCode: z.string().min(3, "Código funcional obrigatório"),
  sector: z.string().min(2, "Setor obrigatório"),
  accessLevel: z.enum(["COORDINATOR", "SUPER_ADMIN"]).default("COORDINATOR"),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(["STUDENT", "PROFESSOR", "ADMIN"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  pendingProfessors: z.enum(["true", "false"]).optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
