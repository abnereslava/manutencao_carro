# TASK-052 — Tornar persistência, sincronização e conflitos confiáveis

**Status:** TODO

**GAPs:** GAP-009, GAP-019, GAP-028

## Objetivo

Não confirmar sucesso antes do Firestore e preservar versões concorrentes entre as duas contas.

## Dependências

- TASK-013
- TASK-038
- TASK-039

## Entregas

- API assíncrona de mutações com estados saving/synced/pending/error
- Tratamento de falhas e prevenção de duplicatas
- Detecção por `revision`, `updatedAt` e `updatedBy`
- Comparação local/remota e resolução explícita
- Preservação de rascunhos durante conflitos

## Critérios de aceite

- UI só confirma sincronização após sucesso remoto
- Offline não é apresentado como sincronizado
- Conflitos preservam as duas versões e permitem decisão do usuário
