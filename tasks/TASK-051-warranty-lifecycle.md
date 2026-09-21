# TASK-051 — Completar ciclo de garantias

**Status:** TODO

**GAPs:** GAP-006, GAP-007

## Objetivo

Implementar cadastro, edição, vínculos, estado e alertas de garantias de peça e serviço.

## Dependências

- TASK-031
- TASK-048
- TASK-049

## Entregas

- Garantia por data, KM ou combinação
- Prestador, termos, URL/documento e observações
- Vínculo com peça ou ocorrência
- Correção de vencimento por data para `days <= 0`
- Alertas e estados recalculados

## Critérios de aceite

- Garantia vencida hoje aparece como vencida
- Critério combinado vence pelo primeiro limite
- Criação e edição persistem todos os campos
