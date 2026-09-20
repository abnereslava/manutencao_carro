# Carango Véio — Modelo de Dados

## 1. Objetivo deste documento

Este documento define o modelo conceitual de dados do Carango Véio.

Ele descreve:

- entidades;
- campos;
- relações;
- cardinalidades;
- dados derivados;
- regras de persistência;
- auditoria;
- histórico;
- comportamento de custos;
- agrupamento lógico de informações.

A implementação técnica definitiva no Firebase será detalhada posteriormente na arquitetura técnica.

---

# 2. Princípios do modelo

## DM-GEN-001 — Separar estado atual de histórico

O sistema deverá distinguir claramente:

- o estado atual do veículo;
- o histórico do que já aconteceu.

## DM-GEN-002 — Componentes são permanentes

Componentes estruturais do veículo existem independentemente de uma peça específica estar instalada.

## DM-GEN-003 — Peças são instâncias

Uma peça específica instalada no carro deverá ser tratada como uma instância histórica vinculada a um componente.

## DM-GEN-004 — Manutenção é o evento central de mudança

Mudanças como:

- instalação;
- substituição;
- remoção;
- inspeção;
- reparo;

deverão ser registradas a partir de uma manutenção ou ocorrência relacionada.

## DM-GEN-005 — Dados derivados não substituem dados-base

Informações calculadas como:

- próximo vencimento;
- status;
- alerta;
- total calculado;

deverão ser deriváveis a partir dos registros-base.

---

# 3. Entidades principais

A versão inicial deverá trabalhar conceitualmente com as seguintes entidades:

1. AppSettings
2. Vehicle
3. OdometerRecord
4. ComponentDefinition
5. ComponentState
6. PartInstance
7. MaintenancePlan
8. MaintenanceOccurrence
9. Issue
10. Warranty
11. ExpenseBreakdown
12. DocumentRecord
13. ExternalLink
14. AuditMetadata

---

# 4. AppSettings

Representa configurações globais da aplicação.

## Campos

- `id`
- `alertKmThreshold`
- `alertDaysThreshold`
- `persistentFilters`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

## Valores iniciais

- `alertKmThreshold = 1000`
- `alertDaysThreshold = 60`

## Observações

A aplicação possui apenas um contexto lógico de usuário, compartilhado pelas duas contas autorizadas.

---

# 5. Vehicle

Representa o veículo principal do sistema.

## Campos

- `id`
- `manufacturer`
- `model`
- `trim`
- `year`
- `modelYear`
- `engine`
- `fuelType`
- `color`
- `plate`
- `renavam`
- `chassis`
- `currentOdometer`
- `imageUrl`
- `observations`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

## Regras

A versão inicial terá somente um veículo.

---

# 6. OdometerRecord

Representa uma leitura real de quilometragem informada pelo usuário.

## Campos

- `id`
- `vehicleId`
- `odometerKm`
- `recordedDate`
- `observations`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

## Regras

- cada leitura deve permanecer historicamente disponível;
- a data pode ser informada manualmente;
- se não informada, deverá usar a data do registro;
- leituras poderão ser editadas ou excluídas;
- alterações deverão disparar recálculos dependentes.

---

# 7. ComponentDefinition

Representa um componente estrutural hardcoded do Renault Sandero Expression 2012 1.6 8V.

Exemplos:

- Bateria
- Alternador
- Correia dentada
- Pastilha de freio dianteira
- Amortecedor dianteiro esquerdo

## Campos

- `id`
- `name`
- `category`
- `system`
- `positionId`
- `isEssential`
- `isOptional`
- `searchTerms`
- `defaultMaintenanceHints`
- `sortOrder`

## Regras

- a lista será hardcoded;
- não haverá criação manual pela interface;
- se um componente faltar, deverá ser adicionado no código;
- componentes poderão existir sem histórico ou peça instalada.

---

# 8. ComponentState

Representa o estado atual de um componente no carro.

## Campos

- `id`
- `componentDefinitionId`
- `currentPartInstanceId`
- `state`
- `observations`
- `updatedAt`
- `updatedBy`

## Valores possíveis de `state`

- `installed`
- `missing`
- `unknown`

## Significados

### installed

Existe uma peça atualmente instalada.

### missing

O componente deveria possuir uma peça, mas está sem peça instalada.

### unknown

O componente existe no catálogo, mas não há informação suficiente sobre seu estado atual.

---

# 9. PartInstance

Representa uma peça específica que esteve ou está instalada no veículo.

## Campos

