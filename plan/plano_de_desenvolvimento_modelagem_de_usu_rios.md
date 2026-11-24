# Plano de Desenvolvimento — Tarefa: Modelar Entidade de Usuários (Sprint 2)

## 1. Visão Geral da Tarefa

* **Contexto:** Sprint 2 — SimulaENADE
* **Objetivo Geral:** Estruturar a camada de dados, tipagem e regras de permissão para suportar múltiplos perfis de acesso no sistema, substituindo os dados estáticos do estudante único utilizados na Sprint 1.
* **Objetivos Específicos:**
  * [ ] Definir a função de cada acesso de usuário (RBAC).
  * [ ] Modelar o usuário **Aluno**.
  * [ ] Modelar o usuário **Professor**.
  * [ ] Modelar o usuário **Administração**.

### Arquivos do Projeto Relacionados
* `docker-compose.yml` e `backend/prisma/schema.prisma` (infraestrutura PostgreSQL e modelos do banco).
* `backend/prisma/seed.ts` (dados iniciais para testes de integração).
* `backend/src/schemas/user.schema.ts` (validação de entrada com Zod).
* `src/types/user.ts` e `src/types/question.ts` (contratos de tipagem do frontend).
* `src/components/UserProfileModal.tsx` (consumidor atual do perfil de estudante).

---

## 2. Etapas de Desenvolvimento

### Etapa 1: Definição das Funções e Permissões por Acesso (Objetivo 1)
**Entregável:** Matriz de controle de acesso (RBAC) documentada para guiar os middlewares de autenticação e as rotas da API.

| Funcionalidade / Recurso | Aluno (`STUDENT`) | Professor (`PROFESSOR`) | Administração (`ADMIN`) |
| :--- | :---: | :---: | :---: |
| **Autenticação e edição do próprio perfil** | Sim | Sim | Sim |
| **Resolver simulados e questões avulsas** | Sim | Sim (modo teste) | Sim |
| **Visualizar gabarito comentado e histórico próprio** | Sim | Não (modo teste sem histórico pessoal persistido, salvo decisão futura) | Não |
| **Configurar preferências de prova e meta semanal** | Sim | Não | Não |
| **Criar, editar e revisar questões e explicações** | Não | Sim | Sim |
| **Montar cadernos de simulados / listas por turma** | Não | Sim | Sim |
| **Consultar métricas agregadas por disciplina/questão** | Apenas suas métricas | Métricas de turmas/disciplinas | Métricas globais do sistema |
| **Cadastrar edições oficiais do ENADE (`Exam`) e áreas** | Não | Sugerir / vincular | Gerenciar (CRUD completo) |
| **Importar provas em lote (saída JSON do `pdf-parser`)** | Não | Não | Sim |
| **Gerenciar usuários, ativar/desativar contas e aprovar papéis** | Não | Não | Sim |

> Histórico próprio (`Attempt`/`StudentAnswer`) existe apenas para `STUDENT`;
> PROFESSOR e ADMIN usam o simulador em modo teste sem persistência pessoal até
> que um modelo de ownership cross-role seja decidido em tarefa específica.

---

### Etapa 2: Modelagem do Banco de Dados no Prisma (Objetivos 2, 3 e 4)
**Entregável:** Atualização do `schema.prisma` utilizando o padrão **Entidade Base + Perfis Especializados (1:1)** conectado ao **PostgreSQL**.

* **Decisão de Arquitetura:** A tabela `users` centraliza credenciais (`email`, `passwordHash`), status (`isActive`) e papel (`role`). Cada perfil especializado (`student_profiles`, `professor_profiles`, `admin_profiles`) possui seus próprios atributos e relacionamentos de negócio, evitando colunas nulas na tabela principal.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==========================================
// ENUMS DE ACESSO E DOMÍNIO
// ==========================================

enum UserRole {
  STUDENT
  PROFESSOR
  ADMIN
}

enum AdminAccessLevel {
  COORDINATOR // Coordenação de curso / NDE (gestão acadêmica e provas)
  SUPER_ADMIN // Administração técnica total (usuários, logs e sistema)
}

// ==========================================
// ENTIDADE BASE DE USUÁRIOS
// ==========================================

