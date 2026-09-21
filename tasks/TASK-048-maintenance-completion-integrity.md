# TASK-048 — Completar fluxo e integridade da conclusão de manutenção

**Status:** IN PROGRESS

**GAPs:** GAP-001, GAP-002, GAP-008, GAP-011, GAP-028

## Objetivo

Transformar a conclusão de manutenção em um fluxo completo, validado e sem classificação financeira incorreta.

## Dependências

- TASK-024
- TASK-025
- TASK-026
- TASK-029

## Referências

- `docs/02-business-rules.md`
- `docs/05-screens.md`
- `docs/06-user-flows.md`
- `docs/08-ux-behavior.md`
- `docs/14-sdd-implementation-gaps.md`

## Entregas

- [x] Data, KM retroativo, prestador e observações
- [x] Custos de peças, mão de obra e outros separados
- [x] Total calculado e override manual explícito
- [ ] Múltiplas ações de peças na mesma ocorrência
- [ ] Garantia opcional vinculada à ocorrência
- [x] Prévia do próximo ciclo antes da confirmação
- [x] Loading e bloqueio de submit duplicado
- [ ] Persistência coerente de ocorrência, plano, peças, garantia e alertas

## Critérios de aceite

- [x] Evento histórico pode ter KM menor que o odômetro atual sem alterá-lo
- [x] Total nunca é inferido integralmente como mão de obra
- [x] Próximo ciclo usa data e KM reais
- [x] Falha de persistência não produz mensagem de sucesso
- [ ] Testes de domínio, integração e E2E relevantes passam
