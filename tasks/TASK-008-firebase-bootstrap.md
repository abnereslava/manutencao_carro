# TASK-008 — Preparar integração Firebase e Emulator

**Fase:** 3

## Objetivo

Adicionar infraestrutura Firebase sem incluir segredos.

## Dependências

- TASK-002
- TASK-007

## Referências do SDD

- `docs/11-technical-architecture.md`

## Entregas

- [ ] Instalar Firebase SDK
- [ ] Criar módulo de configuração
- [ ] Criar .env.example VITE_FIREBASE_*
- [ ] Adicionar firebase.json/firestore.rules/firestore.indexes.json
- [ ] Configurar Emulator Suite

## Critérios de aceite

- [ ] Projeto compila sem valores reais
- [ ] Emulator pode ser iniciado após configuração local
- [ ] Nenhuma credencial privada é versionada

## Regras de execução

- Ler as referências do SDD antes de alterar código.
- Não inventar requisitos ausentes.
- Preservar funcionalidades já concluídas.
- Adicionar ou atualizar testes quando esta task tocar regra crítica.
- Não marcar esta task como concluída enquanto os critérios acima não passarem.