model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole @default(STUDENT)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Perfis especializados (relacionamento 1:1 conforme o role)
  studentProfile   StudentProfile?
  professorProfile ProfessorProfile?
  adminProfile     AdminProfile?

  @@index([role])
  @@map("users")
}

// ==========================================
// OBJETIVO 2: MODELAGEM DO USUÁRIO ALUNO
// ==========================================

model StudentProfile {
  id               String   @id @default(uuid())
  userId           String   @unique
  registration     String   @unique // Matrícula acadêmica (ex.: "2021.1.04512")
  course           String   // Ex.: "Sistemas de Computação"
  semester         Int?     // Período atual
  weeklyGoalTarget Int      @default(20) // Meta semanal de questões
  showTimerInExam  Boolean  @default(true) // Preferência já prevista no UserProfileModal
  instantFeedback  Boolean  @default(true) // Preferência já prevista no UserProfileModal
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Restrict)
  attempts Attempt[]

  @@map("student_profiles")
}

// ==========================================
// OBJETIVO 3: MODELAGEM DO USUÁRIO PROFESSOR
// ==========================================

model ProfessorProfile {
  id                  String   @id @default(uuid())
  userId              String   @unique
  institutionalId     String   @unique // Matrícula funcional / SIAPE
  department          String   // Ex.: "Departamento de Computação"
  academicTitle       String?  // Ex.: "Mestre", "Doutor", "Especialista"
  specializationAreas String[] // Slugs das disciplinas (ex.: ["banco-de-dados", "redes-de-computadores"])
  isVerified          Boolean  @default(false) // Validado pela administração antes de publicar questões
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user              User       @relation(fields: [userId], references: [id], onDelete: Restrict)
  authoredQuestions Question[] @relation("QuestionAuthor")

  @@map("professor_profiles")
}

// ==========================================
// OBJETIVO 4: MODELAGEM DO USUÁRIO ADMINISTRAÇÃO
// ==========================================

model AdminProfile {
  id           String           @id @default(uuid())
  userId       String           @unique
  employeeCode String           @unique // Código funcional administrativo
  sector       String           // Ex.: "Coordenação de Curso", "NDE", "Suporte TI"
  accessLevel  AdminAccessLevel @default(COORDINATOR)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@map("admin_profiles")
}

// ==========================================
// INTEGRAÇÃO COM PROVAS E HISTÓRICO
// ==========================================

// Catálogo usa remoção lógica; FKs de histórico usam Restrict para impedir
// exclusão física que apague respostas de tentativas.
model Exam {
  id          String     @id @default(uuid())
  title       String
  year        Int
  course      String
  description String?
  deletedAt   DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  questions   Question[]

  @@index([deletedAt])
  @@map("exams")
}

model Question {
  id            String   @id @default(uuid())
  examId        String?
  authorId      String?  // Vínculo com o professor autor/revisor da questão
  number        Int
  area          String
  areaSlug      String?
  difficulty    String   @default("medium")
  contextText   String
  supportText   String?
  prompt        String
  correctLetter String
  explanation   String
  deletedAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  exam         Exam?             @relation(fields: [examId], references: [id], onDelete: Restrict)
  author       ProfessorProfile? @relation("QuestionAuthor", fields: [authorId], references: [id], onDelete: SetNull)
  alternatives Alternative[]
  answers      StudentAnswer[]

  @@index([deletedAt])
  @@map("questions")
}

model Alternative {
  id         String   @id @default(uuid())
  questionId String
  letter     String
  text       String
  createdAt  DateTime @default(now())

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([questionId, letter])
  @@map("alternatives")
}

model Attempt {
  id         String    @id @default(uuid())
  studentId  String
  title      String
  startedAt  DateTime  @default(now())
  finishedAt DateTime?

  student StudentProfile  @relation(fields: [studentId], references: [id], onDelete: Restrict)
  answers StudentAnswer[]

  @@map("attempts")
}

