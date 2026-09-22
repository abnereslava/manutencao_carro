# TASK-054 — Completar recorrência e histórico do odômetro

**Status:** DONE

**GAPs:** GAP-011, GAP-014, GAP-015

## Objetivo

Permitir corrigir e excluir leituras históricas, com data opcional e recomposição de derivados.

## Dependências

- TASK-014
- TASK-016
- TASK-018

## Entregas

- [x] Recorrência temporal em dias, meses ou anos na UI
- [x] Editar e excluir leituras com confirmação
- [x] Data opcional usando o dia atual quando vazia
- [x] Recalcular KM atual, manutenções, garantias e alertas
- [x] Informar impactos antes de alterações históricas

## Critérios de aceite

- [x] Nova leitura continua monotônica
- [x] Correção histórica pode reduzir o KM atual quando aplicável
- [x] Todos os derivados refletem a sequência corrigida

## Validação

- [x] Build de produção
- [x] 20 testes unitários
- [x] 25 cenários E2E aprovados e 1 ignorado
- [x] Typecheck, lint e formatação
