# TASK-010 — Implementar Rules e testes de allowlist

**Fase:** 3

## Objetivo

Garantir default deny e acesso somente às identidades autorizadas.

## Dependências

- TASK-008
- TASK-009

## Referências do SDD

- `docs/11-technical-architecture.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Rules com autenticação obrigatória
- [ ] Estratégia temporária por e-mail verificado se UID ainda não disponível
- [ ] Estrutura para allowlist final por UID
- [ ] Testes rules-unit-testing no Emulator

## Critérios de aceite

- [ ] AC-SEC-001 passa
- [ ] AC-SEC-002 passa
- [ ] AC-SEC-003 passa
- [ ] Usuário não autorizado não lê nem escreve

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