model StudentAnswer {
  id             String   @id @default(uuid())
  attemptId      String
  questionId     String
  selectedLetter String
  isCorrect      Boolean
  answeredAt     DateTime @default(now())

  attempt  Attempt  @relation(fields: [attemptId], references: [id], onDelete: Restrict)
  question Question @relation(fields: [questionId], references: [id], onDelete: Restrict)

  @@unique([attemptId, questionId])
  @@map("student_answers")
}
```

---

### Etapa 3: Validação e Contratos de Dados (Backend e Frontend)
**Entregáveis:** Schemas de validação Zod no backend e interfaces TypeScript discriminadas no frontend.

#### 3.1 Backend (`backend/src/schemas/user.schema.ts`)
Validação polimórfica por `role` para garantir que nenhum usuário seja cadastrado sem os dados obrigatórios do seu perfil:

```typescript
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
```

#### 3.2 Frontend (`src/types/user.ts`)
Contratos tipados para consumo nos modais e rotas protegidas, mantendo compatibilidade com os dados já exibidos em `UserProfileModal.tsx`:

```typescript
export type UserRole = "STUDENT" | "PROFESSOR" | "ADMIN";
export type AdminAccessLevel = "COORDINATOR" | "SUPER_ADMIN";

export interface BaseUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly initials: string;
  readonly role: UserRole;
  readonly isActive: boolean;
}

export interface StudentUserProfile extends BaseUser {
  readonly role: "STUDENT";
  readonly registration: string;
  readonly course: string;
  readonly semester?: number;
  readonly weeklyGoalTarget: number;
  readonly showTimerInExam: boolean;
  readonly instantFeedback: boolean;
}

export interface ProfessorUserProfile extends BaseUser {
  readonly role: "PROFESSOR";
  readonly institutionalId: string;
  readonly department: string;
  readonly academicTitle?: string;
  readonly specializationAreas: readonly string[];
  readonly isVerified: boolean;
}

export interface AdminUserProfile extends BaseUser {
  readonly role: "ADMIN";
  readonly employeeCode: string;
  readonly sector: string;
  readonly accessLevel: AdminAccessLevel;
}

export type AppUser = StudentUserProfile | ProfessorUserProfile | AdminUserProfile;
```

---

### Etapa 4: Aplicação da Migration e Seed Inicial
**Entregáveis:** Tabelas criadas no PostgreSQL e registros iniciais populados para desbloquear o desenvolvimento das próximas tarefas da Sprint 2 (autenticação, CRUD de questões e histórico de simulados).

1. **Garantir banco PostgreSQL ativo via Docker:**
   ```bash
   docker compose up -d db
   ```
2. **Gerar e aplicar a migration no Prisma:**
   ```bash
   npx prisma migrate dev --name add_user_entities
   npx prisma generate
   ```

   A migration corretiva `20261124130000_preserve_student_answer_history`
   (remoção lógica de catálogo e FKs de histórico com `RESTRICT`) também deve
   ser aplicada antes de qualquer escrita em ambiente compartilhado. Seeds de
   contas só rodam em ambiente local autorizado — ver `README.md` e
   `docs/runbook-cutover-postgresql.md`.
3. **Criar script `backend/prisma/seed.ts` com 3 usuários padrão:**
   * **Aluno (`STUDENT`):** *Ana Beatriz Moraes* (mantendo paridade com o mock atual da Sprint 1).
   * **Professor (`PROFESSOR`):** Docente vinculado às áreas de *Banco de Dados* e *Engenharia de Software* com `isVerified: true`.
   * **Administração (`ADMIN`):** Coordenador de Curso (`accessLevel: "COORDINATOR"`).

---

## 3. Checklist e Critérios de Aceite (Definition of Done)

- [ ] **Etapa 1 concluída:** Matriz de funções por perfil (`STUDENT`, `PROFESSOR`, `ADMIN`) revisada e versionada no repositório.
- [ ] **Etapa 2 concluída:** `schema.prisma` atualizado com `User`, `StudentProfile`, `ProfessorProfile` e `AdminProfile` sem erros de validação (`npx prisma validate`).
- [ ] **Etapa 3 concluída:** Schemas Zod (`user.schema.ts`) e tipos TypeScript (`src/types/user.ts`) compilando sem erros (`tsc --noEmit`).
- [ ] **Etapa 4 concluída:** Migration aplicada no PostgreSQL e seed executado com sucesso, criando os 3 perfis de teste no banco.