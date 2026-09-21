# Carango Véio — Pendências de Implementação em Relação ao SDD

## 1. Objetivo

Este documento registra funcionalidades, regras de negócio e comportamentos que já haviam sido definidos no SDD do Carango Véio, mas que, na auditoria da implementação atual, foram encontrados como ausentes, parciais ou divergentes.

Ele deve ser tratado como checklist de correção da V1, sem substituir os documentos originais do SDD.

Fontes de verdade relacionadas:

- docs/01-functional-requirements.md
- docs/02-business-rules.md
- docs/05-screens.md
- docs/06-user-flows.md
- docs/08-ux-behavior.md
- docs/09-alert-system.md
- docs/10-automations.md
- docs/12-edge-cases.md
- docs/13-acceptance-criteria.md
- tasks/README.md

## 2. Regra geral de implementação

Não simplificar uma decisão já documentada apenas para reduzir escopo.

Uma funcionalidade não deve ser considerada concluída somente porque existe uma tela, um tipo de domínio, um campo no banco ou uma função isolada. O fluxo deve funcionar de ponta a ponta na interface, persistir os dados corretamente, recalcular derivados quando necessário e possuir testes compatíveis.

### 2.1 Tasks

Se qualquer GAP abaixo exigir trabalho que não caiba claramente nas tasks existentes, o Codex DEVE criar novas tasks em tasks/, com dependências, escopo e critérios de aceite explícitos, e atualizar tasks/README.md.

Não omitir um GAP apenas porque não existe uma task pronta para ele.

---

# 3. Prioridade crítica

## GAP-001 — Conclusão de manutenção incompleta

### Esperado

A conclusão deve registrar:

- data real;
- KM real;
- oficina/prestador;
- observações;
- múltiplas ações de peças;
- custos separados;
- garantia;
- prévia do próximo ciclo antes da confirmação.

Ações de peça permitidas na mesma manutenção:

- instalar;
- substituir;
- remover;
- inspecionar;
- reparar.

### Estado atual auditado

O fluxo possui apenas data, KM, prestador e um campo genérico de custo total.

### Ação

Implementar o fluxo completo previsto em docs/05-screens.md e docs/06-user-flows.md.

---

## GAP-002 — Custos estão sendo classificados incorretamente

### Estado atual auditado

O valor informado como "Custo total" é persistido como mão de obra, com peças e outros zerados.

### Esperado

Separar:

- partsTotalCents;
- laborCostCents;
- otherCostCents;
- total calculado;
- total manual opcional;
- flag de override.

Nunca inferir que o total inteiro é mão de obra.

---

## GAP-003 — Fluxo operacional de peças ausente

O Hub de Peças não deve ser somente consulta.

Implementar:

- instalar peça;
- substituir peça;
- remover;
- descartar;
- inspecionar;
- reparar;
- editar peça atual;
- marcar componente como Não se aplica;
- retornar componente para estado aplicável.

Na substituição:

- peça antiga -> replaced;
- peça nova -> installed;
- ComponentState.currentPartInstanceId -> nova peça;
- histórico preservado.

Na remoção sem substituição:

- currentPartInstanceId vazio;
- componente essencial -> missing;
- componente não essencial -> unknown ou estado aplicável.

---

## GAP-004 — Problemas sem CRUD/fluxo completo

Implementar:

- criar;
- abrir detalhe;
- editar;
- prioridade;
- estados;
- adiar;
- iniciar;
- resolver;
- ignorar;
- associar componente;
- associar peça;
- associar manutenção corretiva.

Estados previstos:

- Identificado;
- Pendente;
- Em andamento;
- Adiado;
- Resolvido;
- Ignorado / Não será feito.

Ao concluir manutenção ligada a problema, perguntar se ele deve ser marcado como resolvido.

O botão "Abrir" da lista de problemas deve possuir ação real.

---

## GAP-005 — Inspeções sem fluxo próprio

Implementar criação e conclusão de inspeções com:

- data/KM reais;
- resultado;
- observações;
- recorrência;
- próximo ciclo;
- histórico;
- possibilidade de criar problema derivado do resultado.

Concluir inspeção não equivale a trocar peça.

Ciclo de inspeção deve permanecer independente de ciclo de substituição.

---

