# Runbook — Cutover do catálogo SQLite legado para PostgreSQL

## 1. Classificação do ambiente (gate obrigatório)

**Classificação adotada neste repositório:** o catálogo SQLite legado é
**descartável**. Evidências: arquivos `*.db` são ignorados pelo Git, a migration
`20261123193653_add_user_entities` cria apenas estrutura vazia e o catálogo de
exemplo é recriado por `POST /api/questions/seed`. Não existe dado versionado
que exija transferência.

Essa classificação **não** vale automaticamente para instalações com dados
reais. Antes de qualquer aplicação em staging/produção ou banco compartilhado,
o Tech Lead deve confirmar por escrito uma das duas vias abaixo. Seeds de contas
nunca devem ser executados contra banco compartilhado.

| Via | Quando usar | Resultado |
| :--- | :--- | :--- |
| A — Descartável | Não existe histórico ou catálogo que precise ser preservado | Recriar catálogo no PostgreSQL vazio |
| B — Não descartável | Existem provas, questões ou respostas que precisam ser preservadas | **PARAR** e executar transferência verificada (§3) |

## 2. Via A — Banco descartável

1. **Backup antes de qualquer mudança:** copie o arquivo SQLite (se existir) e
   faça um dump do banco PostgreSQL de destino.
2. **Use um banco novo e vazio.** Não aplique esta via sobre um banco com dados.
3. **Configure `DATABASE_URL`** no `backend/.env` e no `.env` do
   `docker-compose.yml` para o banco PostgreSQL de destino. O host `db` é
   esperado dentro da rede do Docker; `localhost` é usado fora dela.
4. **Aplique as migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```
   Isso inclui a migration corretiva
   `20261124130000_preserve_student_answer_history` (remoção lógica de catálogo
   e FKs de histórico com `RESTRICT`).
5. **Validação de estrutura:**
   ```bash
   npx prisma migrate diff \
     --from-url "$DATABASE_URL" \
     --to-schema-datamodel prisma/schema.prisma --exit-code
   ```
   O comando deve terminar sem diferenças.
6. **Smoke tests:** `GET /health`, `GET /api/questions` e
   `POST /api/questions/seed` (carga inicial de exemplo). Questões removidas
   logicamente não aparecem na listagem, mas respostas antigas permanecem.
7. **Seeds de contas somente em ambiente local autorizado** (§4). Nunca rode os
   seeds em staging/produção: eles criam/resetam identidades fixture.

## 3. Via B — Catálogo não descartável (transferência verificada)

Se qualquer dado precisar ser preservado, **não** execute a Via A. Procedimento
mínimo antes de aprovar o corte:

1. Inventariar tabelas e registros do SQLite legado (`Exam`, `Question`,
   `Alternative` e relações), exportando contagens e checksums por tabela.
2. Definir o mapeamento de IDs: preservar os IDs antigos ou manter tabela de
   correspondência `antigo -> novo UUID`. Sem esse mapa, relações e histórico
   ficam órfãos.
3. Congelar escrita no SQLite. A partir deste ponto não crie novos registros no
   origem sem registrar para backfill.
4. Importar os dados para o PostgreSQL recém-criado, aplicar as migrations e
   validar: contagens por tabela, checksums, amostras de questões/alternativas e
   integridade das foreign keys.
5. Só então apontar `DATABASE_URL` para o PostgreSQL e liberar a escrita.
6. **Rollback:** voltar ao SQLite é seguro apenas antes do corte de escrita.
   Depois do corte, o PostgreSQL é a source of truth; revert exigirá backfill
   reverso explícito das escritas feitas no novo banco.

## 4. Seeds de contas: pré-condições e uso local

Os dois comandos abaixo usam as mesmas fixtures e as mesmas guardas:

```bash
cd backend
NODE_ENV=development ALLOW_DEV_SEED=true npm run prisma:seed       # seed.ts
NODE_ENV=development ALLOW_DEV_SEED=true npm run prisma:seed:test  # alias para teste manual da UI
```

Regras:

- `NODE_ENV` deve ser `development` ou `test` e `ALLOW_DEV_SEED=true` é
  obrigatório. Sem isso o seed aborta.
- O host em `DATABASE_URL` deve ser local (`localhost`, `127.0.0.1`, `::1` ou
  `db` do Docker). Um host externo exige `ALLOW_DEV_SEED_NONLOCAL=true` com
  autorização explícita e registrada; **nunca** em produção.
- Se alguma das três contas já existir com nome, papel, status ou perfil
  divergente da fixture, o seed falha com mensagem clara em vez de sobrescrever
  a identidade. Níveis administrativos das fixtures: `COORDINATOR`.
- Usuário e perfil são gravados em uma única transação. Não há estado parcial.
- Contas existentes **não** têm credenciais rotacionadas. Quando alguma conta é
  criada, uma senha aleatória é gravada em
  `backend/prisma/.dev-seed-credentials.json` (permissão `0600`, ignorado pelo
  Git). A senha nunca é impressa no console. Não versionar nem compartilhar
  esse arquivo.

## 5. Testes de validação

Em um banco PostgreSQL **descartável** cujo nome contenha `test`:

```bash
cd backend
TEST_DATABASE_URL="postgresql://.../enade_history_test" npx prisma migrate deploy
TEST_DATABASE_URL="postgresql://.../enade_history_test" npm test
npm run typecheck
npm run typecheck:scripts
```

Os testes cobrem: bloqueio de hard delete com histórico, preservação após
remoção lógica, hard delete de aluno/perfil, guardas de ambiente dos seeds e
detecção de divergência de fixtures.
