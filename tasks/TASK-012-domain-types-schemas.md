# TASK-012 — Criar tipos de domínio e schemas Zod

**Fase:** 6

## Objetivo

Representar entidades do SDD com tipagem estrita.

## Dependências

- TASK-002

## Referências do SDD

- `docs/03-data-model.md`
- `docs/11-technical-architecture.md`

## Entregas

- [ ] Tipos Vehicle/Odometer/ComponentState/PartInstance
- [ ] Tipos MaintenancePlan/MaintenanceOccurrence/Issue
- [ ] Tipos Warranty/Document/Alert/Expense
- [ ] Enums/status centralizados
- [ ] Schemas Zod relevantes
- [ ] schemaVersion

## Critérios de aceite

- [ ] Sem any nas entidades centrais
- [ ] Tipos distinguem unknown/null quando necessário
- [ ] Valores monetários são centavos inteiros

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
