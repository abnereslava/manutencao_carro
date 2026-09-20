# TASK-039 — Implementar resolução de conflitos

**Fase:** 23

## Objetivo

Evitar sobrescrita silenciosa quando versões divergirem.

## Dependências

- TASK-013
- TASK-038

## Referências do SDD

- `docs/08-ux-behavior.md`
- `docs/11-technical-architecture.md`
- `docs/12-edge-cases.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] revision em entidades relevantes
- [ ] Detecção quando possível
- [ ] Tela local vs remota
- [ ] Metadados de autor/data
- [ ] Escolher local/remota/revisar manualmente
- [ ] Preservar rascunho

## Critérios de aceite

- [ ] AC-CONF-001 e 002 passam
- [ ] Conflito não apaga versão local automaticamente
- [ ] Usuário decide versão final

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