## GAP-006 — Garantias sem cadastro/edição completos

Garantias devem funcionar para:

- peça;
- serviço.

Suportar:

- início e fim por data;
- início e fim por KM;
- combinação de data + KM;
- prestador/fornecedor;
- termos;
- URL/documento;
- criação;
- edição;
- vínculo com peça ou ocorrência;
- estado e alertas.

---

## GAP-007 — Bug no vencimento de garantia por data

### Estado atual auditado

A lógica usa condição equivalente a days < -7 para considerar garantia expirada por data.

### Regra correta

Ao atingir a data de vencimento:

```text
days <= 0
=> expired
```

Garantia vencida hoje ou em qualquer data passada deve ficar vencida imediatamente.

---

## GAP-008 — Cadastro retroativo de manutenção bloqueado por KM atual

### Regra já definida

Exemplo válido:

```text
KM atual: 160.000
Manutenção histórica: 151.200
=> permitido
```

### Estado atual auditado

O campo de KM da conclusão usa a quilometragem atual como mínimo.

### Ação

A regra de não regressão se aplica à NOVA LEITURA ATUAL do odômetro, não a eventos históricos.

Cadastro histórico:

- pode ter KM menor que o atual;
- não altera o KM atual automaticamente;
- entra na timeline pela data real do evento.

---

## GAP-009 — Escritas remotas confirmadas na UI antes do Firestore

### Estado atual auditado

Há mutações usando chamadas assíncronas sem aguardar sua conclusão, seguidas de mensagem de sucesso.

### Esperado

Para mutações relevantes:

1. iniciar gravação;
2. exibir saving;
3. impedir envio duplicado;
4. aguardar confirmação;
5. tratar erro;
6. somente então confirmar sucesso remoto.

Offline:

- indicar pendente de sincronização;
- não afirmar que foi sincronizado;
- impedir ocorrência duplicada após reconexão.

---

# 4. Prioridade alta

## GAP-010 — Estornos sem interface

O domínio financeiro já possui suporte parcial, porém falta fluxo de usuário.

Implementar:

- registrar estorno total;
- registrar estorno parcial;
- editar estorno;
- remover estorno;
- observação.

Regras:

- parcial: maior que zero e menor que o valor efetivo;
- total: igual ao valor efetivo;
- nunca gerar despesa negativa.

Exibir:

- valor original;
- valor estornado;
- impacto líquido;
- Normal / Parcialmente estornada / Estornada.

Estorno não desfaz manutenção, peça, garantia ou problema.

---

## GAP-011 — Recorrência temporal limitada a meses na UI

O domínio prevê:

- dias;
- meses;
- anos.

A interface deve permitir as três unidades.

Para KM ou tempo, exigir os dois critérios.

Bloquear zero e valores negativos.

---

## GAP-012 — Estado Pendente de manutenção ausente/incompleto

A manutenção deve poder representar:

- OK;
- Próxima;
- Vencida;
- Pendente;
- Em andamento.

Plano sem vencimento automático pode permanecer como pendência manual.

Pendente não deve ser tratado como OK.

---

## GAP-013 — Abas Pendentes e Inspeções ausentes

Adicionar à área de Manutenções:

- Pendentes;
- Inspeções.

Contadores e filtros devem refletir os dados reais.

---

## GAP-014 — Histórico de KM sem edição

Leituras históricas devem poder ser:

- editadas;
- excluídas.

Após alteração, recalcular:

- KM atual quando aplicável;
- estados de manutenção;
- garantias;
- alertas.

---

## GAP-015 — Data de nova leitura de KM deveria ser opcional

Regra definida:

- KM obrigatório;
- data opcional;
- se vazia, usar data atual;
- observação opcional.

A interface atual não deve exigir data quando o comportamento previsto permite vazio.

---

## GAP-016 — Documentos com formulário incompleto

Campos previstos:

- tipo;
- tipo personalizado;
- nome;
- número/referência;
- ano de referência;
- data de emissão;
- vencimento;
- valor;
- situação;
- URL;
- observações.

Implementar criação, edição, alteração de status e exclusão conforme regras.

Status:

- pending;
- paid;
- expired;
- active.

Documento não deve nascer forçosamente pending quando o usuário informa outra situação.

---

## GAP-017 — Histórico unificado incompleto