- `id`
- `componentDefinitionId`
- `name`
- `manufacturer`
- `brand`
- `model`
- `partCode`
- `conditionAtInstall`
- `installDate`
- `installOdometerKm`
- `removalDate`
- `removalOdometerKm`
- `removalReason`
- `replacedByPartInstanceId`
- `status`
- `supplier`
- `purchasePrice`
- `warrantyId`
- `imageUrl`
- `invoiceUrl`
- `productUrl`
- `manufacturerUrl`
- `observations`
- `installationOccurrenceId`
- `removalOccurrenceId`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`
- `archivedAt`
- `archivedBy`

## Valores possíveis de `status`

- `installed`
- `replaced`
- `removed_discarded`

## Regras

- uma peça pode ser cadastrada sem data ou KM de instalação;
- campos desconhecidos deverão ser opcionais;
- peças removidas não fazem parte de estoque;
- peças substituídas permanecem somente como histórico;
- remoção deverá estar ligada a uma ocorrência de manutenção;
- `removalOccurrenceId` deverá existir quando houver remoção/substituição;
- `replacedByPartInstanceId` é opcional;
- `removalDate`, `removalOdometerKm` e `removalReason` são opcionais.

---

# 10. MaintenancePlan

Representa um plano ativo de manutenção.

Exemplos:

- Trocar óleo
- Inspecionar bateria
- Substituir bateria
- Verificar pastilhas

## Campos

- `id`
- `title`
- `type`
- `componentDefinitionId`
- `relatedPartInstanceId`
- `description`
- `priority`
- `status`
- `recurrenceType`
- `intervalKm`
- `intervalDays`
- `intervalMonths`
- `intervalYears`
- `nextDueKm`
- `nextDueDate`
- `isActive`
- `observations`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`
- `archivedAt`
- `archivedBy`

## Tipos possíveis

- `preventive_recurring`
- `preventive_one_time`
- `corrective`
- `inspection`

## Recorrência

- `none`
- `km`
- `time`
- `km_or_time`

---

# 11. MaintenanceOccurrence

Representa uma execução real ou ocorrência concluída de manutenção.

## Campos

- `id`
- `maintenancePlanId`
- `performedDate`
- `odometerKm`
- `status`
- `workshopOrProvider`
- `observations`
- `expenseBreakdownId`
- `warrantyId`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`
- `archivedAt`
- `archivedBy`

## Relações auxiliares

Uma ocorrência poderá possuir múltiplas relações com peças.

Estrutura conceitual:

```text
MaintenanceOccurrence
│
├── installedParts[]
├── replacedParts[]
├── removedParts[]
└── inspectedParts[]
```

## Regras

- é a entidade principal de histórico de manutenção;
- conclusão deverá ser explícita;
- edição deverá recalcular apenas ciclos dependentes;
- remoção ou substituição de peça deverá ocorrer através desta entidade.

---

# 12. MaintenanceOccurrencePart

Entidade de relacionamento entre manutenção e peças.

## Campos

- `id`
- `maintenanceOccurrenceId`
- `partInstanceId`
- `action`
- `observations`

## Valores de `action`

- `installed`
- `replaced`
- `removed`
- `inspected`
- `repaired`

## Regras

Uma manutenção poderá envolver várias peças.

---

# 13. Issue

Representa problema ou defeito identificado.

## Campos

- `id`
- `title`
- `description`
- `componentDefinitionId`
- `relatedPartInstanceIds`
- `relatedMaintenancePlanId`
- `relatedMaintenanceOccurrenceId`
- `priority`
- `status`
- `identifiedDate`
- `identifiedOdometerKm`
- `resolvedDate`
- `observations`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`
- `archivedAt`
- `archivedBy`

## Status

- `identified`
- `pending`
- `in_progress`
- `postponed`
- `resolved`
- `ignored`

---

# 14. Warranty

Representa garantia de peça ou serviço.

## Campos

- `id`
- `type`
- `partInstanceId`
- `maintenanceOccurrenceId`
- `startDate`
- `startOdometerKm`
- `endDate`
- `endOdometerKm`
- `provider`
- `terms`
- `documentUrl`
- `observations`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

## Tipos

- `part`
- `service`

## Regras

- poderá usar data;
- poderá usar KM;
- poderá usar ambos;
- vence pelo primeiro limite atingido.

---

# 15. ExpenseBreakdown

Representa os custos de uma manutenção.

## Campos

- `id`
- `maintenanceOccurrenceId`
- `partsTotalCalculated`
- `laborCost`
- `otherCost`
- `calculatedTotal`
- `manualTotal`
- `manualOverrideEnabled`
- `effectiveTotal`
- `observations`

## Regras de cálculo

```text
calculatedTotal =
  partsTotalCalculated
  + laborCost
  + otherCost
```

Quando `manualOverrideEnabled = false`:

```text
effectiveTotal = calculatedTotal
```

