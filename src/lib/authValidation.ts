export type AuthFormMode = "login" | "register";

export interface StudentLoginValues {
  email: string;
  password: string;
}

export interface StudentRegisterValues {
  name: string;
  email: string;
  password: string;
  registration: string;
  course: string;
  semester: string;
}

export interface ProfessorRegisterValues {
  name: string;
  email: string;
  password: string;
  institutionalId: string;
  department: string;
}

export type AuthFieldName =
  | "name"
  | "email"
  | "password"
  | "registration"
  | "course"
  | "semester"
  | "institutionalId"
  | "department";

export type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_REGISTER_PASSWORD_LENGTH = 8;

export function isValidEmailFormat(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
    return false;
  }

  const [localPart, domainPart] = trimmed.split("@");
  if (!localPart || !domainPart) {
    return false;
  }

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    domainPart.startsWith(".") ||
    domainPart.endsWith(".") ||
    domainPart.includes("..")
  ) {
    return false;
  }

  return true;
}

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Informe seu e-mail.";
  }
  if (!isValidEmailFormat(trimmed)) {
    return "Informe um e-mail válido (ex.: aluno@enade.edu.br).";
  }
  return undefined;
}

export function validatePassword(password: string, mode: AuthFormMode): string | undefined {
  if (!password || password.trim().length === 0) {
    return mode === "login" ? "Informe sua senha." : "Informe uma senha.";
  }

  if (mode === "register" && password.length < MIN_REGISTER_PASSWORD_LENGTH) {
    return `A senha deve ter no mínimo ${MIN_REGISTER_PASSWORD_LENGTH} caracteres.`;
  }

  return undefined;
}

export function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Informe seu nome completo.";
  }
  if (trimmed.length < 3) {
    return "O nome completo deve ter pelo menos 3 caracteres.";
  }
  return undefined;
}

export function validateRegistration(registration: string): string | undefined {
  const trimmed = registration.trim();
  if (!trimmed) {
    return "Informe sua matrícula acadêmica.";
  }
  if (trimmed.length < 4) {
    return "A matrícula deve ter pelo menos 4 caracteres.";
  }
  return undefined;
}

export function validateCourse(course: string): string | undefined {
  const trimmed = course.trim();
  if (!trimmed) {
    return "Informe o seu curso.";
  }
  if (trimmed.length < 3) {
    return "O curso deve ter pelo menos 3 caracteres.";
  }
  return undefined;
}

export function validateSemester(semester: string): string | undefined {
  const trimmed = semester.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 14) {
    return "Informe um período inteiro entre 1 e 14.";
  }

  return undefined;
}

export function validateInstitutionalId(institutionalId: string): string | undefined {
  const trimmed = institutionalId.trim();
  if (!trimmed) {
    return "Informe sua matrícula funcional.";
  }
  if (trimmed.length < 4) {
    return "A matrícula funcional deve ter pelo menos 4 caracteres.";
  }
  return undefined;
}

export function validateDepartment(department: string): string | undefined {
  const trimmed = department.trim();
  if (!trimmed) {
    return "Informe o seu departamento.";
  }
  if (trimmed.length < 3) {
    return "O departamento deve ter pelo menos 3 caracteres.";
  }
  return undefined;
}

export function validateLoginForm(values: StudentLoginValues): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(values.password, "login");
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function validateStudentRegisterForm(values: StudentRegisterValues): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  const nameError = validateName(values.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(values.password, "register");
  if (passwordError) errors.password = passwordError;

  const registrationError = validateRegistration(values.registration);
  if (registrationError) errors.registration = registrationError;

  const courseError = validateCourse(values.course);
  if (courseError) errors.course = courseError;

  const semesterError = validateSemester(values.semester);
  if (semesterError) errors.semester = semesterError;

  return errors;
}

export function validateProfessorRegisterForm(values: ProfessorRegisterValues): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  const nameError = validateName(values.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(values.password, "register");
  if (passwordError) errors.password = passwordError;

  const institutionalIdError = validateInstitutionalId(values.institutionalId);
  if (institutionalIdError) errors.institutionalId = institutionalIdError;

  const departmentError = validateDepartment(values.department);
  if (departmentError) errors.department = departmentError;

  return errors;
}

export function hasValidationErrors(errors: AuthFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
