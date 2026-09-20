# TASK-014 — Implementar domínio de quilometragem

**Fase:** 5

## Objetivo

Implementar validações e derivados de odômetro como funções puras.

## Dependências

- TASK-012

## Referências do SDD

- `docs/02-business-rules.md`
- `docs/10-automations.md`
- `docs/12-edge-cases.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Validar nova leitura não regressiva
- [ ] Obter leitura atual
- [ ] Ordenar histórico
- [ ] Suportar edição/exclusão histórica
- [ ] Testes unitários

## Critérios de aceite

- [ ] AC-ODO-001 a AC-ODO-004 passam em domínio
- [ ] Nova leitura regressiva é rejeitada
- [ ] Registro histórico pode usar KM menor que o atual

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
