# TASK-027 — Implementar Peça faltando essencial

**Fase:** 12

## Objetivo

Garantir confirmação e alerta crítico ao remover peça essencial.

## Dependências

- TASK-026

## Referências do SDD

- `docs/02-business-rules.md`
- `docs/06-user-flows.md`
- `docs/09-alert-system.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Modal crítico
- [ ] Estado missing
- [ ] Alerta de prioridade máxima
- [ ] Resolver ao instalar nova peça
- [ ] Bloquear snooze/ocultação

## Critérios de aceite

- [ ] AC-PART-010/011 passam
- [ ] AC-ALT-010 passa
- [ ] Alerta some somente quando a condição deixa de existir

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
