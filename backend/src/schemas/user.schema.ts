import { z } from "zod";

const baseUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail institucional inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

export const createStudentSchema = baseUserSchema.extend({
  role: z.literal("STUDENT"),
  registration: z.string().min(4, "Matrícula obrigatória"),
  course: z.string().min(3, "Curso obrigatório"),
  semester: z.number().int().min(1).max(14).optional(),
  weeklyGoalTarget: z.number().int().min(5).max(200).default(20),
});

export const createProfessorSchema = baseUserSchema.extend({
  role: z.literal("PROFESSOR"),
  institutionalId: z.string().min(4, "Matrícula funcional obrigatória"),
  department: z.string().min(3, "Departamento obrigatório"),
  academicTitle: z.string().optional(),
  specializationAreas: z.array(z.string()).default([]),
});

export const createAdminSchema = baseUserSchema.extend({
  role: z.literal("ADMIN"),
  employeeCode: z.string().min(3, "Código funcional obrigatório"),
  sector: z.string().min(2, "Setor obrigatório"),
  accessLevel: z.enum(["COORDINATOR", "SUPER_ADMIN"]).default("COORDINATOR"),
});

export const createUserSchema = z.discriminatedUnion("role", [
  createStudentSchema,
  createProfessorSchema,
  createAdminSchema,
]);

export type CreateUserInput = z.infer<typeof createUserSchema>;
