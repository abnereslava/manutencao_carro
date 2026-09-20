# TASK-011 — Implementar dispositivo confiável e cache

**Fase:** 4

## Objetivo

Selecionar cache persistente ou em memória antes de iniciar o Firestore.

## Dependências

- TASK-008
- TASK-009

## Referências do SDD

- `docs/08-ux-behavior.md`
- `docs/11-technical-architecture.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Prompt Este é um dispositivo confiável?
- [ ] Persistir escolha local
- [ ] persistentLocalCache para confiável
- [ ] memoryLocalCache para não confiável
- [ ] Auth persistence coerente
- [ ] Ação para limpar dados locais

## Critérios de aceite

- [ ] Escolha ocorre antes de leituras Firestore
- [ ] Dispositivo não confiável não usa persistência intencional entre sessões
- [ ] Logout/limpeza seguem política do SDD

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
