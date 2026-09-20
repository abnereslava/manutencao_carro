# Carango Véio — Critérios de Aceite

## 1. Objetivo

Este documento define critérios objetivos para validar a implementação do Carango Véio.

Os critérios usam o formato:

```text
Dado
Quando
Então
```

Um requisito somente deverá ser considerado concluído quando os critérios aplicáveis forem atendidos.

---

# 2. Autenticação

## AC-AUTH-001 — Login permitido

**Dado** que o usuário acessou a aplicação  
**Quando** autenticar com uma das contas Google autorizadas  
**Então** deverá entrar no sistema e acessar os dados do Sandero.

## AC-AUTH-002 — Login bloqueado

**Dado** que uma conta Google não autorizada autentique  
**Quando** o Firebase confirmar a identidade  
**Então** a aplicação deverá bloquear o acesso aos dados.

## AC-AUTH-003 — Mesmo conjunto de dados

**Dado** que as duas contas autorizadas acessem o app  
**Quando** consultarem registros  
**Então** deverão visualizar o mesmo conjunto de dados.

---

# 3. Primeiro acesso

## AC-FIRST-001 — Sem onboarding de veículo

**Dado** um login autorizado  
**Quando** o app abrir  
**Então** deverá ir diretamente ao Dashboard.

## AC-FIRST-002 — Sandero já existente

**Dado** o primeiro acesso  
**Quando** o usuário abrir Veículo  
**Então** deverá editar o Sandero existente, sem criar novo veículo.

---

# 4. Dashboard

## AC-DASH-001 — Quilometragem

**Dado** que exista uma leitura válida  
**Quando** o Dashboard abrir  
**Então** a quilometragem atual deverá aparecer em destaque.

## AC-DASH-002 — Alertas críticos

**Dado** que exista componente essencial sem peça  
**Quando** o Dashboard carregar  
**Então** o alerta deverá aparecer com prioridade máxima.

## AC-DASH-003 — Acesso direto

**Dado** um alerta no Dashboard  
**Quando** o usuário clicar nele  
**Então** deverá abrir diretamente o item responsável.

---

# 5. Quilometragem

## AC-ODO-001 — Registrar leitura válida

**Dado** KM atual de 150.000  
**Quando** o usuário registrar 151.000  
**Então** a leitura deverá ser salva e os derivados recalculados.

## AC-ODO-002 — Bloquear regressão

**Dado** KM atual de 160.000  
**Quando** o usuário tentar registrar nova leitura de 150.000  
**Então** o sistema deverá bloquear o salvamento.

## AC-ODO-003 — Manutenção histórica com KM menor

**Dado** KM atual de 160.000  
**Quando** for registrada manutenção histórica aos 151.200 km  
**Então** o sistema deverá permitir.

## AC-ODO-004 — Correção histórica

**Dado** uma leitura incorreta  
**Quando** o usuário editar ou excluir esse registro  
**Então** os estados e alertas dependentes deverão ser recalculados.

---

# 6. Manutenção recorrente por KM

## AC-MNT-001

**Dado** uma troca realizada aos 148.200 km  
**E** intervalo de 10.000 km  
**Quando** a ocorrência for concluída  
**Então** o próximo limite deverá ser 158.200 km.

## AC-MNT-002 — Sem previsão temporal

**Dado** um plano somente por KM  
**Quando** o sistema calcular o próximo vencimento  
**Então** não deverá estimar uma data futura.

---

# 7. Manutenção recorrente por tempo

## AC-MNT-003

**Dado** uma ocorrência realizada em 20/09/2026  
**E** recorrência de 12 meses  
**Quando** for concluída  
**Então** a próxima data deverá ser 20/09/2027.

---

# 8. Recorrência combinada

## AC-MNT-004

**Dado** um plano com 10.000 km ou 12 meses  
**Quando** qualquer limite for atingido primeiro  
**Então** o plano deverá ficar Vencido.

## AC-MNT-005

**Dado** que a data venceu  
**E** ainda faltam quilômetros  
**Quando** o estado for calculado  
**Então** deverá ser Vencida.

---

# 9. Conclusão manual

## AC-MNT-006

**Dado** uma manutenção vencida  
**Quando** atingir data ou KM  
**Então** o sistema não deverá marcá-la como concluída automaticamente.

## AC-MNT-007

**Dado** um plano recorrente  
**Quando** o usuário concluir manualmente a ocorrência  
**Então** deverá gerar histórico e recalcular o próximo ciclo.

