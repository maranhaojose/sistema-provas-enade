# Matriz de Controle de Acesso (RBAC) — Sprint 2

Este documento versiona as funções e permissões por perfil definidas no
`plano/plano_de_desenvolvimento_modelagem_de_usu_rios.md`. Ele serve como
referência para os middlewares de autenticação, para as rotas da API e para
as rotas protegidas do frontend.

## Perfis

| Perfil | Valor (`UserRole`) | Descrição |
| :--- | :--- | :--- |
| Aluno | `STUDENT` | Usuário focal do simulador: resolve questões, acompanha seu desempenho e ajusta preferências de estudo. |
| Professor | `PROFESSOR` | Docente responsável por autoria/revisão de questões e montagem de listas por turma. |
| Administração | `ADMIN` | Gestão acadêmica (`COORDINATOR`) ou técnica (`SUPER_ADMIN`) do sistema. |

## Matriz de permissões

| Funcionalidade / Recurso | Aluno (`STUDENT`) | Professor (`PROFESSOR`) | Administração (`ADMIN`) |
| :--- | :---: | :---: | :---: |
| Autenticação e edição do próprio perfil | Sim | Sim | Sim |
| Resolver simulados e questões avulsas | Sim | Sim (modo teste) | Sim |
| Visualizar gabarito comentado e histórico próprio | Sim | Não (modo teste sem histórico pessoal persistido, salvo decisão futura) | Não |
| Configurar preferências de prova e meta semanal | Sim | Não | Não |
| Criar, editar e revisar questões e explicações | Não | Sim | Sim |
| Montar cadernos de simulados / listas por turma | Não | Sim | Sim |
| Consultar métricas agregadas por disciplina/questão | Apenas suas métricas | Métricas de turmas/disciplinas | Métricas globais do sistema |
| Cadastrar edições oficiais do ENADE (`Exam`) e áreas | Não | Sugerir / vincular | Gerenciar (CRUD completo) |
| Importar provas em lote (saída JSON do `pdf-parser`) | Não | Não | Sim |
| Gerenciar usuários, ativar/desativar contas e aprovar papéis | Não | Não | Sim |

## Níveis de acesso administrativo

| Nível (`AdminAccessLevel`) | Abrangência |
| :--- | :--- |
| `COORDINATOR` | Coordenação de curso / NDE: gestão acadêmica, provas e questões. |
| `SUPER_ADMIN` | Administração técnica total: usuários, logs e configurações do sistema. |

## Diretrizes de implementação

- `users.role` é a fonte autoritativa do perfil; cada papel possui no máximo um
  perfil especializado associado (`student_profiles`, `professor_profiles` ou
  `admin_profiles`).
- Perfis especializados só existem para o papel correspondente. A validação de
  entrada com Zod é polimórfica por `role` e exige os campos obrigatórios do
  perfil escolhido.
- Questões criadas por docentes são vinculadas ao `ProfessorProfile` via
  `Question.authorId`; a exclusão do perfil do professor preserva a questão
  (`onDelete: SetNull`).
- Histórico de resolução (`Attempt` / `StudentAnswer`) pertence exclusivamente
  ao `StudentProfile`, garantindo que métricas individuais não sejam misturadas
  entre alunos. Professores e administração podem usar o simulador em modo teste,
  mas não possuem histórico pessoal persistido enquanto não existir um modelo de
  ownership cross-role (decisão de produto em tarefa própria, com ADR).
- Preferências de prova e meta semanal permanecem em `StudentProfile`; elas não
  são usadas como critério de ownership de tentativas.
