# Carango Véio — Configuração Firebase

## 1. Projeto Firebase

Projeto criado para o Carango Véio:

```text
Project ID: appcarro-d3c92
Auth domain: appcarro-d3c92.firebaseapp.com
Storage bucket: appcarro-d3c92.firebasestorage.app
Messaging sender ID: 555656143921
Web App ID: 1:555656143921:web:8de56f5ebeaa3475286110
```

O Firebase será usado somente para:

- Firebase Authentication;
- Cloud Firestore.

O deploy do frontend será feito pelo GitHub Pages.

---

## 2. Contas autorizadas

Somente estas contas Google devem acessar os dados:

```text
abner.eslava@gmail.com
mariner.eslava@gmail.com
```

### Observação importante

Com autenticação Google, os usuários não precisam ser pré-criados manualmente no Firebase Authentication.

O documento do usuário é criado pelo Firebase Authentication no primeiro login bem-sucedido com Google.

A restrição real de acesso aos dados é aplicada pelas Firestore Security Rules e também deverá ser repetida no frontend para UX.

---

## 3. Provedor de autenticação

No Firebase Console:

```text
Authentication
→ Sign-in method
→ Google
→ Ativar
```

Definir um e-mail de suporte válido.

Nenhum outro provedor deverá ser habilitado na V1.

---

## 4. Domínio do GitHub Pages

URL provável do app:

```text
https://abnereslava.github.io/manutencao_carro/
```

Domínio que deve ser adicionado em:

```text
Authentication
→ Settings
→ Authorized domains
```

Adicionar:

```text
abnereslava.github.io
```

Não incluir:

- `https://`;
- a barra final;
- `/manutencao_carro/`.

O Authorized Domain recebe somente o hostname.

---

## 5. Desenvolvimento local

Como o projeto Firebase foi criado depois de 28/04/2025, `localhost` pode não estar autorizado automaticamente.

Se o desenvolvimento local usar autenticação Google real, adicionar também:

```text
localhost
```

em Authorized domains.

Se o desenvolvimento ocorrer exclusivamente via Auth Emulator, isso pode não ser necessário para todos os testes.

---

## 6. Configuração web

A configuração web fornecida pelo Firebase está representada em:

`.env.example`

Variáveis:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Durante a implementação, criar localmente:

`.env.local`

a partir de:

`.env.example`

---

## 7. Segurança do Firebase Web Config

A configuração web do Firebase aparece no bundle do navegador por natureza.

Ela não substitui autenticação nem regras de segurança.

Não considerar `apiKey` do Firebase Web SDK uma credencial administrativa.

Nunca versionar:

- service account JSON;
- private keys;
- refresh tokens;
- Firebase Admin credentials;
- tokens de CI com acesso administrativo.

---

## 8. Firestore Security Rules

Arquivo:

`firestore.rules`

A V1 inicial usa allowlist por e-mail:

- usuário precisa estar autenticado;
- e-mail precisa estar verificado;
- login precisa ter ocorrido com Google;
- e-mail precisa ser um dos dois autorizados.

Tudo o que não for explicitamente liberado recebe:

```text
allow read, write: if false;
```

---

## 9. Estrutura liberada pelas Rules

As regras atuais liberam apenas:

```text
appSettings/**
vehicles/sandero
vehicles/sandero/**
```

para as duas contas autorizadas.

Isso corresponde ao escopo de:

- um único proprietário lógico;
- duas identidades Google autorizadas;
- um único veículo.

---

## 10. Migração futura para UID

Após Abner e Mariana entrarem ao menos uma vez com Google, o Firebase Authentication passará a possuir os UIDs reais das duas contas.

Depois disso, é recomendado substituir a allowlist por e-mail por allowlist de UID.

Formato conceitual:

```text
request.auth.uid in [
  "UID_ABNER",
  "UID_MARIANA"
]
```

Essa mudança reduz dependência do campo de e-mail e passa a identificar diretamente as contas Firebase.

Até os dois UIDs existirem, a allowlist de e-mail verificado é a estratégia inicial.

---

## 11. Publicação das Rules

As regras podem ser publicadas sem configurar uma conta de serviço no Google Cloud:

1. Abra o projeto `appcarro-d3c92` no Firebase Console.
2. Acesse **Firestore Database → Regras**.
3. Substitua o conteúdo pelo arquivo `firestore.rules` deste repositório.
4. Clique em **Publicar**.

O arquivo `firestore.indexes.json` não define índices compostos na configuração atual, portanto não há índices adicionais para publicar.

Como alternativa, para publicar manualmente com a Firebase CLI autenticada:

```bash
firebase use appcarro-d3c92
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 12. Firestore Database

A aplicação deverá usar Cloud Firestore.

Estrutura conceitual inicial:

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

O catálogo estrutural do Sandero permanecerá em código e não será usado como cadastro editável no Firestore.

---

## 13. Checklist do Console

### Authentication

- [ ] Abrir Authentication
- [ ] Ativar Google
- [ ] Definir support email
- [ ] Adicionar `abnereslava.github.io` em Authorized domains
- [ ] Adicionar `localhost` somente se necessário para desenvolvimento local

### Firestore

- [ ] Database criado
- [ ] Confirmar região escolhida
- [ ] Publicar `firestore.rules`
- [ ] Publicar `firestore.indexes.json`

### Primeiro login

- [ ] Abner entrar com Google
- [ ] Mariana entrar com Google
- [ ] Confirmar os dois usuários na aba Authentication > Users
- [ ] Anotar os dois UIDs
- [ ] Posteriormente substituir allowlist por e-mail por allowlist de UID

---

## 14. Referências relacionadas

Consultar também:

- `docs/00-overview.md`
- `docs/01-functional-requirements.md`
- `docs/11-technical-architecture.md`
- `docs/13-acceptance-criteria.md`
- `tasks/TASK-008-firebase-bootstrap.md`
- `tasks/TASK-009-google-auth.md`
- `tasks/TASK-010-firestore-security-rules.md`
