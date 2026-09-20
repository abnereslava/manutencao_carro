# Carango Véio — Arquitetura Técnica

## 1. Objetivo

Este documento define a arquitetura técnica inicial do Carango Véio.

A arquitetura deverá atender:

- web desktop e mobile;
- PWA instalável;
- funcionamento online e offline;
- autenticação Google;
- Firestore;
- deploy pelo GitHub Pages;
- regras de segurança restritivas;
- manutenção simples;
- testabilidade das regras de negócio;
- possibilidade futura de expansão sem implementar multiveículo ou multiusuário agora.

---

# 2. Stack principal

## Frontend

- React
- TypeScript
- Vite

## Persistência e autenticação

- Firebase Authentication
- Cloud Firestore

## Deploy

- GitHub Pages
- GitHub Actions

## PWA

- vite-plugin-pwa
- Workbox

## UI

- Tailwind CSS
- componentes próprios
- primitives acessíveis quando necessário
- Lucide para ícones

## Formulários e validação

- React Hook Form
- Zod

## Roteamento

- React Router
- HashRouter

## Testes críticos

- Vitest
- React Testing Library
- Firebase Emulator Suite / rules-unit-testing
- Playwright para poucos fluxos E2E críticos

---

# 3. Princípio arquitetural

A aplicação deverá ser dividida em três camadas principais:

```text
UI / Presentation
        ↓
Domain / Business Rules
        ↓
Data / Firebase
```

## 3.1 UI / Presentation

Responsável por:

- telas;
- formulários;
- navegação;
- feedback;
- tema;
- modais;
- collapses;
- toasts.

Não deverá conter regras de negócio importantes espalhadas pelos componentes.

## 3.2 Domain / Business Rules

Responsável por:

- cálculo de vencimento;
- cálculo de recorrência;
- estados;
- transições de peça;
- garantia;
- custos;
- alertas;
- validações de consistência.

Essa camada deverá ser implementada principalmente com funções TypeScript puras e testáveis.

## 3.3 Data / Firebase

Responsável por:

- leitura;
- escrita;
- sincronização;
- cache offline;
- mapeamento Firestore;
- autenticação;
- regras de acesso.

---

# 4. Estrutura de projeto sugerida

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   ├── providers/
│   └── bootstrap/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── feedback/
│   └── forms/
│
├── features/
│   ├── dashboard/
│   ├── maintenance/
│   ├── parts/
│   ├── history/
│   ├── expenses/
│   ├── documents/
│   ├── vehicle/
│   ├── alerts/
│   └── settings/
│
├── domain/
│   ├── maintenance/
│   ├── parts/
│   ├── alerts/
│   ├── warranty/
│   ├── expenses/
│   └── odometer/
│
├── data/
│   ├── firebase/
│   ├── repositories/
│   ├── converters/
│   └── migrations/
│
├── catalog/
│   ├── components/
│   ├── positions/
│   └── technical-fields/
│
├── hooks/
├── lib/
├── types/
├── utils/
└── styles/
```

---

# 5. Organização por feature

Cada área principal deverá concentrar sua UI e lógica específica.

Exemplo:

```text
features/maintenance/
├── components/
├── pages/
├── forms/
├── hooks/
└── types.ts
```

Regras reutilizáveis ou críticas não deverão permanecer dentro da feature quando pertencerem ao domínio.

Exemplo:

```text
domain/maintenance/calculateMaintenanceState.ts
```

---

# 6. Catálogo hardcoded

O catálogo do Sandero não deverá ser armazenado como cadastro editável no Firestore.

Deverá existir em código versionado.

Estrutura sugerida:

```text
src/catalog/
├── components/
│   └── sandero-expression-2012-1.6-8v.ts
├── positions/
│   └── vehicle-positions.ts
└── technical-fields/
    └── component-technical-fields.ts
