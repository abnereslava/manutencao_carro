# Checklist de release V1

## Automatizado neste repositório

- [x] Build, typecheck, lint e testes unitários configurados
- [x] Security Rules com default deny e testes de allowlist
- [x] Rotas por `HashRouter` e base `/manutencao_carro/`
- [x] Manifest, service worker e atualização PWA por confirmação
- [x] Workflow do GitHub Pages
- [x] Funções de domínio para KM, recorrência, finanças, garantia e peça essencial
- [x] Paginação progressiva da timeline e lazy loading das rotas

## Validação manual antes da produção

- [ ] Cadastrar os seis secrets `VITE_FIREBASE_*` no GitHub
- [ ] Adicionar `abnereslava.github.io` aos domínios autorizados do Firebase Auth
- [ ] Executar os testes de Rules no Emulator
- [ ] Obter os UIDs das duas contas e migrar a allowlist de e-mail para UID
- [ ] Publicar manualmente `firestore.rules` no Firebase Console
- [ ] Instalar o PWA e testar em Android e Chrome desktop
- [ ] Validar offline em dispositivo confiável com dados previamente sincronizados
- [ ] Rodar Playwright em desktop e mobile
- [ ] Validar login permitido e negado contra o projeto Firebase real
- [ ] Validar o deploy final sem erro de rota/hash

Itens dependentes de credenciais, infraestrutura externa ou dispositivos físicos não podem ser certificados apenas pelo código local.
