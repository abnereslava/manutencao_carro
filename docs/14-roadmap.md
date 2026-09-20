# Carango Véio — Roadmap de Implementação

## 1. Objetivo

Este documento organiza a implementação do Carango Véio em fases sequenciais.

O roadmap deverá servir como ponte entre:

- SDD;
- arquitetura;
- critérios de aceite;
- arquivos de `tasks/`;
- implementação efetiva.

A ordem prioriza:

1. segurança;
2. fundação técnica;
3. dados centrais;
4. regras de negócio;
5. fluxos críticos;
6. experiência offline;
7. refinamento visual;
8. validação final.

---

# 2. Princípios do roadmap

## ROAD-001 — Fundação antes de features

Não iniciar telas complexas antes de:

- estrutura do projeto;
- Firebase;
- autenticação;
- navegação;
- design tokens;
- camada de domínio;
- camada de dados.

## ROAD-002 — Regra antes da interface final

Cálculos críticos deverão existir e ter testes antes de serem utilizados em muitas telas.

## ROAD-003 — Dados reais somente após segurança

Produção só deverá receber dados reais depois de:

- Auth configurado;
- Rules restritivas;
- allowlist funcionando;
- testes básicos de segurança passando.

## ROAD-004 — Implementação incremental

Cada fase deverá resultar em software utilizável e verificável.

---

# 3. Fase 0 — Preparação do repositório

## Objetivo

Transformar o repositório em um projeto executável.

## Entregas

- React;
- TypeScript;
- Vite;
- estrutura inicial de pastas;
- ESLint;
- Prettier;
- scripts npm;
- `.gitignore`;
- configuração de ambiente;
- README técnico inicial.

## Scripts mínimos

```text
npm run dev
npm run build
npm run preview
npm run typecheck
npm run test
npm run lint
```

## Critério de saída

- app inicia localmente;
- build passa;
- TypeScript passa;
- estrutura está pronta para receber features.

---

# 4. Fase 1 — Design foundation

## Objetivo

Criar os elementos visuais básicos antes das telas funcionais.

## Entregas

- Tailwind CSS;
- tokens de cor;
- tema claro;
- tema escuro;
- tema sistema;
- tipografia;
- spacing;
- radius;
- estados semânticos;
- ícones;
- componentes base.

## Componentes mínimos

- Button;
- IconButton;
- Card;
- Badge;
- Input;
- Textarea;
- Select;
- Modal;
- Drawer;
- Toast;
- Collapse;
- Skeleton;
- EmptyState;
- Tabs.

## Critério de saída

- componentes funcionam nos dois temas;
- estados semânticos não dependem só de cor;
- mobile e desktop possuem base responsiva.

---

# 5. Fase 2 — Navegação e shell

## Objetivo

Construir a estrutura geral da aplicação.

## Entregas

### Desktop

- menu superior;
- breadcrumbs;
- área de conteúdo;
- ações primárias.

### Mobile

- drawer pela direita;
- botão de menu;
- swipe para abrir/fechar;
- overlay;
- FAB estrutural.

### Rotas

- Login
- Início
- Manutenções
- Peças
- Histórico
- Gastos
- Documentos
- Veículo
- Configurações
- Alertas

## Critério de saída

Toda navegação principal funciona com placeholders.

---

# 6. Fase 3 — Firebase bootstrap

## Objetivo

Configurar infraestrutura real.

## Entregas

- projeto Firebase criado;
- Web App;
- Google Auth;
- Firestore;
- Authorized Domains;
- variáveis Vite;
- Firebase Emulator Suite;
- `firestore.rules`;
- `firestore.indexes.json`.

## Segurança

Inicialmente:

- default deny;
- autenticação obrigatória;
- allowlist temporária por e-mail, se necessário.

Depois:

- coletar UIDs;
- migrar para allowlist por UID.

## Critério de saída

- usuário autorizado entra;
- usuário não autorizado é bloqueado;
- regras testadas.

---

# 7. Fase 4 — Trusted device e persistência

## Objetivo

Implementar a política de privacidade/offline definida.

## Entregas

- pergunta "Este é um dispositivo confiável?";
- persistência da escolha;
- `persistentLocalCache`;
- `memoryLocalCache`;
- auth persistence adequada;
- ação para limpar dados locais;
- logout seguro.

## Critério de saída

Dispositivo confiável e não confiável apresentam comportamentos distintos e verificáveis.

