# TASK-009 — Implementar autenticação Google

**Fase:** 3

## Objetivo

Permitir entrada somente com Google e proteger rotas.

## Dependências

- TASK-008

## Referências do SDD

- `docs/00-overview.md`
- `docs/01-functional-requirements.md`
- `docs/11-technical-architecture.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] AuthProvider
- [ ] signInWithPopup
- [ ] Tela de login
- [ ] ProtectedRoute
- [ ] Logout
- [ ] Estado de loading de sessão

## Critérios de aceite

- [ ] Conta autenticada chega ao app
- [ ] Não autenticado não acessa rotas privadas
- [ ] Erros técnicos são traduzidos para UX

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
