# TASK-038 — Implementar UX online/offline/sincronizando

**Fase:** 22

## Objetivo

Tornar estado de conectividade e writes pendentes compreensíveis.

## Dependências

- TASK-011
- TASK-013
- TASK-037

## Referências do SDD

- `docs/08-ux-behavior.md`
- `docs/11-technical-architecture.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] useConnectivityStatus
- [ ] Indicador Online/Offline/Sincronizando
- [ ] Detectar pendingWrites
- [ ] Feedback de sincronização
- [ ] Teste de fluxo offline no Emulator/navegador

## Critérios de aceite

- [ ] AC-OFF-001 a 004 passam
- [ ] AC-SYNC-001 passa
- [ ] Reabertura não duplica ocorrência pendente

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
