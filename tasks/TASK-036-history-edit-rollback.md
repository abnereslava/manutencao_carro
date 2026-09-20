# TASK-036 — Implementar edição histórica, dependências e rollback

**Fase:** 20

## Objetivo

Permitir correções sem reconstrução histórica ambígua.

## Dependências

- TASK-026
- TASK-035

## Referências do SDD

- `docs/02-business-rules.md`
- `docs/06-user-flows.md`
- `docs/12-edge-cases.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Mapa de dependências
- [ ] Editar ocorrência e recalcular derivados
- [ ] Excluir sem dependências com rollback seguro
- [ ] Bloquear exclusão com dependências
- [ ] Tela/ação Ver dependências

## Critérios de aceite

- [ ] AC-HIST-003 a 005 passam
- [ ] A→B→C impede exclusão de A→B
- [ ] Rollback simples restaura estado anterior coerente

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
