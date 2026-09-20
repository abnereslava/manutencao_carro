# TASK-045 — Revisar acessibilidade

**Fase:** 31

## Objetivo

Validar teclado, foco, contraste e interação touch.

## Dependências

- TASK-040
- TASK-041

## Referências do SDD

- `docs/07-design-system.md`
- `docs/08-ux-behavior.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Auditar labels/aria
- [ ] Focus trap em modal
- [ ] Retorno de foco
- [ ] Navegação teclado
- [ ] Touch targets
- [ ] Contraste claro/escuro
- [ ] Status não apenas por cor

## Critérios de aceite

- [ ] AC-A11Y-001 passa
- [ ] Fluxos principais funcionam sem mouse no desktop
- [ ] Nenhum modal prende foco incorretamente

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