---

# 10. Ciclos independentes

## AC-MNT-008

**Dado** inspeção a cada 10.000 km  
**E** substituição a cada 40.000 km  
**Quando** a inspeção for concluída  
**Então** apenas o ciclo de inspeção deverá ser reiniciado.

---

# 11. Cadastro retroativo

## AC-MNT-009

**Dado** uma manutenção realizada no passado  
**Quando** ela for cadastrada hoje com data e KM históricos  
**Então** deverá ser inserida corretamente na timeline.

## AC-MNT-010

**Dado** que a ocorrência retroativa afete um ciclo  
**Quando** for salva  
**Então** somente as dependências daquele ciclo deverão ser recalculadas.

---

# 12. Problemas

## AC-ISS-001

**Dado** um problema cadastrado  
**Quando** ele ainda não estiver resolvido  
**Então** deverá permanecer visível conforme status e prioridade.

## AC-ISS-002

**Dado** uma inspeção concluída  
**Quando** o usuário clicar em "Criar problema a partir desta inspeção"  
**Então** o formulário deverá vir pré-preenchido com o contexto.

## AC-ISS-003

**Dado** manutenção vinculada a problema  
**Quando** ela for concluída  
**Então** o sistema deverá perguntar se o problema deve ser marcado como resolvido.

---

# 13. Catálogo de componentes

## AC-CAT-001

**Dado** o catálogo hardcoded do Sandero  
**Quando** abrir Peças  
**Então** todos os componentes definidos deverão estar disponíveis mesmo sem histórico.

## AC-CAT-002

**Dado** um componente sem dados  
**Quando** for exibido  
**Então** deverá mostrar estado equivalente a "Sem informações cadastradas".

---

# 14. Não se aplica

## AC-CAT-003

**Dado** um componente do catálogo que não existe nesta unidade  
**Quando** for marcado como "Não se aplica"  
**Então** não deverá gerar alerta de peça faltando.

## AC-CAT-004

**Dado** um componente "Não se aplica"  
**Quando** o usuário abrir seu detalhe  
**Então** o estado deverá ser distinguível de componente opcional ausente.

---

# 15. Instalação de peça

## AC-PART-001

**Dado** um componente sem peça atual  
**Quando** uma peça for instalada via manutenção  
**Então** ela deverá virar a PartInstance atual do componente.

## AC-PART-002

**Dado** uma peça instalada  
**Quando** a manutenção for concluída  
**Então** deverá ser criado evento histórico correspondente.

---

# 16. Peça usada/recondicionada

## AC-PART-003

**Dado** condição "Usada" ou "Recondicionada"  
**Quando** a vida anterior for marcada como desconhecida  
**Então** o sistema não deverá estimar vida útil restante.

## AC-PART-004

**Dado** uma peça com vida anterior desconhecida  
**Quando** o usuário quiser acompanhá-la  
**Então** deverá poder criar inspeção ou plano explícito.

---

# 17. Campos técnicos específicos

## AC-PART-005

**Dado** um pneu  
**Quando** o formulário de instalação abrir  
**Então** poderá exibir campos técnicos aplicáveis ao pneu.

## AC-PART-006

**Dado** um componente sem aquele campo técnico  
**Quando** o formulário abrir  
**Então** o campo não deverá aparecer.

---

# 18. Substituição de peça

## AC-PART-007

**Dado** peça A instalada  
**Quando** manutenção substituir A por B  
**Então** A deverá virar histórica e B deverá ser a peça atual.

## AC-PART-008

**Dado** uma substituição  
**Quando** for salva  
**Então** o motivo livre informado deverá permanecer no histórico.

---

# 19. Remoção

## AC-PART-009

**Dado** componente não essencial  
**Quando** a peça for removida sem substituição  
**Então** ela deverá sair do estado atual e permanecer no histórico.

## AC-PART-010

**Dado** componente essencial  
**Quando** a remoção for solicitada  
**Então** deverá existir confirmação explícita antes de concluir.

## AC-PART-011

**Dado** confirmação da remoção essencial  
**Quando** a remoção for concluída  
**Então** deverá surgir alerta crítico de Peça faltando.

---

# 20. Peça anterior desconhecida

## AC-PART-012

**Dado** que exista fisicamente uma peça não cadastrada  
**Quando** o usuário registrar sua substituição  
**Então** deverá poder registrar "peça anterior desconhecida".