```

## Benefícios

- versionamento;
- revisão em pull request;
- integridade;
- busca rápida;
- sem risco de alteração acidental pela interface.

---

# 7. Firebase Authentication

## 7.1 Provedor

Somente Google.

## 7.2 Contas autorizadas

O projeto deverá permitir somente as duas identidades aprovadas no SDD.

## 7.3 Segurança real

A checagem de acesso na interface é apenas UX.

A autorização real deverá ocorrer nas Firestore Security Rules.

---

# 8. Fluxo de autenticação em GitHub Pages

Como o app será hospedado fora do Firebase Hosting, a estratégia inicial deverá usar:

`signInWithPopup()`

para Google Sign-In.

Isso evita depender do fluxo de redirect cross-origin do Firebase Hosting em navegadores que restringem armazenamento de terceiros.

## 8.1 Domínio autorizado

Após configurar o Firebase, adicionar o domínio do GitHub Pages aos Authorized Domains.

Produção esperada:

`abnereslava.github.io`

## 8.2 Fallback

Se futuramente o popup apresentar incompatibilidade relevante em algum ambiente, poderá ser avaliado:

- fluxo Google Identity Services + signInWithCredential;
- self-host dos helpers de autenticação;
- outra estratégia documentada separadamente.

Não implementar complexidade adicional antecipadamente.

---

# 9. Persistência da sessão

A persistência de autenticação deverá depender da confiança no dispositivo.

## Dispositivo confiável

Usar persistência local de autenticação.

Objetivo:

- manter sessão entre aberturas;
- permitir reabertura do PWA sem novo login quando a sessão ainda for válida.

## Dispositivo não confiável

Usar persistência de sessão.

Objetivo:

- não manter login indefinidamente após encerrar a sessão do navegador.

---

# 10. Pergunta de dispositivo confiável

No primeiro login válido naquele navegador:

> Este é um dispositivo confiável?

Opções:

- Sim
- Não

A escolha deverá ser salva localmente no navegador.

## Configurações

Deverá existir opção para:

- alterar a preferência;
- remover dados offline deste dispositivo.

---

# 11. Firestore offline — dispositivo confiável

Quando marcado como confiável, inicializar Firestore com cache persistente local.

Estratégia:

```text
persistentLocalCache
+
persistentMultipleTabManager
```

Objetivo:

- leitura offline;
- escrita offline;
- sincronização posterior;
- suporte consistente entre abas compatíveis.

---

# 12. Firestore offline — dispositivo não confiável

Quando marcado como não confiável:

```text
memoryLocalCache
```

Os dados poderão ser usados durante a sessão, mas não deverão ser intencionalmente persistidos pelo Firestore entre sessões.

---

# 13. Ordem de bootstrap

A escolha de cache do Firestore deverá acontecer antes de iniciar leituras de dados.

Fluxo conceitual:

```text
Inicializar Firebase App
        ↓
Inicializar Auth
        ↓
Restaurar / realizar login
        ↓
Validar usuário autorizado
        ↓
Resolver confiança do dispositivo
        ↓
Inicializar Firestore
        ↓
persistentLocalCache
OU
memoryLocalCache
        ↓
Carregar aplicação
```

---

# 14. Dados sensíveis no cache local

O cache persistente contém dados reais do Firestore.

Por isso:

- só habilitar após confirmação de dispositivo confiável;
- não habilitar automaticamente em todo navegador;
- disponibilizar ação para limpar dados locais;
- não usar service worker para duplicar o cache de dados do Firestore.

---

# 15. Logout

Ao selecionar `Sair`:

1. encerrar sessão Firebase Auth;
2. limpar estado sensível em memória;
3. encerrar listeners;
4. oferecer/remover dados locais persistidos conforme política definida abaixo.

## Política padrão recomendada

Logout explícito deverá remover o cache persistente local do Firestore naquele dispositivo.

Fechar o app sem fazer logout não deverá apagar o cache em dispositivo confiável.

---

# 16. Modo offline

O app deverá permitir, em dispositivo confiável e com dados previamente sincronizados:

- abrir dados já carregados;
- consultar histórico disponível em cache;
- editar registros;
- criar registros;
- concluir ações suportadas;
- enfileirar writes para sincronização.

## Limitação

Conteúdo nunca sincronizado naquele dispositivo pode não estar disponível offline.

A interface deverá distinguir:

- Online
- Offline
- Sincronizando

---

# 17. Writes offline

O Firestore deverá gerenciar a fila local de writes.

Quando a rede retornar:

```text
writes pendentes
    ↓
sincronização
    ↓
