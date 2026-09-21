# TASK-054 — Completar recorrência e histórico do odômetro

**Status:** TODO

**GAPs:** GAP-011, GAP-014, GAP-015

## Objetivo

Permitir corrigir e excluir leituras históricas, com data opcional e recomposição de derivados.

## Dependências

- TASK-014
- TASK-016
- TASK-018

## Entregas

- Recorrência temporal em dias, meses ou anos na UI
- Editar e excluir leituras com confirmação
- Data opcional usando o dia atual quando vazia
- Recalcular KM atual, manutenções, garantias e alertas
- Informar impactos antes de alterações históricas

## Critérios de aceite

- Nova leitura continua monotônica
- Correção histórica pode reduzir o KM atual quando aplicável
- Todos os derivados refletem a sequência corrigida