---

# 21. Indicadores de peça

## AC-PART-013

**Dado** data de instalação conhecida  
**Quando** abrir detalhe da peça  
**Então** deverá exibir tempo desde instalação.

## AC-PART-014

**Dado** KM de instalação conhecido  
**Quando** houver KM atual  
**Então** deverá exibir KM rodados desde a instalação.

## AC-PART-015

**Dado** data ou KM desconhecidos  
**Quando** o indicador depender desses dados  
**Então** deverá mostrar "Desconhecido".

---

# 22. Alertas

## AC-ALT-001

**Dado** manutenção a até 1.000 km do limite  
**Quando** o estado for calculado  
**Então** deverá aparecer como Próxima.

## AC-ALT-002

**Dado** manutenção a até 60 dias do limite  
**Quando** o estado for calculado  
**Então** deverá aparecer como Próxima.

## AC-ALT-003

**Dado** uma manutenção vencida por KM  
**Quando** abrir o alerta  
**Então** deverá mostrar há quantos KM venceu.

## AC-ALT-004

**Dado** uma manutenção vencida por data  
**Quando** abrir o alerta  
**Então** deverá mostrar há quantos dias venceu.

## AC-ALT-005

**Dado** regra por data e KM  
**Quando** ambos forem conhecidos  
**Então** deverá exibir os dois critérios.

---

# 23. Central de Alertas

## AC-ALT-006

**Dado** múltiplos alertas  
**Quando** a central abrir  
**Então** todos os alertas ativos deverão estar acessíveis em um único lugar.

## AC-ALT-007

**Dado** um alerta já visualizado  
**Quando** sua condição continuar ativa  
**Então** ele deverá permanecer na central.

## AC-ALT-008

**Dado** alerta permitido  
**Quando** o usuário aplicar snooze  
**Então** ele deverá sumir temporariamente da lista principal.

## AC-ALT-009

**Dado** snooze por tempo ou KM  
**Quando** a condição definida for atingida  
**Então** o alerta deverá reaparecer.

## AC-ALT-010

**Dado** Peça faltando essencial  
**Quando** abrir ações  
**Então** não deverá existir ocultar nem adiar.

---

# 24. Garantia

## AC-WAR-001

**Dado** garantia por data  
**Quando** entrar na faixa global de alerta  
**Então** deverá aparecer como próxima.

## AC-WAR-002

**Dado** garantia combinada  
**Quando** KM ou data vencer primeiro  
**Então** a garantia deverá ser considerada vencida.

## AC-WAR-003

**Dado** uma garantia vencida  
**Quando** passarem 7 dias  
**Então** deverá sair da Central de Alertas.

## AC-WAR-004

**Dado** garantia removida da central  
**Quando** consultar histórico ou detalhe  
**Então** o registro deverá continuar disponível.

---

# 25. Documentos

## AC-DOC-001

**Dado** IPVA 2026 registrado  
**Quando** registrar IPVA 2027  
**Então** o registro de 2026 não deverá ser sobrescrito.

## AC-DOC-002

**Dado** documento com vencimento  
**Quando** entrar na faixa global de alerta  
**Então** deverá gerar alerta.

---

# 26. Gastos

## AC-EXP-001

**Dado** custos de peças + mão de obra + outros  
**Quando** não houver override  
**Então** o total efetivo deverá ser a soma calculada.

## AC-EXP-002

**Dado** total calculado e total manual  
**Quando** existir override  
**Então** o total efetivo deverá usar o valor manual.

## AC-EXP-003

**Dado** override manual  
**Quando** abrir detalhe  
**Então** o total calculado original deverá continuar visível.

---

# 27. Estorno

## AC-REF-001

**Dado** gasto de R$ 500  
**Quando** for totalmente estornado  
**Então** o gasto líquido deverá ser R$ 0.

## AC-REF-002

**Dado** gasto de R$ 500  
**Quando** R$ 150 forem estornados  
**Então** o gasto líquido deverá ser R$ 350.

## AC-REF-003

**Dado** estorno parcial  
**Quando** for salvo  
**Então** o valor estornado deverá ser informado explicitamente.

## AC-REF-004

**Dado** um estorno  
**Quando** o histórico financeiro for exibido  
**Então** o valor original deverá continuar visível.

## AC-REF-005

**Dado** gasto estornado  
**Quando** totais forem calculados  
**Então** deverá existir separação entre gasto bruto, total estornado e gasto líquido.

