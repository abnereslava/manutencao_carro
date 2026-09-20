# Carango Véio — Automações e Cálculos Derivados

## 1. Objetivo

Este documento define os cálculos e atualizações automáticas do Carango Véio.

O sistema deverá automatizar apenas o que puder ser derivado com segurança dos dados registrados.

Não deverá criar previsões de uso futuro baseadas em médias de rodagem.

---

# 2. Princípio central

## AUT-GEN-001 — Calcular, não adivinhar

O sistema poderá:

- somar;
- comparar;
- recalcular;
- derivar datas;
- derivar quilometragens;
- atualizar estados;
- gerar alertas;
- consolidar histórico.

O sistema não deverá:

- prever quando o carro atingirá determinada quilometragem;
- estimar km/mês;
- estimar km/dia;
- inferir data futura de manutenção baseada em ritmo de uso;
- inventar vida útil restante.

---

# 3. Próxima manutenção por quilometragem

Quando uma manutenção possuir recorrência em KM:

```text
proximoKm =
  kmDaUltimaOcorrenciaValida
  + intervaloKm
```

## Exemplo

```text
Última troca:
148.200 km

Intervalo:
10.000 km

Próxima:
158.200 km
```

O sistema deverá acompanhar esse limite sem estimar em que data ele será atingido.

---

# 4. Próxima manutenção por tempo

Quando houver recorrência temporal:

```text
proximaData =
  dataDaUltimaOcorrenciaValida
  + intervaloTemporal
```

## Exemplo

```text
Última troca:
20/09/2026

Intervalo:
12 meses

Próxima:
20/09/2027
```

Esse cálculo é permitido porque deriva diretamente de uma data e intervalo explícitos.

---

# 5. Recorrência combinada

Quando houver:

- intervalo em KM;
- intervalo em tempo;

o sistema deverá manter os dois limites.

Exemplo:

```text
Próximo KM:
158.200 km

Próxima data:
20/09/2027
```

O vencimento ocorrerá pelo primeiro critério atingido.

---

# 6. Sem previsão de data por KM

Se uma manutenção possuir apenas:

```text
Trocar em 10.000 km
```

o sistema deverá mostrar:

```text
Próxima troca: 158.200 km
```

e não:

```text
Estimativa: novembro/2026
```

Não deverá existir cálculo de tendência de rodagem.

---

# 7. Alertas automáticos

Após qualquer alteração relevante, o sistema deverá recalcular alertas.

Eventos que disparam recálculo:

- atualização de KM;
- edição de KM;
- exclusão de leitura;
- conclusão de manutenção;
- edição histórica;
- exclusão histórica;
- instalação de peça;
- substituição de peça;
- remoção de peça;
- alteração de recorrência;
- alteração de garantia;
- alteração de documento;
- alteração dos limites globais de alerta.

---

# 8. Estados automáticos

O sistema deverá recalcular:

- OK;
- Próxima;
- Vencida;
- Peça faltando;
- garantia próxima;
- garantia vencida;
- documento próximo;
- documento vencido.

Estados derivados deverão sempre refletir os dados-base atuais.

---

# 9. Atualização automática após conclusão

Ao concluir manutenção:

```text
Salvar ocorrência
    ↓
Atualizar histórico
    ↓
Atualizar peças
    ↓
Atualizar custos
    ↓
Atualizar garantia
    ↓
Recalcular ciclo correspondente
    ↓
Recalcular alertas
    ↓
Atualizar Dashboard
```

---

# 10. Atualização automática de componente

Quando uma peça for instalada:

```text
ComponentState.currentPartInstanceId = nova peça
ComponentState.state = installed
```

Quando for removida sem substituição:

```text
currentPartInstanceId = null
```

Se componente essencial:

```text
state = missing
```

Caso contrário:

```text
state = unknown ou estado aplicável
```

---

# 11. Substituição automática

Quando uma peça substituir outra dentro de uma manutenção:

```text
Peça antiga:
status = replaced

Peça nova:
status = installed

Componente:
currentPartInstanceId = nova peça
```

O histórico deverá ser atualizado automaticamente após confirmação.

---

# 12. Indicadores automáticos de peça

Para cada peça atual, quando houver dados suficientes, o sistema deverá calcular:

- tempo desde instalação;
- KM rodados desde instalação;
- número de inspeções;
- número de manutenções relacionadas;
- custo inicial registrado;
- custo acumulado do componente;
- garantia atual;
- estado atual;
- recorrências ativas.

