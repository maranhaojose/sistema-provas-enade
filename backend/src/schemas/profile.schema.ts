import { z } from "zod";

function hasAtLeastOneField<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).refine((value) => Object.keys(value).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  });
}

export const updateStudentProfileSchema = hasAtLeastOneField({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  course: z.string().min(3, "Curso obrigatório").optional(),
  semester: z.number().int().min(1).max(14).nullable().optional(),
  weeklyGoalTarget: z.number().int().min(5, "A meta mínima é de 5 questões").max(200).optional(),
  showTimerInExam: z.boolean().optional(),
  instantFeedback: z.boolean().optional(),
});

export const updateProfessorProfileSchema = hasAtLeastOneField({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  department: z.string().min(3, "Departamento obrigatório").optional(),
  academicTitle: z.string().nullable().optional(),
  specializationAreas: z.array(z.string()).optional(),
});

export const updateAdminProfileSchema = hasAtLeastOneField({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  sector: z.string().min(2, "Setor obrigatório").optional(),
});

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type UpdateProfessorProfileInput = z.infer<typeof updateProfessorProfileSchema>;
export type UpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;
