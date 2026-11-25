# Protocolo Operacional Padrão — Engenharia de Software
## Manual de Desenvolvimento Colaborativo & Governança Git
> **Do Primeiro Clone ao Merge: Ciclo Completo de Contribuição**  
> Guia oficial para desenvolvedores e estudantes sobre o fluxo de trabalho seguro, padronização semântica de branches e commits, regras de Pull Request e segregação de permissões.

---

### Plataforma de Referência & Convenções de Notação
* **Plataforma Primária:** Este manual adota o **GitHub** como plataforma oficial primária, utilizando `develop` como ramificação padrão de integração e `main` como ramificação de produção.
* **Compatibilidade com GitLab:** Caso o projeto seja migrado para o GitLab, os *Pull Requests* (PR) correspondem aos *Merge Requests* (MR), mantendo-se idênticas todas as regras de nomenclatura e commits.
* **Identificadores Dinâmicos:** Valores em caixa alta como `URL_DO_REPOSITORIO`, `NOME_DO_REPOSITORIO` e `NUMERO_DA_ISSUE` representam identificadores reais que devem ser substituídos no momento da execução.

---

### Segregação de Papéis

| Papel | Responsabilidades e Limites |
| :--- | :--- |
| **Desenvolvedor** | Codificar a issue, executar testes, criar commits com `#NUMERO`, abrir PR para `develop` e aplicar ajustes solicitados. **Nunca fecha issues nem faz merge.** |
| **Líder Técnico (Tech Lead)** | Atribuir tarefas, revisar código (*Code Review*), aprovar Pull Requests, realizar merge na `develop`/`main` e fechar manualmente a Issue após validação. |

---

## Etapa 1 — Fundamentos e Fluxograma Visual

O desenvolvimento colaborativo exige sincronia rigorosa entre branches locais, servidores remotos e registros de tarefas. **Nenhum código entra nas branches centrais sem revisão prévia.**

### Fluxograma do Ciclo de Vida da Tarefa

```text
[1. Issue (#123)] ──▶ [2. Branch (feat/issue-123-...)] ──▶ [3. Commits (tipo: desc #123)]
                                                                       │
[6. Merge & Fecha Issue] ◀── [5. Review (Exclusivo Líder)] ◀── [4. Push & PR para develop]
```

### Conceitos Essenciais
* **Repositório & Branch:**
  * **Repositório:** Casa do projeto e de todo o seu histórico de alterações.
  * **Branch:** Linha paralela de trabalho isolada para que modificações em andamento não afetem outros membros da equipe.
* **Commit & Push:**
  * **Commit:** Registro pontual de alterações com mensagem semântica.
  * **Push:** Transmissão dos commits locais para o servidor remoto.
* **PR / MR & Merge:**
  * **PR (Pull Request) / MR (Merge Request):** Pedido formal para integrar sua branch à branch base.
  * **Merge:** Ação executada exclusivamente pelo Líder mesclando os códigos validados.

---

## Etapa 2 — Obter o Código pela Primeira Vez (Clonagem)

A clonagem inicial deve ser feita **apenas uma vez**. Para trabalhar posteriormente em novas tarefas, utilize a atualização da branch (Etapa 4) sem re-clonar o projeto.

1. **Copiar a URL e clonar:** No GitHub, clique no botão verde **`<> Code`** e copie o link HTTPS ou SSH. Abra o terminal na sua pasta de projetos e execute:
   ```bash
   git clone URL_DO_REPOSITORIO
   ```

2. **Navegar para a pasta e inspecionar:** Entre na pasta do projeto e verifique a integridade da cópia local:
   ```bash
   cd NOME_DO_REPOSITORIO
   git status   # Confirma diretório de trabalho limpo
   git branch   # Lista as branches locais; a branch de integração é develop
   ```

> **Diferença Técnica:** `git clone` baixa o histórico integral, configurações e arquivos do zero em uma pasta nova. Atualizações subsequentes usam `git pull` para trazer apenas os commits que foram alterados remotamente.

---

## Etapa 3 — Escolher e Compreender a Issue

Nenhum código pode ser escrito sem uma **Issue** correspondente no GitHub. O desenvolvedor deve:

1. Acessar a aba **Issues** do repositório e selecionar a tarefa atribuída nominalmente a você (ou autorizada pelo Tech Lead).
2. Ler exaustivamente o **Objetivo** e a lista de **Critérios de Aceitação** antes de tocar em qualquer arquivo.
3. Identificar o número identificador único da Issue (exemplo: `#123`). Caso a descrição esteja vaga ou apresente impedimentos técnicos, consulte imediatamente o Líder antes de começar.

---

## Etapa 4 — Atualizar o Repositório Local

Antes de criar qualquer ramificação, sincronize sua máquina local com a branch de integração padrão do repositório (`develop`):

```bash
git status                # 1. Garanta que não há alterações pendentes ou não salvas
git switch develop        # 2. Muda para a branch de integração padrão: develop
git pull origin develop   # 3. Baixa os commits mais recentes integrados pela equipe
```

> **Atenção:** Se o comando `git status` indicar arquivos modificados, **não** execute comandos destrutivos como `git reset --hard` sem autorização. Finalize, guarde (`git stash`) ou desfaça ordenadamente antes de trocar de branch.

> **Exceção formal:** outro repositório só pode usar branch de integração diferente de `develop` se houver aprovação explícita do Tech Lead e decisão registrada no repositório. Não substitua `develop` por `main` por conveniência, e mantenha PRs, limpeza de branch e atualização local alinhados à mesma branch.

---

## Etapa 5 — Criar a Branch da Issue (Convenção Obrigatória)

É **estritamente proibido** programar diretamente na `main` ou na `develop`. Toda branch deve seguir o padrão semântico contendo o número da Issue:

```text
<tipo>/issue-<NUMERO>-<descricao-curta-kebab-case>
```

**Exemplo de criação:**
```bash
git switch -c feat/issue-123-cadastro-usuario
```

### Tipos de Branch Permitidos

| Tipo da Branch | Quando Utilizar | Exemplo Conforme Padrão |
| :--- | :--- | :--- |
| `feat/...` | Nova funcionalidade ou regra de negócio | `feat/issue-123-cadastro-usuario` |
| `fix/...` | Correção de bug em funcionalidade existente | `fix/issue-124-validacao-email` |
| `docs/...` | Documentação, manuais, guias e Swagger | `docs/issue-125-manual-instalacao` |
| `refactor/...` | Reorganização interna de código sem mudar regra | `refactor/issue-126-organizar-servicos` |
| `test/...` | Adição ou manutenção de testes de unidade/e2e | `test/issue-127-testes-autenticacao` |

> **Regra Anti-Conflito:** Uma branch pertence exclusivamente a **UMA** Issue. Nunca misture duas tarefas diferentes na mesma branch.

---

## Etapa 6 — Desenvolver a Tarefa com Higiene e Testes

Trabalhe com escopo fechado. Antes de commitar, inspecione exatamente o que foi modificado pelo terminal:

```bash
# Inspecione o estado dos arquivos
git status

# Revise cada linha alterada
git diff
```

### Checklist de Boas Práticas
- [ ] Não inclua arquivos temporários, logs ou `node_modules`.
- [ ] Jamais comite senhas, tokens, chaves de API ou arquivos `.env`.
- [ ] Execute os testes automatizados da aplicação antes de commitar.
- [ ] Não altere arquivos fora do escopo definido na Issue.

---

## Etapa 7 — Criar Commits Padronizados (Conventional Commits + Issue)

O formato oficial de commit exige a categoria semântica, descrição clara no imperativo e a menção obrigatória ao número da Issue ao final:

```bash
git add caminho/do/arquivo_alterado
git diff --cached   # Inspeciona o que está pronto para ser commitado
git commit -m "tipo: descrição curta da modificação #NUMERO_DA_ISSUE"
```

### Tabela de Prefixos Semânticos

| Prefixo | Descrição Técnica | Exemplo Conforme o Padrão Oficial |
| :--- | :--- | :--- |
| `feat:` | Adição de funcionalidade de negócio | `feat: adiciona cadastro de usuário #123` |
| `fix:` | Correção de bug ou falha de execução | `fix: corrige validação de email duplicado #124` |
| `docs:` | Ajustes em README ou manuais técnicos | `docs: atualiza instruções de instalação #125` |
| `refactor:` | Refatoração sem alterar o comportamento | `refactor: modulariza serviço de cobrança #126` |
| `test:` | Criação ou correção de testes | `test: adiciona testes de autenticação #127` |
| `chore:` | Dependências, tarefas de build e configs | `chore: atualiza dependências do projeto #128` |
| `perf:` | Otimização de desempenho e queries | `perf: otimiza consulta de listagem de clientes #129` |
| `build:` | Alterações em scripts de compilação ou NPM | `build: ajusta configuração do Webpack #130` |
| `ci:` | Pipelines do GitHub Actions / GitLab CI | `ci: configura pipeline de testes automatizados #131` |
| `revert:` | Reversão autorizada de commit anterior | `revert: desfaz inclusão do modal legado #132` |