listeners recebem estado final
```

A UI deverá indicar quando houver alterações ainda não confirmadas pelo servidor.

---

# 18. Conflitos

O Firestore possui comportamento de resolução no backend, mas o Carango Véio não deverá depender silenciosamente disso para UX.

Cada entidade mutável relevante deverá possuir:

- `updatedAt`;
- `updatedBy`;
- `revision` quando útil.

## Estratégia

Quando tecnicamente possível:

- comparar revisão conhecida;
- detectar alteração remota;
- avisar antes de sobrescrever.

## Offline

Conflitos gerados entre dois dispositivos offline poderão ser detectados somente na reconexão.

A V1 deverá priorizar:

- não perder rascunho;
- informar conflito quando detectável;
- permitir recarregar/revisar.

---

# 19. Firestore — estrutura sugerida

Estrutura conceitual:

```text
appSettings/
└── default

vehicles/
└── sandero
    ├── odometerRecords/
    ├── componentStates/
    ├── parts/
    ├── maintenancePlans/
    ├── maintenanceOccurrences/
    ├── issues/
    ├── warranties/
    ├── documents/
    └── alertStates/
```

---

# 20. Documento do veículo

ID inicial sugerido:

`sandero`

A interface não deverá depender desse nome diretamente.

Criar uma constante de configuração:

```ts
ACTIVE_VEHICLE_ID
```

Assim uma expansão futura poderá substituir essa lógica.

---

# 21. ComponentDefinitions

Não criar:

```text
vehicles/sandero/componentDefinitions
```

como fonte principal.

As definições estruturais vêm do código.

O Firestore guarda apenas:

- estado;
- histórico;
- dados inseridos pelo usuário.

---

# 22. MaintenanceOccurrence

Dados que pertencem diretamente à ocorrência poderão ser armazenados juntos quando isso reduzir complexidade.

Exemplo:

```text
maintenanceOccurrences/{id}
{
  ...
  expenseBreakdown: {...}
}
```

Não é obrigatório criar coleção independente para todo objeto conceitual descrito no modelo de dados.

O modelo Firestore deverá otimizar:

- leituras;
- consistência;
- simplicidade.

---

# 23. Denormalização controlada

Firestore poderá usar campos derivados persistidos para melhorar consultas.

Exemplos:

- status;
- nextDueDate;
- nextDueKm;
- system;
- componentNameSnapshot.

## Regra

Todo campo derivado deverá poder ser recalculado.

---

# 24. Snapshots históricos

Eventos históricos deverão guardar snapshots mínimos de nomes relevantes.

Exemplo:

```text
componentNameSnapshot
partNameSnapshot
maintenanceTitleSnapshot
```

Isso evita que uma alteração futura de label torne o histórico incompreensível.

IDs relacionais continuam sendo preservados.

---

# 25. Server timestamps

Para auditoria online, usar `serverTimestamp()` quando apropriado.

Campos:

- createdAt;
- updatedAt;
- archivedAt.

## Offline

Enquanto o servidor ainda não confirmar, a UI poderá usar timestamp local provisório.

---

# 26. Security Rules — princípio

Política:

```text
DEFAULT DENY
```

Nenhuma coleção deverá ficar pública.

---

# 27. Security Rules — allowlist

Após o primeiro login das duas contas, coletar seus Firebase Auth UIDs.

Produção deverá usar allowlist de UID.

Exemplo conceitual:

```text
isAllowedUser =
  request.auth != null
  AND
  request.auth.uid está na allowlist
