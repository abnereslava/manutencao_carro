# TASK-057 — Completar filtros, rascunhos e proteção de navegação

**Status:** TODO

**GAPs:** GAP-025, GAP-026, GAP-027

## Objetivo

Preservar preferências e trabalho em andamento sem produzir efeitos de domínio antes da confirmação.

## Dependências

- TASK-037
- TASK-041
- TASK-052

## Entregas

- `persistentFilters` controla busca, filtros, ordenação, visualização e aba
- Limpar filtros e restaurar padrão
- Autosave em todos os formulários extensos previstos
- Feedback de salvamento de rascunho
- Aviso de saída ou informação de retomada segura

## Critérios de aceite

- Rascunho não gera histórico, custo, alerta nem ação de peça
- Dados digitados não são perdidos silenciosamente
- Preferências respeitam a configuração global
