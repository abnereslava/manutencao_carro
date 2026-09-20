# TASK-043 — Configurar deploy GitHub Pages

**Fase:** 27

## Objetivo

Publicar automaticamente a aplicação em /manutencao_carro/.

## Dependências

- TASK-007
- TASK-008
- TASK-042

## Referências do SDD

- `docs/11-technical-architecture.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] vite base correto
- [ ] Workflow GitHub Actions
- [ ] Build/typecheck/test no CI
- [ ] Pages artifact/deploy
- [ ] Injeção de VITE_FIREBASE_*

## Critérios de aceite

- [ ] AC-DEP-001 e 002 passam
- [ ] Push em main executa pipeline
- [ ] Rotas hash funcionam após reload

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
