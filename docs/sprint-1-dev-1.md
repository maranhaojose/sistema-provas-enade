# Sprint 1 — Dev 1 (Backend/BD/Infra)

## Entregas incluídas nesta branch

| ID | Tarefa | Resultado | Validação |
|---|---|---|---|
| INF01 | Criar repositório GitHub | Repositório remoto existente: maranhaojose/sistema-provas-enade | Confirmado |
| INF02 | Definir estrutura de pastas | Separação inicial `apps/api`, `infra/postgres` e `docs` | Estrutura criada |
| INF03 | Configurar Docker | Dockerfile multi-stage para API Node 22 | Build real pendente |
| INF05 | Criar Docker Compose | API + PostgreSQL 16, rede, volume e healthcheck | Execução real pendente |

## Critérios de aceite a validar

- Executar `docker compose config` com `.env` preenchido.
- Executar `docker compose up --build`.
- Confirmar `GET /health` e `pg_isready`.
- Confirmar persistência do volume após reiniciar os containers.

## Limites de escopo

A API contém somente uma rota de healthcheck para permitir validar a imagem. Autenticação, regras de domínio, persistência real, schema e migrations permanecem fora desta entrega inicial e devem seguir os itens correspondentes do Product Backlog.