## AC-REF-006

**Dado** um estorno financeiro  
**Quando** for aplicado  
**Então** não deverá desfazer manutenção ou alteração física do veículo.

---

# 28. Histórico

## AC-HIST-001

**Dado** eventos de diferentes tipos  
**Quando** abrir Histórico  
**Então** deverão aparecer em timeline unificada.

## AC-HIST-002

**Dado** uma ocorrência antiga  
**Quando** sua data for anterior a registros já existentes  
**Então** deverá aparecer na posição cronológica correta.

---

# 29. Exclusão histórica segura

## AC-HIST-003

**Dado** A substituída por B  
**E** B ainda atual  
**E** nenhuma dependência posterior  
**Quando** excluir a ocorrência de substituição  
**Então** o rollback poderá restaurar A.

## AC-HIST-004

**Dado** A → B → C  
**Quando** tentar excluir A → B  
**Então** a exclusão deverá ser bloqueada.

## AC-HIST-005

**Dado** exclusão bloqueada por dependência  
**Quando** o modal aparecer  
**Então** deverá oferecer visualizar dependências ou editar a ocorrência.

---

# 30. Filtros

## AC-FLT-001

**Dado** filtros aplicados  
**Quando** o usuário sair e voltar posteriormente  
**Então** os filtros deverão permanecer.

## AC-FLT-002

**Dado** filtros ativos  
**Quando** clicar em Limpar filtros  
**Então** deverão ser removidos.

---

# 31. Busca

## AC-SRCH-001

**Dado** texto digitado na busca  
**Quando** houver correspondências  
**Então** os resultados deverão surgir dinamicamente sem botão Buscar.

---

# 32. Collapses

## AC-UX-001

**Dado** que o usuário abra ou feche seções recolhíveis  
**Quando** retornar à tela posteriormente  
**Então** o estado deverá ser restaurado.

## AC-UX-002

**Dado** erro em seção recolhida  
**Quando** o formulário validar  
**Então** a seção poderá abrir automaticamente.

---

# 33. Rascunhos

## AC-DRF-001

**Dado** formulário complexo em edição  
**Quando** o usuário digitar  
**Então** o rascunho deverá ser salvo automaticamente.

## AC-DRF-002

**Dado** rascunho salvo  
**Quando** o usuário reabrir o formulário  
**Então** deverá poder continuar de onde parou.

## AC-DRF-003

**Dado** rascunho não concluído  
**Quando** existir autosave  
**Então** ele não deverá alterar histórico, peças ou gastos definitivos.

---

# 34. Saída de formulário

## AC-UX-003

**Dado** alterações ainda não finalizadas  
**Quando** o usuário tentar sair  
**Então** deverá receber aviso.

---

# 35. Toasts

## AC-UX-004

**Dado** operação concluída  
**Quando** mostrar toast  
**Então** ele deverá desaparecer automaticamente após alguns segundos.

## AC-UX-005

**Dado** toast visível  
**Quando** o usuário interagir com a tela  
**Então** o toast não deverá bloquear a interação.

---

# 36. Undo

## AC-UX-006

**Dado** ação reversível  
**Quando** for executada  
**Então** deverá oferecer Desfazer por uma janela curta.

---

# 37. Menus contextuais

## AC-UX-007

**Dado** ações secundárias  
**Quando** houver menu de item  
**Então** deverão ficar disponíveis em `⋮`.

## AC-UX-008

**Dado** ação principal  
**Quando** for central ao fluxo  
**Então** não deverá ficar escondida exclusivamente no menu `⋮`.

---

# 38. Mobile

## AC-MOB-001

**Dado** app em tela mobile  
**Quando** abrir menu  
**Então** ele deverá entrar da direita para a esquerda.

## AC-MOB-002

**Dado** menu aberto  
**Quando** tocar fora, navegar ou usar gesto de fechamento  
**Então** deverá fechar.

## AC-MOB-003

**Dado** um card de lista  
**Quando** o usuário fizer swipe lateral  
**Então** não deverá executar automaticamente editar, excluir ou concluir.

---

# 39. Tema

## AC-THEME-001

**Dado** preferência Sistema  
**Quando** o SO alternar claro/escuro  
**Então** o app deverá acompanhar.

## AC-THEME-002

**Dado** preferência manual Claro ou Escuro  
**Quando** o usuário reabrir o app  
**Então** a preferência deverá permanecer.

---

# 40. Acessibilidade visual