```

## Regra

Não armazenar a allowlist editável dentro de um documento que os próprios usuários possam modificar.

A allowlist deverá fazer parte das regras/configuração segura.

---

# 28. Bootstrap temporário da allowlist

Como o projeto Firebase ainda não existe, os UIDs ainda não são conhecidos.

Durante configuração inicial poderá ser usada temporariamente uma regra baseada em:

- usuário autenticado;
- email verificado;
- email pertencente às duas contas permitidas.

Depois de obter os UIDs, migrar as regras para UID allowlist.

---

# 29. Defense in depth

Além das Rules:

- validar usuário no frontend;
- restringir Authorized Domains;
- remover domínios de desenvolvimento quando não forem necessários em produção;
- não versionar credenciais privadas;
- revisar regras no Emulator antes do deploy.

App Check poderá ser avaliado como camada adicional de proteção contra abuso, mas não substitui Security Rules.

---

# 30. Firebase config

O Firebase Web Config não deverá ser tratado como substituto de segurança.

Configurações necessárias serão expostas ao cliente web por natureza.

A segurança dos dados deverá depender de:

- Auth;
- Rules;
- allowlist.

## Organização

Usar variáveis Vite:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Mesmo não sendo credenciais privadas equivalentes a service-account keys, manter configuração de ambiente fora do código facilita troca entre ambientes.

---

# 31. Segredos proibidos no repositório

Nunca versionar:

- service account JSON;
- private keys;
- refresh tokens;
- senhas;
- credenciais administrativas;
- tokens de deploy Firebase.

---

# 32. GitHub Pages

URL esperada:

```text
https://abnereslava.github.io/manutencao_carro/
```

Vite deverá usar:

```ts
base: "/manutencao_carro/"
```

---

# 33. Routing no GitHub Pages

Usar `HashRouter`.

Exemplo:

```text
/manutencao_carro/#/
/manutencao_carro/#/maintenance
/manutencao_carro/#/parts
```

## Motivo

GitHub Pages não fornece rewrites de SPA equivalentes a um servidor de aplicação.

HashRouter evita depender de hacks de `404.html` para rotas internas.

---

# 34. PWA

O app deverá ser instalável desde a primeira versão.

Usar:

`vite-plugin-pwa`

com Workbox.

---

# 35. Estratégia do service worker

Usar estratégia simples de geração de service worker.

Recomendação inicial:

`generateSW`

## Precache

Pré-cache apenas do app shell e assets estáticos versionados:

- HTML;
- JS;
- CSS;
- ícones;
- fontes locais, se existirem;
- assets internos.

---

# 36. Dados Firebase não entram no cache do service worker

Não criar runtime caching de:

- Firestore API;
- Firebase Auth;
- tokens;
- respostas contendo dados privados.

O offline dos dados deverá ser controlado pelo próprio Firestore.

---

# 37. Atualização da PWA

Não recarregar a aplicação automaticamente durante formulário ativo.

Estratégia:

`prompt`

Quando houver nova versão:

> Nova versão disponível.

Ações:

- Atualizar agora
- Depois

## Regra

Antes de atualizar:

- garantir autosave do rascunho;
- preservar contexto quando possível.

---

# 38. Manifest

Deverá conter:

- name: Carango Véio;
- short_name: Carango;
- display: standalone;
- theme_color;
- background_color;
- start_url compatível com GitHub Pages + HashRouter;
- scope do repositório;
- ícones PWA.

---

# 39. Ícones PWA

Usar como fonte visual um ícone simples de veículo da biblioteca adotada.

Gerar assets estáticos apropriados:

- favicon;
- ícone 192;
- ícone 512;
- maskable icon quando necessário.

Não depender de carregar a biblioteca de ícones antes de exibir o ícone do PWA.

---

# 40. Tailwind CSS

Tailwind será usado para:

- tokens;
- responsividade;
- estados;
- layout;
- densidade.

## Regra

Não colocar decisões visuais arbitrárias em cada componente.

Centralizar tokens do Design System.

---

# 41. Componentes de UI

Criar componentes reutilizáveis como:

- Button;
- IconButton;
- Card;
- Badge;
- Input;
- Select;
- SearchableSelect;
- Modal;
- Drawer;
- Toast;
- Collapse;
- Tabs;
- DataTable;
- EmptyState;
- Skeleton;
- AlertCard.

Primitives acessíveis poderão ser usadas para comportamentos complexos.

---

# 42. Estado de UI

Estado efêmero poderá ficar em:

- React state;
- Context quando realmente global;
- store leve quando necessário.

Evitar store global para dados que já vêm do Firestore.

---

# 43. Dados Firestore

Preferir hooks/repositories específicos.

Exemplo:

```text
useMaintenancePlans()
useMaintenanceOccurrence(id)
useParts()
useAlerts()
```

A UI não deverá montar paths Firestore diretamente.

---

# 44. Repository pattern

Criar interfaces conceituais:

```text
MaintenanceRepository
PartRepository
VehicleRepository
DocumentRepository
IssueRepository
```

Benefícios:

- desacoplar UI;
- facilitar Emulator;
- facilitar testes;
- permitir futuras migrações.

---

# 45. Firebase converters

Usar `FirestoreDataConverter` ou camada equivalente para:

- tipagem;
- serialização;
- leitura;
- timestamps;
- schemaVersion.

---

# 46. Schema version

Entidades persistidas relevantes deverão possuir:

`schemaVersion`

Objetivo:

- suportar migrações futuras;
- identificar documentos antigos.

---

# 47. Migrações

Não depender de alterar todos os documentos manualmente.

Criar estrutura para scripts de migração:

```text
scripts/
└── migrations/
```

Migrações deverão ser executadas deliberadamente, nunca implicitamente de forma destrutiva na inicialização do app.

---

# 48. Índices Firestore

Manter:

`firestore.indexes.json`

versionado.

Criar somente índices necessários às consultas reais.

---

# 49. Rules versionadas

Manter:

`firestore.rules`

no repositório.

Toda alteração de segurança deverá passar por revisão e testes do Emulator.

---

# 50. Deploy das Rules

GitHub Pages não publica regras Firestore.

As regras deverão ser publicadas separadamente no Firebase.

Inicialmente:

- Firebase CLI local;
- `firebase deploy --only firestore:rules,firestore:indexes`.

Automação CI poderá ser adicionada futuramente usando credencial protegida do GitHub.

---

# 51. GitHub Actions — frontend

Workflow em:

`.github/workflows/deploy-pages.yml`

Fluxo:

```text
push em main
    ↓
