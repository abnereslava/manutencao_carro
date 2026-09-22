# TASK-056 — Completar ciclo e contexto dos alertas

**Status:** DONE

**GAPs:** GAP-020, GAP-021, GAP-022

## Objetivo

Fazer snooze, ocultação e mensagens dos alertas refletirem corretamente a causa real.

## Dependências

- TASK-033
- TASK-034
- TASK-049
- TASK-051

## Entregas

- [x] Remover snoozed da lista e badge até a data ou KM corretos
- [x] Ocultar apenas alertas permitidos, preservando rastreabilidade
- [x] Impedir snooze e ocultação de peça essencial ausente
- [x] Exibir KM, dias, critério urgente, componente e prioridade
- [x] Permitir snooze por tempo, KM ou ambos e reativação manual

## Critérios de aceite

- [x] Alerta só reaparece após snooze se a causa persistir
- [x] Agravamento material gera estado novo quando aplicável
- [x] Textos usam dados calculados disponíveis

## Validação

- [x] Build de produção
- [x] 25 testes unitários
- [x] 31 cenários E2E aprovados e 1 ignorado
- [x] Typecheck, lint e formatação
