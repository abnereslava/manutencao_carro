# TASK-049 — Implementar ciclo operacional completo de peças

**Status:** DONE

**GAPs:** GAP-003, GAP-023, GAP-024

## Objetivo

Permitir operar peças pelo Hub e pelas manutenções, preservando estado atual e histórico.

## Dependências

- TASK-021
- TASK-026
- TASK-048

## Entregas

- [x] Instalar, substituir, remover, descartar, inspecionar, reparar e editar peça
- [x] Marcar e desfazer `notApplicable`
- [x] Atualizar `ComponentState.currentPartInstanceId` de forma consistente
- [x] Exibir indicadores derivados sem inventar valores ausentes
- [x] Busca e filtros completos conforme SDD

## Critérios de aceite

- [x] Substituição atualiza peça antiga, nova e componente atomicamente
- [x] Remoção de peça essencial produz estado `missing`
- [x] Histórico permanece rastreável
- [x] Testes cobrem todas as transições de peça
