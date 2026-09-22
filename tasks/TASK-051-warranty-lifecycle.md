# TASK-051 — Completar ciclo de garantias

**Status:** DONE

**GAPs:** GAP-006, GAP-007

## Objetivo

Implementar cadastro, edição, vínculos, estado e alertas de garantias de peça e serviço.

## Dependências

- TASK-031
- TASK-048
- TASK-049

## Entregas

- [x] Garantia por data, KM ou combinação
- [x] Prestador, termos, URL/documento e observações
- [x] Vínculo com peça ou ocorrência
- [x] Correção de vencimento por data para `days <= 0`
- [x] Alertas e estados recalculados

## Critérios de aceite

- [x] Garantia vencida hoje aparece como vencida
- [x] Critério combinado vence pelo primeiro limite
- [x] Criação e edição persistem todos os campos
