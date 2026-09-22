# TASK-057 — Completar filtros, rascunhos e proteção de navegação

**Status:** DONE

**GAPs:** GAP-025, GAP-026, GAP-027

## Objetivo

Preservar preferências e trabalho em andamento sem produzir efeitos de domínio antes da confirmação.

## Dependências

- TASK-037
- TASK-041
- TASK-052

## Entregas

- [x] `persistentFilters` controla busca, filtros, agrupamento, visualização e aba
- [x] Limpar filtros e restaurar padrão
- [x] Autosave em todos os formulários extensos previstos
- [x] Feedback de salvamento de rascunho
- [x] Informação de retomada segura e descarte explícito quando aplicável

## Critérios de aceite

- [x] Rascunho não gera histórico, custo, alerta nem ação de peça
- [x] Dados digitados não são perdidos silenciosamente
- [x] Preferências respeitam a configuração global

## Validação

- [x] Build de produção
- [x] 25 testes unitários
- [x] 35 cenários E2E aprovados e 1 ignorado
- [x] Typecheck, lint e formatação
