# TASK-052 — Tornar persistência, sincronização e conflitos confiáveis

**Status:** DONE

**GAPs:** GAP-009, GAP-019, GAP-028

## Objetivo

Não confirmar sucesso antes do Firestore e preservar versões concorrentes entre as duas contas.

## Dependências

- TASK-013
- TASK-038
- TASK-039

## Entregas

- [x] API assíncrona de mutações com estados saving/synced/pending/error
- [x] Tratamento de falhas e prevenção de duplicatas
- [x] Detecção por `revision`, `updatedAt` e `updatedBy`
- [x] Comparação local/remota e resolução explícita
- [x] Preservação de rascunhos durante conflitos

## Critérios de aceite

- [x] UI só confirma sincronização após sucesso remoto
- [x] Offline não é apresentado como sincronizado
- [x] Conflitos preservam as duas versões e permitem decisão do usuário

## Validação

- [x] Build de produção
- [x] 14 testes unitários
- [x] 19 cenários E2E aprovados e 1 ignorado
- [x] Lint e formatação