checkout
    ↓
instalar Node
    ↓
npm ci
    ↓
typecheck
    ↓
testes críticos
    ↓
npm run build
    ↓
upload Pages artifact
    ↓
deploy GitHub Pages
```

---

# 52. Variáveis do GitHub Actions

Usar GitHub Actions Variables/Secrets conforme o tipo do valor.

O workflow deverá injetar as variáveis `VITE_FIREBASE_*` durante o build.

Nenhuma chave privada Firebase Admin será necessária para o deploy do frontend.

---

# 53. Ambientes

Inicialmente poderá existir apenas:

- desenvolvimento local;
- produção.

## Local

Usar Firebase Emulator quando trabalhando em:

- regras;
- testes;
- operações destrutivas;
- desenvolvimento de fluxos críticos.

---

# 54. Firebase Emulator Suite

Usar Emulator para:

- Firestore;
- Auth;
- Security Rules.

Benefícios:

- não poluir produção;
- testar contas negadas;
- testar regras offline/online;
- testes automatizados.

---

# 55. Testes críticos — domínio

Usar Vitest para testar pelo menos:

## Manutenção

- OK;
- Próxima;
- Vencida;
- data + KM;
- primeiro limite.

## Recorrência

- KM;
- tempo;
- combinada;
- ciclos independentes;
- edição histórica.

## Peças

- instalação;
- substituição;
- remoção;
- peça faltando essencial.

## Garantia

- data;
- KM;
- combinada.

## Gastos

- total calculado;
- override manual;
- effectiveTotal.

---

# 56. Testes críticos — Security Rules

Testar obrigatoriamente:

1. usuário não autenticado não lê;
2. usuário não autenticado não escreve;
3. UID não autorizado não lê;
4. UID não autorizado não escreve;
5. UID autorizado lê;
6. UID autorizado escreve.

Esses testes são requisito de segurança antes do deploy de produção.

---

# 57. Testes críticos — UI

React Testing Library deverá cobrir poucos fluxos essenciais.

Exemplos:

- formulário de concluir manutenção;
- confirmação de remoção de peça essencial;
- total manual sobrescrevendo calculado;
- rascunho recuperado.

---

# 58. Testes E2E

Playwright deverá cobrir somente os fluxos mais críticos.

Sugestão mínima:

## E2E-01

Atualizar KM e observar mudança de alerta.

## E2E-02

Concluir manutenção recorrente e recalcular próximo ciclo.

## E2E-03

Substituir peça e validar estado anterior/atual.

## E2E-04

Remover peça essencial, confirmar e gerar Peça faltando.

## E2E-05

Usuário não autorizado não acessa dados.

---

# 59. Type safety

Evitar `any` em domínio e persistência.

Tipos principais deverão ser explícitos.

Zod deverá validar:

- formulários;
- dados de entrada;
- estruturas que cruzem limites relevantes.

---

# 60. Datas

Persistir datas temporais relevantes em formato Firestore Timestamp quando fizer sentido.

Na camada de domínio, converter para representação consistente.

Não espalhar manipulação de datas diretamente pelos componentes.

---

# 61. Biblioteca de datas

Usar biblioteca pequena e bem mantida quando necessário.

A escolha poderá ser feita na implementação.

Regras de data importantes devem permanecer encapsuladas em funções próprias.

---

# 62. Valores monetários

Persistir valores monetários preferencialmente como inteiro em centavos.

Exemplo:

```text
R$ 123,45
→ 12345
```

Evitar cálculos financeiros baseados em float.

---

# 63. Quilometragem

Persistir KM como número inteiro.

Não salvar strings formatadas.

Apresentação:

```text
148.200 km
```

Persistência:

```text
148200
```

---

# 64. IDs

Usar IDs Firestore ou UUID quando apropriado.

IDs não deverão depender de textos visíveis.

Exceções:

- documento estável do veículo;
- definições hardcoded do catálogo.

---

# 65. Logs

Produção deverá evitar logs contendo:

- RENAVAM;
- chassi;
- dados documentais;
- payloads inteiros de Firestore.

Logs de desenvolvimento deverão ser removidos ou condicionados ao modo dev.

---

# 66. Tratamento de erros

Criar camada para traduzir erros técnicos em mensagens de UX.

Exemplo:

```text
permission-denied
→ "Você não tem permissão para acessar estes dados."
```

Não mostrar stack trace ao usuário.

---

# 67. Monitoramento

A V1 não exige plataforma externa de observabilidade.

Erros deverão ser tratados de forma clara.

Uma ferramenta de error tracking poderá ser adicionada futuramente.

---

# 68. Performance

Prioridades:

- code splitting por rota;
- imports lazy para telas grandes;
- listeners Firestore apenas quando necessários;
- paginação/limite em históricos grandes;
- evitar listeners globais redundantes;
- memoização apenas onde houver benefício real.

---

# 69. Histórico grande

Timeline não deverá carregar indefinidamente todos os registros.

Usar:

- paginação;
- cursor;
- carregamento incremental.

---

# 70. Listeners realtime

Usar realtime para dados que se beneficiem de sincronização imediata.

Não é obrigatório usar listener permanente em todas as coleções.

---

# 71. Drafts

Rascunhos poderão usar armazenamento local separado do Firestore até serem finalizados.

Sugestão:

- IndexedDB para dispositivo confiável;
- memória/session storage para dispositivo não confiável.

## Regra

Rascunho não deve virar fato histórico antes da confirmação.

---

# 72. Rascunhos sensíveis

Ao logout explícito:

- remover rascunhos locais sensíveis;
- remover cache persistente conforme política;
- limpar sessão.

---

# 73. Estado de conectividade

Criar hook equivalente a:

`useConnectivityStatus()`

Estados:

- online;
- offline;
- syncing.

A UI poderá exibir indicador discreto.

---

# 74. Atualizações pendentes

Quando snapshot indicar writes locais pendentes:

- mostrar indicador de sincronização;
- não afirmar "Sincronizado" até confirmação.

---

# 75. PWA offline shell

Mesmo em dispositivo não confiável, o shell estático da aplicação poderá permanecer cacheado.

Isso inclui somente código e assets públicos do app.

Dados privados não deverão ser colocados no Cache Storage pelo service worker.

---

# 76. GitHub Pages e segurança

O repositório e os assets frontend podem ser públicos.

Isso não deverá permitir acesso ao Firestore.

O controle de dados depende das Firebase Security Rules e autenticação.

---

# 77. Checklist de bootstrap do Firebase

Quando o Firebase for criado:

1. criar Web App;
2. ativar Google Auth;
3. adicionar domínio GitHub Pages autorizado;
4. criar Firestore;
5. escolher região;
6. executar login das duas contas;
7. coletar os dois UIDs;
8. configurar allowlist nas Rules;
9. testar Rules no Emulator;
10. publicar Rules;
11. configurar variáveis Vite;
12. validar login em produção;
13. validar trusted/untrusted device;
14. validar offline.

---

# 78. Decisões técnicas resumidas

```text
React + TypeScript + Vite
Firebase Auth
Firestore
GitHub Pages
HashRouter
Tailwind
React Hook Form + Zod
vite-plugin-pwa + Workbox
Firestore persistent cache somente em dispositivo confiável
Firestore memory cache em dispositivo não confiável
Security Rules default deny + UID allowlist
Vitest + Emulator + poucos E2E Playwright
```

---

# 79. Regra arquitetural central

```text
UI não decide regra de negócio.
Regra de negócio não depende do Firebase.
Firebase não é considerado segurança sem Rules.
Offline não deve comprometer privacidade.
Dados derivados devem ser recalculáveis.
```
