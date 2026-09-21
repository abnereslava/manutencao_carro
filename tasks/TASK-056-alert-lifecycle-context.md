# TASK-056 — Completar ciclo e contexto dos alertas

**Status:** TODO

**GAPs:** GAP-020, GAP-021, GAP-022

## Objetivo

Fazer snooze, ocultação e mensagens dos alertas refletirem corretamente a causa real.

## Dependências

- TASK-033
- TASK-034
- TASK-049
- TASK-051

## Entregas

- Remover snoozed da lista e badge até a data correta
- Ocultar apenas alertas permitidos, preservando rastreabilidade
- Impedir ocultação de peça essencial ausente
- Exibir KM, dias, critério urgente, componente e prioridade

## Critérios de aceite

- Alerta só reaparece após snooze se a causa persistir
- Agravamento material pode gerar novo alerta conforme regra
- Textos usam dados calculados disponíveis