---

# 13. Tempo desde instalação

Se houver `installDate`:

```text
tempoInstalada =
  dataAtual - installDate
```

Apresentações possíveis:

- 32 dias;
- 5 meses;
- 2 anos e 3 meses.

Se a data for desconhecida:

> Tempo instalada: desconhecido

---

# 14. KM desde instalação

Se houver:

- `installOdometerKm`;
- quilometragem atual;

então:

```text
kmDesdeInstalacao =
  currentOdometer - installOdometerKm
```

Se qualquer dado necessário for desconhecido:

> KM desde instalação: desconhecido

---

# 15. Número de inspeções

Deverá ser derivado pela contagem de ocorrências do tipo inspeção ligadas à peça ou componente.

Exemplo:

```text
Inspeções registradas: 4
```

---

# 16. Número de manutenções relacionadas

O sistema deverá poder contar ocorrências de manutenção ligadas ao componente ou peça.

Exemplo:

```text
Manutenções registradas: 7
```

---

# 17. Custo acumulado por componente

O sistema deverá consolidar gastos relacionados ao componente.

Exemplo:

```text
Suspensão dianteira esquerda

Peças: R$ 850
Mão de obra: R$ 420
Outros: R$ 60

Total acumulado:
R$ 1.330
```

O cálculo deverá usar valores efetivos das ocorrências.

---

# 18. Custo da peça atual

Quando disponível, o sistema deverá distinguir:

- preço da peça;
- custo da mão de obra da instalação;
- custo total da manutenção que a instalou.

Não deverá assumir que o custo total da manutenção corresponde apenas à peça.

---

# 19. Gastos — total histórico

```text
totalHistorico =
  soma de todos os effectiveTotal válidos
  + valores documentais relevantes
```

O sistema deverá respeitar overrides manuais.

---

# 20. Gastos — mês atual

Calcular soma de despesas cuja data pertença ao mês corrente.

---

# 21. Gastos — ano atual

Calcular soma de despesas cuja data pertença ao ano corrente.

---

# 22. Gastos — últimos 12 meses

Calcular despesas ocorridas entre:

```text
dataAtual - 12 meses
```

e:

```text
dataAtual
```

---

# 23. Média mensal de gastos

Quando houver período suficiente:

```text
mediaMensal =
  totalNoPeriodo / quantidadeDeMesesDoPeriodo
```

A interface deverá informar claramente qual período está sendo usado.

Não deverá existir custo por KM.

---

# 24. Gastos por categoria

O sistema deverá poder agrupar automaticamente:

- peças;
- mão de obra;
- documentos;
- seguro;
- impostos;
- outros custos válidos.

---

# 25. Gastos por sistema

Deverá ser possível agrupar despesas por sistema do veículo.

Exemplos:

- Motor
- Freios
- Suspensão
- Elétrica

---

# 26. Gastos por componente

Exemplo:

```text
Bateria: R$ 620
Alternador: R$ 980
Freios dianteiros: R$ 1.420
```

---

# 27. Gastos por manutenção

Cada ocorrência deverá poder exibir:

- peças;
- mão de obra;
- outros;
- calculado;
- override manual;
- efetivo.

---

# 28. Sem cálculo de custo por KM

O sistema não deverá calcular:

```text
R$ / km
```

nem qualquer indicador financeiro baseado na distância rodada.

---

# 29. Garantia por data

Quando existir `endDate`:

```text
diasRestantes =
  endDate - dataAtual
```

Se positivo:

- garantia ativa;

se dentro de 60 dias:

- próxima do vencimento;

se zero ou negativo:

- vencida.

---

# 30. Garantia por KM

Quando existir `endOdometerKm`:

```text
kmRestantes =
  endOdometerKm - currentOdometer
```

Se dentro de 1.000 km:

- próxima;

se <= 0:

- vencida.

---

# 31. Garantia combinada

O primeiro critério atingido deverá prevalecer.

O sistema poderá exibir:

> Restam 480 km ou 18 dias.

---

# 32. Documentos por data

Quando houver vencimento:

```text
diasRestantes =
  dueDate - dataAtual
```

O sistema deverá usar a mesma lógica temporal de alertas.

---

# 33. Histórico derivado

A timeline geral deverá ser montada automaticamente a partir de eventos de:

- manutenção;
- inspeção;
- peça;
- problema;
- documento;
- garantia;
- quilometragem;
- gasto.

