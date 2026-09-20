# TASK-046 — Revisar performance e consultas

**Fase:** 32

## Objetivo

Eliminar gargalos reais antes do release.

## Dependências

- TASK-035
- TASK-040
- TASK-043

## Referências do SDD

- `docs/11-technical-architecture.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Lazy routes/code splitting
- [ ] Auditar listeners Firestore
- [ ] Paginação histórica
- [ ] Evitar renders redundantes
- [ ] Revisar bundle
- [ ] Skeletons adequados

## Critérios de aceite

- [ ] AC-PERF-001 e 002 passam
- [ ] Histórico não carrega tudo de uma vez
- [ ] Não há listeners globais redundantes evidentes

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