Quando `manualOverrideEnabled = true`:

```text
effectiveTotal = manualTotal
```

## Regras de interface

Quando houver sobrescrita manual:

- o sistema deverá destacar que o total foi alterado manualmente;
- o valor calculado original deverá continuar visível;
- o sistema não deverá apagar o valor calculado.

---

# 16. PartCostEntry

Representa o custo individual de uma peça dentro da manutenção.

## Campos

- `id`
- `expenseBreakdownId`
- `partInstanceId`
- `description`
- `unitCost`
- `quantity`
- `subtotal`

## Regra

```text
subtotal = unitCost * quantity
```

## Comportamento

O usuário poderá:

- registrar apenas o total geral da manutenção;
- registrar custos por peça;
- registrar mão de obra;
- registrar outros custos;
- combinar detalhamento e total manual.

---

# 17. Workshop / Provider como texto reutilizável

Não haverá entidade própria obrigatória para oficinas ou prestadores.

## Comportamento

O campo deverá:

- aceitar texto livre;
- sugerir valores já utilizados;
- permitir reutilização por autocomplete;
- não exigir cadastro prévio;
- não possuir tela própria de administração.

## Persistência

Os valores reutilizados poderão ser derivados dos registros históricos existentes.

---

# 18. Marca / fabricante como texto reutilizável

Marcas e fabricantes seguirão a mesma regra de oficina/prestador.

## Comportamento

- texto livre;
- autocomplete com valores já usados;
- sem entidade administrativa própria;
- sem cadastro obrigatório.

---

# 19. DocumentRecord

Representa documento, imposto, seguro ou registro anual.

## Campos

- `id`
- `type`
- `customTypeName`
- `referenceYear`
- `name`
- `referenceNumber`
- `issueDate`
- `dueDate`
- `amount`
- `status`
- `documentUrl`
- `observations`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`
- `archivedAt`
- `archivedBy`

## Tipos iniciais

- `ipva`
- `licensing`
- `insurance`
- `custom`

## Regras

Cada ano deverá gerar registro independente.

Exemplo:

```text
IPVA 2026
IPVA 2027
IPVA 2028
```

Registros anteriores não deverão ser sobrescritos.

---

# 20. ExternalLink

Representa URL externa associada a uma entidade.

## Campos

- `id`
- `entityType`
- `entityId`
- `label`
- `url`
- `createdAt`
- `createdBy`

## Possíveis usos

- imagem;
- nota fiscal;
- comprovante;
- fabricante;
- produto;
- documento;
- garantia.

## Regra

O sistema não fará upload próprio de arquivos na primeira versão.

---

# 21. Observations

Cada entidade principal deverá possuir um único campo:

`observations`

Esse campo será texto livre.

## Não haverá

- coleção separada de notas;
- sistema de comentários;
- múltiplas notas independentes por entidade.

---

# 22. Log derivado de histórico

O sistema deverá montar logs cronológicos a partir dos próprios registros existentes.

## Exemplos de agrupamento

- por componente;
- por tipo de peça;
- por sistema;
- por categoria;
- por posição;
- por área do veículo.

## Exemplo

```text
Suspensão dianteira

2026 — Amortecedor substituído
Observação:
"Batida seca ao passar em lombadas."

2027 — Inspeção realizada
Observação:
"Sem vazamento, mas com leve desgaste."

