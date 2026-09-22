# Checklist de release V1

## Automatizado neste repositório

- [x] Build, typecheck, lint e testes unitários configurados
- [x] Security Rules com default deny e testes de allowlist
- [x] Rotas por `HashRouter` e base `/manutencao_carro/`
- [x] Manifest, service worker e atualização PWA por confirmação
- [x] Workflow do GitHub Pages
- [x] Workflow bloqueia o deploy se formatação, lint, typecheck, unitários, Rules ou E2E falharem
- [x] Funções de domínio para KM, recorrência, finanças, garantia e peça essencial
- [x] Paginação progressiva da timeline e lazy loading das rotas

## Validação manual antes da produção

- [ ] Cadastrar os seis secrets `VITE_FIREBASE_*` no GitHub
- [ ] Adicionar `abnereslava.github.io` aos domínios autorizados do Firebase Auth
- [x] Executar os testes de Rules no Emulator
- [ ] Obter os UIDs das duas contas e migrar a allowlist de e-mail para UID
- [x] Publicar manualmente `firestore.rules` no Firebase Console (confirmado pelo responsável)
- [ ] Instalar o PWA e testar em Android e Chrome desktop
- [ ] Validar offline em dispositivo confiável com dados previamente sincronizados
- [x] Rodar Playwright em desktop e mobile
- [ ] Validar login permitido e negado contra o projeto Firebase real
- [ ] Validar o deploy final sem erro de rota/hash

Itens dependentes de credenciais, infraestrutura externa ou dispositivos físicos não podem ser certificados apenas pelo código local.

## Evidência da regressão final — 22/09/2026

- `npm run format:check`, `npm run lint`, `npm run typecheck` e `npm run build`: aprovados.
- Vitest: 36 testes unitários aprovados em 3 arquivos.
- Firestore Emulator: 4 testes de Rules aprovados.
- Playwright: 35 cenários aprovados em Chromium desktop/mobile e 1 cenário mobile não aplicável no desktop, conforme a condição do próprio teste.
- Auditoria estática: nenhum link `#`, callback vazio, `console.log`, marcador `TODO/FIXME` executável ou botão sem destino foi encontrado em `src/`.

Os itens ainda desmarcados são validações externas: configuração restante do projeto Firebase/GitHub, migração da allowlist, instalação em aparelho real, autenticação real e conferência do deploy publicado.
