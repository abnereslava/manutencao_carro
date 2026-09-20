# TASK-042 — Configurar PWA instalável

**Fase:** 26

## Objetivo

Tornar o app instalável sem duplicar cache privado do Firestore.

## Dependências

- TASK-003
- TASK-007
- TASK-037
- TASK-038

## Referências do SDD

- `docs/07-design-system.md`
- `docs/11-technical-architecture.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] vite-plugin-pwa
- [ ] Manifest
- [ ] Ícones 192/512/maskable
- [ ] Favicon
- [ ] Precache do app shell
- [ ] Prompt de atualização
- [ ] Proteção de rascunho antes de update

## Critérios de aceite

- [ ] AC-PWA-001 e 002 passam
- [ ] Service worker não cacheia dados privados Firestore/Auth
- [ ] Instala no Android e Chrome desktop

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
