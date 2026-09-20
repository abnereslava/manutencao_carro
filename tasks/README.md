# Carango Véio — Tasks de Implementação

Este diretório transforma o SDD em unidades executáveis de trabalho.

## Como usar

1. Executar as tasks na ordem das dependências, não apenas pelo número.
2. Ler os documentos do SDD citados em cada task.
3. Implementar apenas o escopo da task atual, salvo dependência técnica inevitável.
4. Rodar testes, lint, typecheck e build aplicáveis antes de concluir.
5. Não alterar uma regra do produto para facilitar implementação; atualizar o SDD primeiro se uma decisão realmente mudar.

## Status sugerido

Cada agente pode usar no acompanhamento:

- `TODO`
- `IN PROGRESS`
- `BLOCKED`
- `DONE`

Os arquivos não precisam ser renomeados para refletir status.

## Ordem

- [ ] [TASK-001 — Inicializar React + TypeScript + Vite](./TASK-001-project-bootstrap.md) — Fase 0
- [ ] [TASK-002 — Configurar lint, format e testes base](./TASK-002-quality-tooling.md) — Fase 0 — depende de TASK-001
- [ ] [TASK-003 — Configurar Tailwind e design tokens](./TASK-003-tailwind-design-tokens.md) — Fase 1 — depende de TASK-001
- [ ] [TASK-004 — Implementar tema Claro/Escuro/Sistema](./TASK-004-theme-system.md) — Fase 1 — depende de TASK-003
- [ ] [TASK-005 — Criar componentes base de UI](./TASK-005-ui-primitives.md) — Fase 1 — depende de TASK-003, TASK-004
- [ ] [TASK-006 — Criar shell responsivo desktop/mobile](./TASK-006-responsive-app-shell.md) — Fase 2 — depende de TASK-005
- [ ] [TASK-007 — Configurar rotas com HashRouter](./TASK-007-routing.md) — Fase 2 — depende de TASK-006
- [ ] [TASK-008 — Preparar integração Firebase e Emulator](./TASK-008-firebase-bootstrap.md) — Fase 3 — depende de TASK-002, TASK-007
- [ ] [TASK-009 — Implementar autenticação Google](./TASK-009-google-auth.md) — Fase 3 — depende de TASK-008
- [ ] [TASK-010 — Implementar Rules e testes de allowlist](./TASK-010-firestore-security-rules.md) — Fase 3 — depende de TASK-008, TASK-009
- [ ] [TASK-011 — Implementar dispositivo confiável e cache](./TASK-011-trusted-device-cache.md) — Fase 4 — depende de TASK-008, TASK-009
- [ ] [TASK-012 — Criar tipos de domínio e schemas Zod](./TASK-012-domain-types-schemas.md) — Fase 6 — depende de TASK-002
- [ ] [TASK-013 — Criar converters e repositories Firestore](./TASK-013-firestore-repositories.md) — Fase 6 — depende de TASK-008, TASK-012
- [ ] [TASK-014 — Implementar domínio de quilometragem](./TASK-014-odometer-domain.md) — Fase 5 — depende de TASK-012
- [ ] [TASK-015 — Implementar tela Veículo](./TASK-015-vehicle-screen.md) — Fase 7 — depende de TASK-006, TASK-007, TASK-012, TASK-013
- [ ] [TASK-016 — Implementar atualização e histórico de KM](./TASK-016-odometer-ui.md) — Fase 7 — depende de TASK-014, TASK-015
- [ ] [TASK-017 — Criar catálogo hardcoded de posições](./TASK-017-vehicle-position-catalog.md) — Fase 8 — depende de TASK-012
- [ ] [TASK-018 — Construir catálogo estrutural do Sandero](./TASK-018-sandero-component-catalog.md) — Fase 8 — depende de TASK-017
- [ ] [TASK-019 — Implementar Hub de Peças](./TASK-019-parts-hub.md) — Fase 9 — depende de TASK-013, TASK-018
- [ ] [TASK-020 — Implementar detalhe e estado de componente](./TASK-020-component-detail-state.md) — Fase 9 — depende de TASK-019
- [ ] [TASK-021 — Implementar detalhe e dados de PartInstance](./TASK-021-part-detail-install-data.md) — Fase 9 — depende de TASK-018, TASK-020
- [ ] [TASK-022 — Implementar domínio de manutenção e recorrência](./TASK-022-maintenance-domain.md) — Fase 5 — depende de TASK-012, TASK-014
- [ ] [TASK-023 — Implementar telas e filtros de Manutenções](./TASK-023-maintenance-lists.md) — Fase 10 — depende de TASK-013, TASK-022
- [ ] [TASK-024 — Implementar criação e edição de plano de manutenção](./TASK-024-maintenance-create-edit.md) — Fase 10 — depende de TASK-023
- [ ] [TASK-025 — Implementar conclusão de manutenção](./TASK-025-maintenance-completion.md) — Fase 10 — depende de TASK-024
- [ ] [TASK-026 — Implementar ações de peças dentro da manutenção](./TASK-026-maintenance-part-actions.md) — Fase 11 — depende de TASK-021, TASK-025
- [ ] [TASK-027 — Implementar Peça faltando essencial](./TASK-027-missing-essential-part.md) — Fase 12 — depende de TASK-026
- [ ] [TASK-028 — Implementar inspeções e problemas](./TASK-028-inspections-and-issues.md) — Fase 13 — depende de TASK-023, TASK-025
- [ ] [TASK-029 — Implementar domínio financeiro](./TASK-029-expense-domain.md) — Fase 5 — depende de TASK-012
- [ ] [TASK-030 — Implementar Gastos e Estornos](./TASK-030-expenses-and-refunds-ui.md) — Fase 14-15 — depende de TASK-025, TASK-029
- [ ] [TASK-031 — Implementar garantias](./TASK-031-warranties.md) — Fase 16 — depende de TASK-013, TASK-022, TASK-029
- [ ] [TASK-032 — Implementar módulo Documentos](./TASK-032-documents.md) — Fase 17 — depende de TASK-013
- [ ] [TASK-033 — Implementar motor de alertas](./TASK-033-alert-engine.md) — Fase 18 — depende de TASK-022, TASK-027, TASK-028, TASK-031, TASK-032
- [ ] [TASK-034 — Implementar Central de Alertas](./TASK-034-alert-center.md) — Fase 18 — depende de TASK-033
- [ ] [TASK-035 — Implementar Histórico unificado](./TASK-035-unified-history.md) — Fase 19 — depende de TASK-016, TASK-026, TASK-028, TASK-030, TASK-031, TASK-032
- [ ] [TASK-036 — Implementar edição histórica, dependências e rollback](./TASK-036-history-edit-rollback.md) — Fase 20 — depende de TASK-026, TASK-035
- [ ] [TASK-037 — Implementar autosave e restauração de rascunhos](./TASK-037-draft-autosave.md) — Fase 21 — depende de TASK-024, TASK-025, TASK-028, TASK-032
- [ ] [TASK-038 — Implementar UX online/offline/sincronizando](./TASK-038-offline-sync-ux.md) — Fase 22 — depende de TASK-011, TASK-013, TASK-037
- [ ] [TASK-039 — Implementar resolução de conflitos](./TASK-039-edit-conflicts.md) — Fase 23 — depende de TASK-013, TASK-038
- [ ] [TASK-040 — Implementar Dashboard final](./TASK-040-final-dashboard.md) — Fase 24 — depende de TASK-030, TASK-031, TASK-032, TASK-034
- [ ] [TASK-041 — Implementar Configurações](./TASK-041-settings.md) — Fase 25 — depende de TASK-004, TASK-011, TASK-019, TASK-033
- [ ] [TASK-042 — Configurar PWA instalável](./TASK-042-pwa.md) — Fase 26 — depende de TASK-003, TASK-007, TASK-037, TASK-038
- [ ] [TASK-043 — Configurar deploy GitHub Pages](./TASK-043-github-pages-deploy.md) — Fase 27 — depende de TASK-007, TASK-008, TASK-042
- [ ] [TASK-044 — Criar testes E2E críticos](./TASK-044-critical-e2e.md) — Fase 29 — depende de TASK-027, TASK-033, TASK-036, TASK-043
- [ ] [TASK-045 — Revisar acessibilidade](./TASK-045-accessibility-review.md) — Fase 31 — depende de TASK-040, TASK-041
- [ ] [TASK-046 — Revisar performance e consultas](./TASK-046-performance-review.md) — Fase 32 — depende de TASK-035, TASK-040, TASK-043
- [ ] [TASK-047 — Validar SDD e preparar release V1](./TASK-047-final-sdd-validation.md) — Fase 33-34 — depende de TASK-044, TASK-045, TASK-046

## Regra de conclusão

Uma task só está concluída quando:

- implementação existe;
- critérios de aceite passam;
- testes relevantes passam;
- build/typecheck permanecem saudáveis;
- nenhuma regra do SDD foi silenciosamente ignorada.
