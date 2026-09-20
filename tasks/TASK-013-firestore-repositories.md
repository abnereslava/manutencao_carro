# TASK-013 — Criar converters e repositories Firestore

**Fase:** 6

## Objetivo

Isolar acesso ao Firestore da UI.

## Dependências

- TASK-008
- TASK-012

## Referências do SDD

- `docs/03-data-model.md`
- `docs/11-technical-architecture.md`

## Entregas

- [ ] Firestore converters
- [ ] VehicleRepository
- [ ] OdometerRepository
- [ ] MaintenanceRepository
- [ ] PartRepository
- [ ] IssueRepository
- [ ] DocumentRepository
- [ ] AlertRepository
- [ ] Audit helpers

## Critérios de aceite

- [ ] UI não monta paths Firestore diretamente
- [ ] CRUD básico funciona no Emulator
- [ ] createdAt/updatedAt/by são tratados de forma consistente

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