## AC-A11Y-001

**Dado** um estado como Vencida  
**Quando** for exibido  
**Então** não deverá depender somente de cor.

---

# 41. Offline — dispositivo confiável

## AC-OFF-001

**Dado** dispositivo marcado como confiável  
**E** dados previamente sincronizados  
**Quando** a internet cair  
**Então** os dados em cache deverão continuar acessíveis.

## AC-OFF-002

**Dado** dispositivo confiável offline  
**Quando** o usuário fizer alteração suportada  
**Então** ela deverá ficar pendente de sincronização.

## AC-OFF-003

**Dado** alterações pendentes  
**Quando** a conexão retornar  
**Então** deverão ser sincronizadas sem duplicação.

---

# 42. Offline — dispositivo não confiável

## AC-OFF-004

**Dado** dispositivo marcado como não confiável  
**Quando** a sessão terminar  
**Então** o app não deverá prometer persistência offline dos dados privados para a próxima sessão.

---

# 43. Estado de sincronização

## AC-SYNC-001

**Dado** writes locais ainda não confirmados  
**Quando** a UI estiver visível  
**Então** deverá existir indicação de sincronização pendente.

---

# 44. Conflitos

## AC-CONF-001

**Dado** duas versões conflitantes detectadas  
**Quando** o conflito for apresentado  
**Então** o sistema deverá mostrar versão local e remota.

## AC-CONF-002

**Dado** conflito de edição  
**Quando** o usuário resolver  
**Então** deverá poder escolher local, remota ou revisar manualmente.

---

# 45. Segurança

## AC-SEC-001

**Dado** usuário não autenticado  
**Quando** tentar ler Firestore  
**Então** a regra deverá negar.

## AC-SEC-002

**Dado** UID não autorizado  
**Quando** tentar ler ou escrever  
**Então** a regra deverá negar.

## AC-SEC-003

**Dado** UID autorizado  
**Quando** realizar operação permitida  
**Então** a regra deverá autorizar.

## AC-SEC-004

**Dado** build de produção  
**Quando** inspecionar o repositório  
**Então** não deverão existir chaves privadas, service account JSON ou credenciais administrativas versionadas.

---

# 46. GitHub Pages

## AC-DEP-001

**Dado** build de produção  
**Quando** publicado no GitHub Pages  
**Então** deverá funcionar em:

`/manutencao_carro/`

## AC-DEP-002

**Dado** uma rota interna  
**Quando** recarregar a página  
**Então** o HashRouter deverá evitar erro 404.

---

# 47. PWA

## AC-PWA-001

**Dado** navegador compatível  
**Quando** acessar o app  
**Então** deverá ser instalável como PWA.

## AC-PWA-002

**Dado** nova versão disponível  
**Quando** o app estiver em uso  
**Então** não deverá recarregar automaticamente durante formulário ativo.

---

# 48. Performance

## AC-PERF-001

**Dado** histórico grande  
**Quando** abrir timeline  
**Então** não deverá carregar indefinidamente todos os registros de uma vez.

## AC-PERF-002

**Dado** Dashboard carregando  
**Quando** os dados ainda não estiverem disponíveis  
**Então** deverá usar skeleton ou feedback equivalente.

---

# 49. Critérios mínimos para release

A versão inicial só deverá ser considerada pronta quando:

1. autenticação estiver restrita às contas autorizadas;
2. Security Rules tiverem testes automatizados;
3. KM regressivo estiver bloqueado;
4. recorrência por KM/data estiver correta;
5. conclusão manual gerar histórico;
6. ciclos independentes funcionarem;
7. peças puderem ser instaladas, substituídas e removidas;
8. peça essencial faltando gerar alerta não silenciável;
9. alertas por KM/data funcionarem;
10. central de alertas funcionar;
11. garantias funcionarem;
12. documentos anuais preservarem histórico;
13. gastos e estornos calcularem valores corretamente;
14. rascunhos funcionarem;
15. offline funcionar em dispositivo confiável;
16. conflito detectável não for sobrescrito silenciosamente;
17. PWA estiver instalável;
18. GitHub Pages estiver publicando corretamente;
19. testes críticos de domínio passarem;
20. testes E2E mínimos passarem.

---

# 50. Regra final de aceite

```text
Se um comportamento contradizer
Business Rules,
User Flows,
Edge Cases
ou estes Acceptance Criteria,
a implementação não deverá ser considerada concluída.
```
