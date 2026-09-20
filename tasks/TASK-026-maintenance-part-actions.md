# TASK-026 — Implementar ações de peças dentro da manutenção

**Fase:** 11

## Objetivo

Permitir instalar, substituir, remover, inspecionar e reparar peças numa ocorrência.

## Dependências

- TASK-021
- TASK-025

## Referências do SDD

- `docs/06-user-flows.md`
- `docs/12-edge-cases.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Múltiplas ações de peça
- [ ] Instalar peça
- [ ] Substituir atual
- [ ] Remover sem estoque
- [ ] Peça anterior desconhecida
- [ ] Motivo livre
- [ ] Transações/consistência apropriadas

## Critérios de aceite

- [ ] AC-PART-001/002/007/008/009/012 passam
- [ ] Peça removida não vira estoque
- [ ] Substituição atualiza old/new/current corretamente

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
