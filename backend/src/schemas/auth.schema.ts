import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export const registerStudentSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  registration: z.string().min(4, "Matrícula acadêmica obrigatória"),
  course: z.string().min(3, "Curso obrigatório"),
  semester: z.number().int().min(1).max(14).optional(),
});

export const registerProfessorSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail institucional inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  institutionalId: z.string().min(4, "Matrícula funcional obrigatória"),
  department: z.string().min(3, "Departamento obrigatório"),
  academicTitle: z.string().optional(),
  specializationAreas: z.array(z.string()).default([]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type RegisterProfessorInput = z.infer<typeof registerProfessorSchema>;
