# TASK-029 — Implementar domínio financeiro

**Fase:** 5

## Objetivo

Implementar cálculos financeiros em centavos.

## Dependências

- TASK-012

## Referências do SDD

- `docs/02-business-rules.md`
- `docs/10-automations.md`
- `docs/12-edge-cases.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Soma de peças/mão de obra/outros
- [ ] Override manual
- [ ] effectiveTotal
- [ ] gross/refunded/net
- [ ] Estorno parcial/total
- [ ] Agregações por período/categoria/sistema/componente

## Critérios de aceite

- [ ] AC-EXP-001 a 003 passam
- [ ] AC-REF-001 a 006 passam em domínio
- [ ] Nenhum cálculo monetário depende de float

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