A timeline deve considerar, conforme aplicável:

- manutenção;
- inspeção;
- instalação de peça;
- substituição;
- remoção;
- reparo;
- problema;
- documento;
- garantia;
- quilometragem;
- gasto.

Filtros previstos:

- tipo;
- período;
- sistema;
- componente;
- peça;
- posição;
- manutenção;
- problema.

Não duplicar dados manualmente apenas para alimentar a timeline.

---

## GAP-018 — Edição histórica e recomposição ausentes

Ao editar evento-base:

```text
Salvar
-> identificar dependências
-> recalcular apenas ciclos relacionados
-> recalcular estados
-> recalcular alertas
-> recalcular gastos quando aplicável
```

Ao excluir evento histórico com dependências posteriores ambíguas:

- bloquear exclusão;
- informar dependências;
- não reconstruir silenciosamente uma história diferente.

---

## GAP-019 — Conflitos entre as duas contas não tratados

O modelo já possui revision, updatedAt e updatedBy, mas a auditoria não encontrou resolução de conflitos funcional.

Quando houver conflito detectável:

- preservar versão local;
- preservar versão remota;
- mostrar campos divergentes;
- mostrar data e responsável;
- permitir manter local;
- permitir manter remota;
- permitir revisão manual.

Rascunho local não pode ser descartado silenciosamente.

---

# 5. Prioridade média

## GAP-020 — Snooze não retira alerta da lista ativa

### Estado atual auditado

snoozedUntilDate é salvo, mas o alerta continua aparecendo e sendo contado.

### Esperado

Enquanto hoje < snoozedUntilDate:

- não mostrar na lista de alertas ativos;
- não contar no badge ativo;
- preservar o alerta internamente.

Depois do prazo, reaparecer somente se a causa ainda existir.

---

## GAP-021 — Ocultar alerta incompleto

Adicionar ocultação quando permitido.

Regras:

- peça faltando essencial não pode ser ocultada;
- alerta ocultado permanece rastreável;
- mudança material para condição mais grave pode gerar novo alerta quando previsto.

---

## GAP-022 — Alertas sem contexto suficiente

Alertas combinados devem informar, quando disponíveis:

- KM restante ou atraso;
- dias restantes ou atraso;
- critério mais urgente;
- componente;
- prioridade.

Evitar texto genérico quando o dado real pode ser calculado.

Exemplo:

```text
Faltam 800 km ou 43 dias
```

ou:

```text
Vencida há 320 km
```

---

## GAP-023 — Indicadores derivados de peças incompletos

Quando houver dados suficientes, mostrar:

- tempo desde instalação;
- KM desde instalação;
- número de inspeções;
- número de manutenções relacionadas;
- custo inicial;
- custo acumulado do componente;
- garantia atual;
- recorrências ativas;
- estado atual.

Quando faltar informação, usar "Desconhecido" ou "Informação insuficiente", não zero.

---

## GAP-024 — Busca e filtros de peças incompletos

Busca deve considerar:

- componente;
- marca;
- modelo;
- código;
- sistema;
- posição.

Filtros previstos:

- categoria;
- sistema;
- posição;
- estado;
- possui histórico;
- possui garantia;
- garantia próxima;
- possui recorrência;
- possui alerta;
- peça faltando.

---

## GAP-025 — Persistência de filtros parcial

A configuração persistentFilters deve realmente controlar a persistência dos filtros.

Persistir, conforme aplicável:

- filtros;
- busca;
- ordenação;
- modo de visualização;
- aba ativa.

Oferecer:

- Limpar filtros;
- Restaurar padrão.

---

## GAP-026 — Autosave de rascunhos incompleto

Aplicar pelo menos a:

- Nova manutenção;
- Concluir manutenção;
- Novo problema;
- Novo documento;
- Editar peça;
- Editar veículo;
- formulários extensos equivalentes.

Rascunho não deve:

- gerar histórico;
- alterar peças;
- gerar custos;
- recalcular recorrência;
- gerar alertas definitivos.

Mostrar discretamente "Salvando..." / "Rascunho salvo".

---

## GAP-027 — Saída de formulário sem proteção adequada

Se houver alterações relevantes ainda não finalizadas:

- avisar antes de sair;

