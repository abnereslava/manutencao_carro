# Carango Véio

Aplicação web responsiva para acompanhar manutenção, peças, documentos, quilometragem, alertas e gastos de um Renault Sandero Expression 2012 1.6 8V.

## Rodar localmente

```bash
npm install
copy .env.example .env.local
npm run dev
```

Sem `.env.local`, o app oferece um modo de demonstração persistido apenas no navegador. Com Firebase configurado, a autenticação é Google e aceita somente as identidades definidas nas Security Rules.

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:rules
npm run test:e2e
```

Os testes de regras exigem Java e Firebase Emulator Suite. Os E2E exigem os navegadores do Playwright (`npx playwright install chromium`).

## Deploy

O workflow `.github/workflows/deploy-pages.yml` publica o diretório `dist` em `/manutencao_carro/`. Cadastre as seis variáveis `VITE_FIREBASE_*` como secrets do repositório e habilite GitHub Pages com origem em GitHub Actions.

As regras do arquivo `firestore.rules` devem ser publicadas manualmente no Firebase Console. O arquivo `firestore.indexes.json` não define índices compostos na configuração atual.

## Documentação

- Especificação do produto: [`docs/`](docs/)
- Ordem de implementação: [`tasks/README.md`](tasks/README.md)
- Fontes técnicas do catálogo: [`docs/catalog-sources.md`](docs/catalog-sources.md)
- Checklist de release: [`docs/release-checklist.md`](docs/release-checklist.md)
