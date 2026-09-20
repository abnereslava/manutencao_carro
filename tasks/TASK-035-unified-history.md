# TASK-035 — Implementar Histórico unificado

**Fase:** 19

## Objetivo

Montar timeline derivada de todos os eventos relevantes.

## Dependências

- TASK-016
- TASK-026
- TASK-028
- TASK-030
- TASK-031
- TASK-032

## Referências do SDD

- `docs/05-screens.md`
- `docs/06-user-flows.md`
- `docs/10-automations.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Adapter de eventos
- [ ] Timeline por data
- [ ] Filtros e busca
- [ ] Paginação/cursor
- [ ] Links para origem
- [ ] Logs contextuais por componente

## Critérios de aceite

- [ ] AC-HIST-001 e 002 passam
- [ ] Cadastro retroativo entra na posição cronológica correta
- [ ] Não existe coleção NoteLog duplicada

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
