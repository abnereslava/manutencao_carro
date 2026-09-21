# TASK-050 — Completar problemas, inspeções e estados de manutenção

**Status:** TODO

**GAPs:** GAP-004, GAP-005, GAP-012, GAP-013

## Objetivo

Entregar CRUD e fluxos funcionais para problemas e inspeções, incluindo pendências e abas reais.

## Dependências

- TASK-023
- TASK-028
- TASK-048

## Entregas

- CRUD e transições de estado de problemas
- Associação com componente, peça e manutenção corretiva
- Criação e conclusão de inspeções independentes
- Estado `pending` no domínio, cálculos e UI
- Abas Pendentes e Inspeções com contadores reais

## Critérios de aceite

- Nenhum botão de problema ou inspeção fica sem ação
- Inspeção não altera peça nem reinicia ciclo de substituição
- Resolução de problema exige confirmação explícita
