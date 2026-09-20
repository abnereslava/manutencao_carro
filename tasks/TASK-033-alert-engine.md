# TASK-033 — Implementar motor de alertas

**Fase:** 18

## Objetivo

Derivar alertas e seus estados a partir das fontes.

## Dependências

- TASK-022
- TASK-027
- TASK-028
- TASK-031
- TASK-032

## Referências do SDD

- `docs/09-alert-system.md`
- `docs/10-automations.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Alertas por KM/data/combinados
- [ ] Atraso em KM/dias
- [ ] Prioridade semântica
- [ ] Seen
- [ ] Snooze tempo/KM
- [ ] Hide/resolve/expire
- [ ] Reaparecimento e resolução automática

## Critérios de aceite

- [ ] AC-ALT-001 a 010 passam em domínio/integração
- [ ] Peça essencial sempre tem prioridade máxima
- [ ] Causa resolvida encerra snooze pendente

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