> **ALERTA CRÍTICO — PROIBIDO USAR PALAVRAS DE FECHAMENTO AUTOMÁTICO:**  
> Para preservar a autoridade de validação do Tech Lead, **NUNCA** utilize termos automáticos de fechamento como `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve` ou `resolves` antes de `#123`.
> * **CORRETO:** `feat: adiciona tabela de produtos #123`
> * **PROIBIDO:** `feat: adiciona tabela closes #123` *(Fecha a tarefa automaticamente sem aprovação do Líder)*

---

## Etapa 8 — Enviar as Alterações ao Repositório Remoto

Com os commits registrados e testados localmente, envie a branch para o servidor do GitHub:

```bash
# Primeiro envio: publica a branch e conecta o tracking upstream (-u)
git push -u origin feat/issue-123-cadastro-usuario

# Envios subsequentes na mesma branch já associada:
git push
```

* **`origin`:** Apelido padrão do repositório remoto central.
* **`-u` (`--set-upstream`):** Vincula a branch local à remota correspondente para permitir comandos futuros simplificados (`git push` / `git pull`).

> **Comandos Proibidos:** Nunca execute `git push --force` ou tente sobrescrever históricos compartilhados. Comandos destrutivos exigem expressa autorização do Tech Lead.

---

## Etapa 9 — Abrir o Pull Request (PR) com Destino Correto

No GitHub, acesse a aba **Pull Requests** e clique no botão verde **New pull request**.

### Configuração Crítica das Branches
* **Base (Destino à esquerda):** `develop`, sempre. **Nunca selecione `main`!** Exceção apenas com aprovação formal do Tech Lead registrada no repositório.
* **Compare (Origem à direita):** Selecione a sua branch criada (ex.: `feat/issue-123-cadastro-usuario`).

### Título e Modelo Padronizado de Descrição
* **Título:** Deve ser objetivo e seguir o padrão semântico (ex.: `feat: cadastro de usuário #123`).
* **Corpo do PR:** Preencha utilizando obrigatoriamente o template abaixo:

```markdown
## Objetivo
Descrever objetivamente a solução implementada e a regra atendida.

## Issue relacionada
#123 (Sem termos como "closes" ou "resolves")

## Alterações realizadas
- Criação do componente de formulário de cadastro
- Integração com a API de validação de CPF

## Testes executados
- Testes de unidade automatizados (npm test)
- Validação manual em navegador Chrome e Firefox

## Observações
Necessário executar as migrações de banco antes de subir para staging.
```

> **Lembrete:** Abrir o Pull Request não significa que a tarefa está pronta ou aceita. Significa apenas que o código foi submetido para apreciação técnica do Líder.

---

## Etapa 10 — Revisão do Líder (Code Review) e Ajustes

O Tech Lead fará a leitura detalhada das modificações no GitHub. Três desfechos são possíveis:

1. **Aprovado (*Approved*):** O código atende aos requisitos, passou nos testes e está apto para merge pelo Líder.
2. **Alterações Solicitadas (*Changes Requested*):** O Líder apontará melhorias. O desenvolvedor deve corrigir na mesma branch e dar push.
3. **Rejeitado (*Closed*):** Solução fora do escopo ou com falhas arquiteturais graves. Exige realinhamento prévio.

### Como Enviar Ajustes Solicitados
Caso o revisor peça alterações, **não abra um novo PR**. Permaneça na mesma branch local, faça as correções necessárias, registre novo commit padronizado e execute `git push`. O PR existente será atualizado automaticamente em tempo real.

---

## Etapa 11 — Aprovação, Integração e Fechamento da Issue

A segregação de poderes garante a rastreabilidade e a estabilidade da aplicação:

| Ação Técnica no Fluxo | Desenvolvedor | Líder Técnico |
| :--- | :---: | :---: |
| Escrever código, testes e commitar com `#NUMERO` | **Obrigatório** | Supervisiona |
| Publicar branch e abrir Pull Request | **Obrigatório** | Recebe notificação |
| Aprovar formalmente o Pull Request no GitHub | Proibido (Bloqueado) | **Exclusivo** |
| Executar o Merge para `develop` ou `main` | Proibido (Bloqueado) | **Exclusivo** |
| Encerrar / Fechar manualmente a Issue | Proibido | **Exclusivo** |

---

## Etapa 12 — Atualizar o Ambiente Local para a Próxima Tarefa

Após a confirmação de merge dada pelo Tech Lead, redefina sua máquina para iniciar a próxima issue:

```bash
git switch develop                              # 1. Retorne à branch de integração
git pull origin develop                         # 2. Puxe o código com seu PR já mesclado e integrado
git branch -d feat/issue-123-cadastro-usuario   # 3. Exclua a branch local concluída
```

---

## Regras Gerais & Matriz de Prevenção de Falhas

### Os 14 Mandamentos Operacionais Inegociáveis
1. Toda tarefa deve estar vinculada a uma Issue aberta.
2. Toda branch de trabalho deve conter o número da Issue.
3. Todo commit deve registrar `#NUMERO_DA_ISSUE` ao final.
4. Os commits devem usar prefixos padronizados (*Conventional Commits*).
5. Proibido commitar diretamente na `main` ou `develop`.
6. Todo PR deve apontar para a branch de destino correta (`develop`).
7. Proibido usar termos de fechamento automático (`closes`, `fixes`, `resolves`, etc.).
8. Apenas o Líder aprova, faz merge e fecha a Issue.
9. Proibido comitar senhas, tokens, chaves ou arquivos `.env`.
10. Proibido `git push --force` ou comandos destrutivos sem autorização.
11. Não adicionar modificações alheias ao escopo da Issue.
12. PR aberto não significa tarefa finalizada.
13. Proibido fazer merge por conta própria.
14. Em caso de dúvidas ou bloqueios, consulte o Tech Lead.

### Matriz de Prevenção de Falhas Comuns

| Falha Potencial | Risco para a Equipe | Ação Preventiva / Solução Segura |
| :--- | :--- | :--- |
| **Commit direto na `develop` ou `main`** | Rejeição pelo servidor e risco de instabilidade | `git branch feat/issue-X-descricao` preserva o commit na nova branch; confirme com `git log` que ele está lá. Faça `git fetch origin`, verifique trabalho local não relacionado e guarde-o com `git stash` **antes** de qualquer reset. Se o commit já foi publicado em `develop`, use `git revert` em vez de reescrever histórico. Somente após confirmar tudo, realinhe `develop` com `origin/develop` (`git switch develop && git reset --hard origin/develop`, com autorização). Criar a branch **não** remove o commit de `develop`. |
| **Esquecer o `#ID` no commit** | Perda de rastreabilidade na auditoria do GitHub | Em caso de último commit local (antes do push), corrigir com: `git commit --amend -m "tipo: descrição #ID"`. |
| **Usar `closes #123` no commit/PR** | Fecha a Issue antes da homologação do Tech Lead | Usar estritamente a referência neutra `#123` sem verbos ingleses vinculados. |
| **Enviar arquivos `.env` com tokens** | Vazamento de credenciais e risco crítico de segurança | Revogue/rotacione imediatamente todas as credenciais expostas e notifique o Tech Lead. Remova do índice com `git rm --cached .env` e adicione ao `.gitignore`; coordene a limpeza do histórico (`git filter-repo`/BFG) e invalide os tokens nos provedores. `.gitignore` e `git rm --cached` **não** apagam o que já foi comitado. |
| **Abrir PR com base apontando para `main`** | Conflito direto com versão de produção estável | No GitHub, editar o cabeçalho do PR e alterar a *base branch* para `develop`. |
| **Uso acidental de `git reset --hard`** | Destruição irreversível de código local não salvo | Não execute sem revisar `git status` e garantir backup. Para preservar alterações, use `git stash` ou crie branch temporária **antes** do reset. Após um reset acidental, verifique stashes existentes, `git reflog`, autosave do editor e backups locais; a recuperação **não é garantida**. |

---

> **Compromisso de Excelência:** O cumprimento rigoroso deste fluxo garante que o histórico do Git seja limpo, as releases sejam seguras e cada participante tenha seu trabalho devidamente rastreado e reconhecido. Em caso de conflitos de merge (*merge conflicts*), pause e peça apoio ao Tech Lead.