2028 — Bucha substituída
Observação:
"Folga confirmada na revisão."
```

## Regra

Esse log deverá ser uma visualização derivada.

Não deverá existir uma entidade `NoteLog` própria.

---

# 23. Auditoria

Todas as entidades mutáveis relevantes deverão possuir metadados de auditoria.

## Campos básicos

- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

## Campos de arquivamento

Quando aplicável:

- `archivedAt`
- `archivedBy`

## createdBy / updatedBy

Deverão identificar qual das duas contas autorizadas realizou a operação.

## Objetivo

Permitir saber:

- quando algo foi criado;
- por quem;
- quando foi alterado;
- por quem;
- quando foi arquivado;
- por quem.

---

# 24. Dados derivados

Os seguintes campos deverão ser considerados derivados sempre que possível:

- `Vehicle.currentOdometer`
- `MaintenancePlan.nextDueKm`
- `MaintenancePlan.nextDueDate`
- `MaintenancePlan.status`
- `ExpenseBreakdown.partsTotalCalculated`
- `ExpenseBreakdown.calculatedTotal`
- `ExpenseBreakdown.effectiveTotal`
- estados de alerta;
- estados de garantia;
- estado agregado do componente.

## Regra

Campos derivados poderão ser persistidos por performance, mas deverão sempre ser recalculáveis a partir dos dados-base.

---

# 25. Relações principais

```text
Vehicle
│
├── OdometerRecord[]
│
├── ComponentDefinition[]
│   └── ComponentState
│       └── currentPartInstanceId
│
├── PartInstance[]
│
├── MaintenancePlan[]
│   └── MaintenanceOccurrence[]
│       ├── MaintenanceOccurrencePart[]
│       ├── ExpenseBreakdown
│       └── Warranty
│
├── Issue[]
│
├── Warranty[]
│
└── DocumentRecord[]
```

---

# 26. Cardinalidades

## Vehicle → OdometerRecord

```text
1 : N
```

## ComponentDefinition → PartInstance

```text
1 : N
```

## ComponentDefinition → ComponentState

```text
1 : 1
```

## MaintenancePlan → MaintenanceOccurrence

```text
1 : N
```

## MaintenanceOccurrence → PartInstance

```text
N : N
```

via `MaintenanceOccurrencePart`.

## MaintenanceOccurrence → ExpenseBreakdown

```text
1 : 0..1
```

## PartInstance → Warranty

```text
1 : 0..N
```

## MaintenanceOccurrence → Warranty

```text
1 : 0..N
```

---

# 27. Regras de integridade

## DM-INT-001

Uma peça com status `installed` deverá pertencer a um componente válido.

## DM-INT-002

Um componente não deverá possuir mais de uma peça atual na mesma função/posição, salvo se o catálogo estrutural explicitamente permitir multiplicidade.

## DM-INT-003

Uma peça marcada como `replaced` não poderá continuar sendo a peça atual do componente.

## DM-INT-004

Uma peça marcada como `removed_discarded` não poderá continuar sendo a peça atual.

## DM-INT-005

Se um componente essencial não possuir peça atual, deverá ficar em estado `missing`.

## DM-INT-006

Uma substituição deverá possuir ocorrência de manutenção associada.

## DM-INT-007

Uma remoção deverá possuir ocorrência de manutenção associada.

## DM-INT-008

O histórico não deverá depender exclusivamente do estado atual.

---

# 28. Modelo de remoção e substituição

## Substituição

```text
MaintenanceOccurrence
        ↓
Peça antiga
status = replaced

Peça nova
status = installed

ComponentState.currentPartInstanceId
        ↓
Peça nova
```

## Remoção sem substituição

```text
MaintenanceOccurrence
        ↓
Peça antiga
status = removed_discarded

ComponentState.currentPartInstanceId = null

Se essencial:
ComponentState.state = missing
```

---

# 29. Registro inicial de peça com dados desconhecidos

O sistema deverá aceitar:

```text
Componente:
Alternador

Peça:
Instalada

Marca:
Desconhecida

Data de instalação:
Desconhecida

KM de instalação:
Desconhecida
```

## Regra

Campos desconhecidos não deverão impedir o cadastro.

---

# 30. Histórico documental

Documentos anuais deverão permanecer independentes.

Exemplo:

```text
Licenciamento
├── 2026
├── 2027
└── 2028
```

Uma nova ocorrência anual não deverá substituir a anterior.

---

# 31. Histórico financeiro

Os resumos financeiros deverão ser derivados de:

- `ExpenseBreakdown.effectiveTotal`
- valores documentais relevantes;
- demais gastos pertencentes ao escopo.

Quando houver total manual sobrescrito, o resumo deverá usar:

```text
effectiveTotal
```

e não `calculatedTotal`.

---

# 32. Exclusão e arquivamento

## Registros ativos

Itens ainda não históricos poderão ser excluídos conforme regras funcionais.

## Registros históricos

Deverão preferencialmente ser arquivados.

## Auditoria

Arquivamento deverá registrar:

- `archivedAt`
- `archivedBy`

## Exclusão definitiva

Quando permitida, deverá respeitar regras de dependência.

---

# 33. Estrutura de identificação

Cada entidade persistida deverá possuir um identificador único estável.

IDs não deverão depender de:

- nome;
- título;
- marca;
- posição;
- texto visível.

---

# 34. Preparação para expansão futura

Embora a versão inicial tenha:

- um único usuário lógico;
- um único veículo;

as entidades principais deverão possuir estrutura que permita futura associação a:

- `ownerId`
- `vehicleId`

sem exigir reestruturação completa.

A implementação inicial não deverá expor recursos multiusuário ou multiveículo na interface.

---

# 35. Resumo do modelo

A estrutura conceitual central deverá seguir:

```text
Componente estrutural
        ↓
Peça instalada
        ↓
Plano de manutenção
        ↓
Ocorrência realizada
        ↓
Histórico
        ↓
Custos / garantia / observações
```

O estado atual deverá ser reconstruível a partir do histórico e das relações persistidas.