---

# 8. Fase 5 — Camada de domínio

## Objetivo

Criar funções puras que representam as regras principais.

## Módulos

### Odometer

- validação de nova leitura;
- ordenação;
- cálculo de KM atual.

### Maintenance

- OK;
- Próxima;
- Vencida;
- recorrência por KM;
- recorrência por tempo;
- combinada;
- ciclos independentes.

### Parts

- instalação;
- substituição;
- remoção;
- missing;
- notApplicable.

### Warranty

- ativa;
- próxima;
- vencida;
- data/KM combinados.

### Expenses

- total calculado;
- override;
- gross;
- refunded;
- net.

### Alerts

- geração;
- prioridade;
- snooze;
- ocultação;
- resolução.

## Critério de saída

Testes unitários críticos passam sem Firebase.

---

# 9. Fase 6 — Modelo Firestore e repositories

## Objetivo

Conectar domínio e persistência.

## Entregas

- types;
- schemas Zod;
- converters;
- repositories;
- schemaVersion;
- audit fields;
- helpers para serverTimestamp;
- tratamento de erros.

## Repositories mínimos

- VehicleRepository
- OdometerRepository
- MaintenanceRepository
- PartRepository
- IssueRepository
- DocumentRepository
- AlertRepository

## Critério de saída

CRUD básico funciona pelo Emulator sem UI complexa.

---

# 10. Fase 7 — Veículo e quilometragem

## Objetivo

Entregar a primeira feature completa.

## Entregas

### Veículo

- dados gerais;
- edição;
- observações.

### Quilometragem

- leitura atual;
- histórico;
- modal de atualização;
- edição;
- exclusão;
- bloqueio de regressão;
- recálculo.

## Critério de saída

Todos os critérios AC-ODO aplicáveis passam.

---

# 11. Fase 8 — Catálogo estrutural do Sandero

## Objetivo

Construir a base fixa de componentes.

## Entregas

- sistemas;
- categorias;
- componentes;
- posições;
- essencial/opcional;
- technicalFieldSchema;
- estado Sem informações;
- estado Não se aplica.

## Dependência externa

Antes de finalizar esta fase, o catálogo deverá ser verificado em fontes técnicas confiáveis.

Não preencher detalhes técnicos específicos por suposição.

## Critério de saída

Hub de peças consegue listar toda a estrutura definida.

---

# 12. Fase 9 — Hub de Peças

## Objetivo

Permitir visualizar e manter o estado estrutural do carro.

## Entregas

Tabs:

- Visão do carro
- Todas as peças
- Peças faltando
- Por sistema
- Histórico

## Recursos

- busca dinâmica;
- filtros persistentes;
- detalhe do componente;
- detalhe da peça;
- estado atual;
- campos técnicos;
- histórico contextual.

## Critério de saída

É possível descobrir rapidamente:

- o que está instalado;
- o que está faltando;
- o que é desconhecido;
- o que não se aplica.

---

# 13. Fase 10 — Manutenções básicas

## Objetivo

Implementar planos e ocorrências.

## Entregas

- nova manutenção;
- tipos;
- prazo;
- recorrência;
- prioridade;
- status;
- detalhe;
- edição;
- início;
- conclusão;
- arquivamento.

## Critério de saída

Fluxo completo:

```text
Criar plano
→ atingir prazo
→ alertar
→ concluir
→ gerar histórico
→ recalcular próximo ciclo
```

funciona.

---

# 14. Fase 11 — Fluxos de peças dentro de manutenção

## Objetivo

Integrar fatos mecânicos ao fluxo de conclusão.

## Entregas

- instalar;
- substituir;
- remover;
- inspecionar;
- reparar;
- múltiplas peças na mesma ocorrência;
- condição nova/usada/recondicionada/desconhecida;
- vida anterior conhecida;
- observação inicial;
- campos específicos.

## Critério de saída

Todos os AC-PART críticos passam.

---

# 15. Fase 12 — Peça faltando

## Objetivo

Implementar integridade de componentes essenciais.

## Entregas

- confirmação ao remover;
- estado missing;
- alerta crítico;
- bloqueio de snooze;
- bloqueio de ocultação;
- resolução ao instalar nova peça.

## Critério de saída

Fluxo completo de peça faltando passa em E2E.

---

# 16. Fase 13 — Problemas e inspeções

## Objetivo

Implementar manutenção corretiva.

