# TASK-037 — Implementar autosave e restauração de rascunhos

**Fase:** 21

## Objetivo

Evitar perda de formulários complexos.

## Dependências

- TASK-024
- TASK-025
- TASK-028
- TASK-032

## Referências do SDD

- `docs/08-ux-behavior.md`
- `docs/13-acceptance-criteria.md`

## Entregas

- [ ] Draft service
- [ ] Debounce
- [ ] Salvar ao trocar campo quando útil
- [ ] IndexedDB em confiável
- [ ] Memória/session em não confiável
- [ ] Retomar/descartar
- [ ] Aviso de saída

## Critérios de aceite

- [ ] AC-DRF-001 a 003 passam
- [ ] Rascunho nunca vira registro definitivo sozinho
- [ ] Erro de save não limpa formulário

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
