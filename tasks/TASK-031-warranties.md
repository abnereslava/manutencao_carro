# TASK-031 — Implementar garantias

**Fase:** 16

## Objetivo

Implementar garantias de peça e serviço por data/KM.

## Dependências

- TASK-013
- TASK-022
- TASK-029

## Referências do SDD

- `docs/02-business-rules.md`
- `docs/09-alert-system.md`
- `docs/10-automations.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Criar/editar garantia
- [ ] Data/KM/combinada
- [ ] Estados ativa/próxima/vencida
- [ ] Contexto em peça/serviço
- [ ] Janela de 7 dias pós-vencimento

## Critérios de aceite

- [ ] AC-WAR-001 a 004 passam
- [ ] Primeiro critério atingido vence
- [ ] Expirar alerta não apaga garantia

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
