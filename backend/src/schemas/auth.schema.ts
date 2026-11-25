import { z } from "zod";

const nonBlankPassword = (message: string) =>
  z.string().refine((value: string) => value.trim().length > 0, message);

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail.").email("Informe um e-mail válido"),
  password: nonBlankPassword("A senha é obrigatória"),
});

export const registerStudentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe seu nome completo.")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail inválido"),
  password: nonBlankPassword("Informe uma senha.").refine(
    (value: string) => value.length >= 8,
    "A senha deve ter no mínimo 8 caracteres",
  ),
  registration: z
    .string()
    .trim()
    .min(1, "Informe sua matrícula acadêmica.")
    .min(4, "Matrícula acadêmica obrigatória"),
  course: z.string().trim().min(1, "Informe o seu curso.").min(3, "Curso obrigatório"),
  semester: z.number().int().min(1).max(14).optional(),
});

export const registerProfessorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe seu nome completo.")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().trim().min(1, "Informe seu e-mail.").email("E-mail institucional inválido"),
  password: nonBlankPassword("Informe uma senha.").refine(
    (value: string) => value.length >= 8,
    "A senha deve ter no mínimo 8 caracteres",
  ),
  institutionalId: z
    .string()
    .trim()
    .min(1, "Informe sua matrícula funcional.")
    .min(4, "Matrícula funcional obrigatória"),
  department: z
    .string()
    .trim()
    .min(1, "Informe o seu departamento.")
    .min(3, "Departamento obrigatório"),
  academicTitle: z.string().trim().optional(),
  specializationAreas: z.array(z.string()).default([]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type RegisterProfessorInput = z.infer<typeof registerProfessorSchema>;
