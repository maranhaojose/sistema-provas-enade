# Sistema de Provas ENADE

Base inicial de infraestrutura para desenvolvimento local.

## Stack prevista nesta base

- Node.js 22 + TypeScript + Fastify (API inicial mínima)
- PostgreSQL 16
- Docker e Docker Compose

> A modelagem do domínio, autenticação, migrations e integração ORM devem ser implementadas nas tarefas próprias do backlog. Não há migrations nem dados de negócio nesta base.

## Pré-requisitos

- Docker Engine
- Docker Compose v2 (`docker compose`)
- Git

## Iniciar

1. Copie as variáveis de ambiente: `cp .env.example .env`.
2. Altere `POSTGRES_PASSWORD` e a senha correspondente em `DATABASE_URL` no arquivo `.env`.
3. Suba os serviços: `docker compose up --build`.
4. Verifique a API: `curl http://localhost:3000/health`.
5. Verifique o PostgreSQL: `docker compose exec db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"`.

Resposta esperada da API: `{"status":"ok","service":"api"}`.

## Serviços

| Serviço | Porta no host | Finalidade |
|---|---:|---|
| `api` | `3000` | API HTTP |
| `db` | `5432` | PostgreSQL |

Os serviços conversam pela rede privada do Compose. Dentro dos containers, a API deve usar o hostname `db`, não `localhost`.

## Comandos úteis

```bash
docker compose up -d --build
docker compose logs -f api
docker compose down
# Ação destrutiva: remove também o volume persistente do banco
docker compose down -v
```

## Estrutura

```text
.
├── apps/api/
│   ├── src/server.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── infra/postgres/init/
├── docs/
├── .dockerignore
├── .env.example
├── .gitignore
└── docker-compose.yml
```

## Decisões e limites

- O Compose usa healthcheck no PostgreSQL e `depends_on: condition: service_healthy`.
- O volume `postgres_data` persiste os dados entre reinicializações.
- Credenciais são fornecidas por `.env`, que não deve ser versionado.
- O endpoint `/health` verifica apenas se o processo HTTP está respondendo. A verificação de disponibilidade do banco deve ser adicionada quando a camada de persistência for implementada.
- A senha do `.env.example` é ilustrativa; substitua-a antes de qualquer uso compartilhado.
