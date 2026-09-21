# TASK-049 — Implementar ciclo operacional completo de peças

**Status:** TODO

**GAPs:** GAP-003, GAP-023, GAP-024

## Objetivo

Permitir operar peças pelo Hub e pelas manutenções, preservando estado atual e histórico.

## Dependências

- TASK-021
- TASK-026
- TASK-048

## Entregas

- Instalar, substituir, remover, descartar, inspecionar, reparar e editar peça
- Marcar e desfazer `notApplicable`
- Atualizar `ComponentState.currentPartInstanceId` de forma consistente
- Exibir indicadores derivados sem inventar valores ausentes
- Busca e filtros completos conforme SDD

## Critérios de aceite

- Substituição atualiza peça antiga, nova e componente atomicamente
- Remoção de peça essencial produz estado `missing`
- Histórico permanece rastreável
- Testes cobrem todas as transições de peça