Não deverá existir necessidade de duplicar manualmente esses registros.

---

# 34. Logs contextuais

O sistema deverá montar automaticamente logs por:

- componente;
- peça;
- sistema;
- categoria;
- posição;
- área do veículo.

---

# 35. Recomposição após edição histórica

Ao editar evento-base:

```text
Salvar alteração
    ↓
Identificar dependências
    ↓
Recalcular somente ciclos relacionados
    ↓
Recalcular estados
    ↓
Recalcular alertas
    ↓
Recalcular gastos, se aplicável
```

---

# 36. Recomposição após exclusão

Ao excluir registro histórico válido:

```text
Localizar ocorrência válida anterior
    ↓
Recalcular ciclo
    ↓
Recalcular estado atual
    ↓
Recalcular alertas
```

Se a exclusão afetar peça atual, deverá exigir fluxo específico de confirmação e recomposição.

---

# 37. Indicadores com dados desconhecidos

Quando dados necessários estiverem ausentes, o sistema deverá exibir:

> Desconhecido

ou:

> Informação insuficiente

conforme o contexto.

Não deverá usar zero como substituto para dado desconhecido.

---

# 38. Peça usada com vida anterior desconhecida

Exemplo:

```text
Pneu usado
Instalado aos 150.000 km
Vida anterior: desconhecida
```

O sistema poderá calcular:

```text
KM rodados desde que entrou neste carro
```

mas não:

```text
KM totais de uso da peça
Vida restante estimada
Percentual restante
```

---

# 39. Peça recondicionada

O sistema deverá tratar o marco de instalação como início do histórico conhecido no Carango Véio.

Não deverá inferir que o recondicionamento equivale automaticamente a uma peça nova.

---

# 40. Atualização de Dashboard

O Dashboard deverá ser derivado dos dados atuais.

Após uma mutação relevante, atualizar:

- KM atual;
- alertas;
- manutenções;
- problemas;
- garantias;
- documentos;
- gastos.

---

# 41. Ordenações automáticas

## Manutenções

Priorizar:

1. peça faltando relacionada;
2. vencidas;
3. próximas;
4. pendentes;
5. demais.

## Alertas

Usar prioridade definida no sistema de alertas.

## Histórico

Mais recente primeiro por padrão.

---

# 42. Resumo financeiro anual

A área Gastos deverá poder gerar automaticamente visão por ano.

Exemplo:

```text
2026
Total: R$ 4.280

Peças: R$ 2.300
Mão de obra: R$ 1.250
Documentos: R$ 730
```

---

# 43. Resumo financeiro mensal

Quando solicitado:

```text
Setembro/2026
Total: R$ 870
```

---

# 44. Dados calculados em tempo real x persistidos

Alguns resultados poderão ser calculados em tempo real ou persistidos por performance.

Independentemente da estratégia:

- deverão ser reproduzíveis;
- não deverão ser fonte exclusiva da verdade;
- deverão poder ser recalculados.

---

# 45. Ordem geral de automação

```text
Entrada do usuário
    ↓
Validar
    ↓
Persistir dado-base
    ↓
Atualizar relações
    ↓
Recalcular derivados
    ↓
Recalcular alertas
    ↓
Recalcular resumos
    ↓
Atualizar UI
```

---

# 46. O que não será automatizado

O sistema não deverá automaticamente:

- concluir manutenção;
- resolver problema;
- substituir peça;
- remover peça;
- criar vida útil restante;
- prever data por média de rodagem;
- gerar custo por KM;
- presumir condição mecânica;
- presumir validade de peça usada.

---

# 47. Regra central

```text
Automatizar matemática e consistência.
Não automatizar fatos físicos que o usuário não confirmou.
```

---

# Automações adicionais — Estornos

## Gasto bruto

```text
grossTotal =
soma dos effectiveTotal originais
```

## Total estornado

```text
refundedTotal =
soma dos refundedAmount
```

## Gasto líquido

```text
netTotal =
grossTotal - refundedTotal
```

O resumo principal deverá usar `netTotal`.

## Estorno parcial

Exemplo:

```text
effectiveTotal = R$ 500
refundedAmount = R$ 150
netAmount = R$ 350
```

## Estorno total

```text
effectiveTotal = R$ 500
refundedAmount = R$ 500
netAmount = R$ 0
```

Não criar valor negativo.

## Indicador separado

A área financeira deverá poder mostrar:

`Total estornado no período`

sem apagar o valor histórico original dos serviços.