## Entregas

### Problemas

- criar;
- status;
- prioridade;
- editar;
- histórico.

### Inspeções

- criar;
- concluir;
- resultado;
- ciclos independentes.

### Relações

- criar problema a partir de inspeção;
- criar manutenção a partir de problema;
- perguntar se resolve o problema ao concluir.

## Critério de saída

Fluxo inspeção → problema → manutenção → resolução funciona.

---

# 17. Fase 14 — Custos

## Objetivo

Implementar controle financeiro ligado aos registros.

## Entregas

- peças;
- mão de obra;
- outros;
- calculado;
- override;
- total efetivo;
- agrupamentos.

## Resumos

- mês atual;
- ano;
- últimos 12 meses;
- histórico;
- categoria;
- sistema;
- componente;
- manutenção.

---

# 18. Fase 15 — Estornos

## Objetivo

Implementar correção financeira sem valores negativos.

## Entregas

- Normal;
- Parcialmente estornada;
- Estornada;
- valor estornado;
- observação;
- gasto bruto;
- total estornado;
- gasto líquido.

## Critério de saída

Estorno parcial e total passam nos critérios AC-REF.

---

# 19. Fase 16 — Garantias

## Objetivo

Integrar garantias de peças e serviços.

## Entregas

- por data;
- por KM;
- combinada;
- alertas;
- detalhe;
- histórico;
- janela pós-vencimento de 7 dias.

---

# 20. Fase 17 — Documentos

## Objetivo

Implementar documentos anuais e vencimentos.

## Entregas

- IPVA;
- licenciamento;
- seguro;
- personalizado;
- novo/editar;
- URL externa;
- ano;
- valor;
- vencimento;
- alertas.

---

# 21. Fase 18 — Central de Alertas

## Objetivo

Consolidar todos os alertas.

## Entregas

- contador;
- lista;
- ordenação;
- filtros;
- visto;
- snooze;
- ocultar;
- reativar;
- adiado;
- acesso direto.

## Critério de saída

AC-ALT e AC-WAR relacionados à central passam.

---

# 22. Fase 19 — Histórico unificado

## Objetivo

Montar timeline completa.

## Eventos

- manutenção;
- inspeção;
- peça;
- problema;
- documento;
- garantia;
- KM;
- gasto.

## Recursos

- filtros;
- busca;
- paginação;
- detalhe;
- links para origem.

---

# 23. Fase 20 — Edição histórica e rollback

## Objetivo

Permitir corrigir registros sem quebrar o estado atual.

## Entregas

- edição;
- recálculo;
- dependências;
- exclusão segura;
- rollback automático seguro;
- bloqueio quando ambíguo;
- visualização de dependências.

## Critério de saída

AC-HIST-003, AC-HIST-004 e AC-HIST-005 passam.

---

# 24. Fase 21 — Rascunhos

## Objetivo

Evitar perda de formulários.

## Entregas

- autosave;
- debounce;
- restauração;
- descarte;
- aviso de saída;
- IndexedDB em dispositivo confiável;
- memória/session em não confiável.

---

# 25. Fase 22 — Offline completo

## Objetivo

Validar funcionamento real sem rede.

## Cenários

- abrir app previamente sincronizado;
- consultar dados;
- registrar alteração;
- concluir manutenção;
- registrar KM;
- voltar online;
- sincronizar.

## UI

Estados:

- Online
- Offline
- Sincronizando

---

# 26. Fase 23 — Conflitos

## Objetivo

Evitar sobrescrita silenciosa.

## Entregas

- revision;
- detecção quando possível;
- versão local;
- versão remota;
- comparação;
- escolha;
- revisão manual.

---

# 27. Fase 24 — Dashboard final

## Objetivo

Substituir o dashboard provisório pela composição definitiva.

## Conteúdo

- KM;
- críticos;
- próximas;
- problemas;
- garantias;
- documentos;
- gastos;
- ações rápidas;
- atalhos.

---

# 28. Fase 25 — Configurações

## Entregas

- tema;
- antecedência em KM;
- antecedência em dias;
- dispositivo confiável;
- limpar dados locais;
- preferências;
- restaurar filtros;
- conta;
- logout.

---

# 29. Fase 26 — PWA

## Entregas

- manifest;
- favicon;
- ícones;
- maskable icon;
- service worker;
- precache;
- update prompt;
- standalone;
- instalação.

