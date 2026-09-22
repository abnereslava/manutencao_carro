# TASK-053 — Completar estornos, financeiro e dados do dashboard

**Status:** DONE

**GAPs:** GAP-010, GAP-029, GAP-030

## Objetivo

Entregar estornos e visões financeiras derivadas apenas de registros reais.

## Dependências

- TASK-030
- TASK-040
- TASK-048

## Entregas

- [x] Criar, editar e remover estorno parcial ou total
- [x] Exibir original, estornado e impacto líquido
- [x] Visões por categoria, manutenção, peça, sistema e período
- [x] Visões mensal, anual e últimos 12 meses
- [x] Remover placeholders que pareçam entidades reais

## Critérios de aceite

- [x] Estorno nunca supera o total efetivo nem cria despesa negativa
- [x] Estorno não desfaz fatos mecânicos
- [x] Dashboard vazio comunica ausência real de dados

## Validação

- [x] Build de produção
- [x] 16 testes unitários
- [x] 21 cenários E2E aprovados e 1 ignorado
- [x] Typecheck, lint e formatação
