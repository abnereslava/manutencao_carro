# TASK-008 — Preparar integração Firebase e Emulator

**Fase:** 3

## Objetivo

Integrar ao código o projeto Firebase **já existente** `appcarro-d3c92`, sem criar outro projeto e sem incluir credenciais administrativas.

## Dependências

- TASK-002
- TASK-007

## Referências do SDD

- `docs/11-technical-architecture.md`

## Estado externo já concluído

- Projeto Firebase criado: `appcarro-d3c92`
- Web App criada
- Cloud Firestore criado
- `.env.example`, `.firebaserc`, `firebase.json`, `firestore.rules` e `firestore.indexes.json` já versionados

## Entregas

- [ ] Instalar Firebase SDK
- [ ] Criar módulo de configuração
- [ ] Consumir as variáveis VITE_FIREBASE_* já documentadas em `.env.example`
- [ ] Validar e integrar os arquivos Firebase já existentes
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