## Validação

Testar ao menos:

- Android;
- Chrome desktop.

---

# 30. Fase 27 — GitHub Pages

## Entregas

- base path;
- HashRouter;
- GitHub Actions;
- build;
- Pages artifact;
- deploy;
- Firebase env variables.

## Critério de saída

Produção acessível e navegável sem 404 de rota.

---

# 31. Fase 28 — Segurança final

## Checklist

- UID allowlist;
- default deny;
- Rules tests;
- nenhum dado público;
- nenhum segredo;
- Authorized Domains;
- logs limpos;
- produção validada com usuário negado.

---

# 32. Fase 29 — Testes E2E críticos

Implementar os cenários definidos na arquitetura:

1. KM muda alerta;
2. conclusão recorrente;
3. substituição de peça;
4. remoção essencial;
5. acesso negado.

Adicionar casos quando bugs críticos forem encontrados.

---

# 33. Fase 30 — Refinamento visual

## Objetivo

Aplicar acabamento final depois dos fluxos funcionarem.

## Revisar

- espaçamentos;
- densidade;
- collapses;
- responsividade;
- dark mode;
- hover;
- foco;
- estados vazios;
- skeleton;
- toasts;
- tabelas;
- cards;
- FAB;
- menus.

---

# 34. Fase 31 — Acessibilidade

Validar:

- teclado;
- foco;
- labels;
- contraste;
- modais;
- drawer;
- status sem depender de cor;
- touch targets.

---

# 35. Fase 32 — Performance

Revisar:

- bundles;
- code splitting;
- queries;
- listeners;
- paginação;
- renders;
- histórico grande;
- cache;
- PWA.

Otimizar somente onde houver impacto real.

---

# 36. Fase 33 — Validação do SDD

Executar checklist completo contra:

- functional requirements;
- business rules;
- user flows;
- screens;
- UX;
- alert system;
- automations;
- edge cases;
- acceptance criteria.

Todo desvio deverá ser:

- corrigido;
- ou documentado deliberadamente.

---

# 37. Fase 34 — Release V1

A V1 poderá ser considerada concluída quando:

- critérios mínimos de release do documento 13 passarem;
- deploy estiver estável;
- Rules estiverem em produção;
- offline estiver validado;
- dados reais puderem ser cadastrados;
- nenhum bug crítico conhecido permanecer.

---

# 38. Pós-V1

Itens possíveis para avaliação futura, sem compromisso de implementação:

- múltiplos veículos;
- outros proprietários;
- anexos próprios;
- Storage;
- push notifications;
- lembretes externos;
- OBD-II;
- importação/exportação;
- relatórios PDF;
- backup manual;
- integração com oficinas;
- catálogo para outros modelos;
- dashboards avançados.

Esses itens não devem contaminar o escopo da V1.

---

# 39. Sequência resumida

```text
0  Repositório
1  Design foundation
2  Navegação
3  Firebase
4  Trusted device
5  Domain
6  Data layer
7  Veículo/KM
8  Catálogo Sandero
9  Peças
10 Manutenções
11 Peças em manutenção
12 Peça faltando
13 Problemas/inspeções
14 Custos
15 Estornos
16 Garantias
17 Documentos
18 Alertas
19 Histórico
20 Rollback
21 Rascunhos
22 Offline
23 Conflitos
24 Dashboard final
25 Configurações
26 PWA
27 GitHub Pages
28 Segurança
29 E2E
30 Visual
31 Acessibilidade
32 Performance
33 Validação SDD
34 Release
```

---

# 40. Estratégia para tasks

Após este roadmap, criar diretório:

`tasks/`

Cada task deverá:

- possuir ID;
- indicar fase;
- explicar objetivo;
- listar arquivos prováveis;
- apontar requisitos do SDD;
- definir dependências;
- possuir checklist;
- possuir critérios de aceite;
- ser pequena o suficiente para um agente implementar e validar em uma sessão de trabalho.

## Exemplo

```text
TASK-005
Fase: 1
Título: Criar sistema de temas claro/escuro

Dependências:
TASK-001
TASK-002

Aceite:
- tema claro funciona;
- tema escuro funciona;
- preferência Sistema funciona;
- preferência persiste.
```

---

# 41. Regra final

```text
Não avançar apenas porque uma tela "parece pronta".

Cada fase deve sair com:
implementação
+
validação
+
critérios de aceite atendidos.
```
