# TASK-050 — Completar problemas, inspeções e estados de manutenção

**Status:** DONE

**GAPs:** GAP-004, GAP-005, GAP-012, GAP-013

## Objetivo

Entregar CRUD e fluxos funcionais para problemas e inspeções, incluindo pendências e abas reais.

## Dependências

- TASK-023
- TASK-028
- TASK-048

## Entregas

- [x] CRUD e transições de estado de problemas
- [x] Associação com componente, peça e manutenção corretiva
- [x] Criação e conclusão de inspeções independentes
- [x] Estado `pending` no domínio, cálculos e UI
- [x] Abas Pendentes e Inspeções com contadores reais

## Critérios de aceite

- [x] Nenhum botão de problema ou inspeção fica sem ação
- [x] Inspeção não altera peça nem reinicia ciclo de substituição
- [x] Resolução de problema exige confirmação explícita