ou, se o rascunho estiver seguro:

- informar que poderá ser retomado.

Não perder dados digitados silenciosamente.

---

## GAP-028 — Loading e proteção contra envio duplicado

Padronizar operações de:

- criar;
- salvar;
- concluir;
- excluir;
- ações equivalentes.

Durante a escrita:

- botão em loading;
- botão desabilitado;
- impedir segundo submit.

---

# 6. Dashboard e financeiro

## GAP-029 — Dashboard deve usar somente dados reais

Revisar blocos de:

- documentos;
- garantias;
- custos;
- problemas;
- peças faltando;
- manutenções.

Não usar texto fixo que pareça representar uma entidade real quando não existe registro correspondente.

---

## GAP-030 — Financeiro sem todas as visões previstas

Adicionar, conforme SDD:

- histórico;
- por categoria;
- por manutenção;
- por peça/componente;
- por sistema;
- por período;
- visão anual;
- visão mensal;
- últimos 12 meses quando aplicável.

Não calcular custo por KM.

---

# 7. Testes obrigatórios

Adicionar/atualizar testes para cobrir no mínimo:

## Manutenção

- KM;
- tempo;
- combinado;
- conclusão real;
- múltiplas peças;
- retroativo;
- pendente;
- inspeção.

## Peças

- instalar;
- substituir;
- remover;
- essencial faltando;
- Não se aplica;
- rollback permitido;
- bloqueio por dependência posterior.

## Financeiro

- peças;
- mão de obra;
- outros;
- override;
- estorno parcial;
- estorno total;
- remoção de estorno.

## Garantia

- vencida por data;
- vencida por KM;
- combinada;
- próxima.

## Alertas

- próximo;
- vencido;
- snooze;
- ocultação;
- essencial não adiável;
- causa resolvida.

## Documentos

- pending;
- paid;
- active;
- expired;
- personalizado.

## Concorrência

- revision válida;
- conflito detectado;
- preservação das duas versões.

## Offline

- operação pendente;
- reconexão;
- prevenção de duplicata;
- erro de persistência.

---

# 8. Definition of Done

Um GAP só pode ser marcado como concluído quando:

1. fluxo funcional existe na interface;
2. regra de domínio está implementada;
3. dados são persistidos corretamente;
4. derivados e alertas são recalculados quando aplicável;
5. histórico é atualizado quando aplicável;
6. erros de persistência são tratados;
7. não há envio duplicado;
8. desktop e mobile permanecem funcionais;
9. build e typecheck passam;
10. testes relevantes passam;
11. comportamento corresponde ao SDD;
12. não existe botão sem ação real;
13. não existe campo que o SDD exige editar sem fluxo de edição;
14. não existe recurso "implementado" apenas no domínio quando deveria ser utilizável na UI.

---

# 9. Ordem sugerida

1. Conclusão de manutenção.
2. Custos separados.
3. Ações de peças.
4. Problemas.
5. Inspeções.
6. Garantias.
7. Cadastro retroativo.
8. Escritas remotas/sincronização.
9. Estornos.
10. Recorrência em dias/meses/anos.
11. Documentos completos.
12. Histórico e edição histórica.
13. Snooze/ocultação.
14. Conflitos.
15. Filtros/persistência.
16. Indicadores derivados.
17. Dashboard/financeiro.
18. Ampliação dos testes.

---

# 10. Instrução final ao Codex

Antes de implementar cada GAP:

1. ler os documentos do SDD relacionados;
2. verificar dependências existentes;
3. não substituir uma regra documentada por versão simplificada;
4. preservar compatibilidade dos dados já existentes;
5. criar migração quando necessário;
6. criar ou atualizar testes;
7. atualizar documentação somente para esclarecer, sem mudar silenciosamente decisões do produto.

Se o trabalho exigir novas tasks, CRIAR as tasks correspondentes em tasks/, adicionar dependências e critérios de aceite e atualizar tasks/README.md.

Ao final, entregar relatório com:

- GAPs concluídos;
- arquivos alterados;
- testes adicionados;
- migrações realizadas;
- novas tasks criadas;
- GAPs ainda pendentes;
- riscos ou limitações restantes.

Não declarar a V1 concluída enquanto houver GAP sem implementação funcional ou sem justificativa explícita documentada.
