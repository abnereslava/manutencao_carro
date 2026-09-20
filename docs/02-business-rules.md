# Carango Véio — Regras de Negócio

## 1. Objetivo deste documento

Este documento define as regras de negócio que determinam como o Carango Véio deve interpretar datas, quilometragem, recorrências, estados, peças, garantias e alterações históricas.

As regras aqui descritas devem ser tratadas como fonte de verdade para os comportamentos automáticos do sistema.

---

# 2. Princípios gerais

## BR-GEN-001 — Nenhuma manutenção é concluída automaticamente

O sistema nunca deverá considerar que um serviço foi realizado apenas porque:

- uma data chegou;
- uma data passou;
- uma quilometragem foi atingida;
- uma quilometragem foi ultrapassada;
- uma garantia venceu;
- uma peça atingiu uma vida útil estimada.

A conclusão sempre dependerá de ação explícita do usuário.

## BR-GEN-002 — Estado calculado não equivale a evento real

Estados como:

- Próxima;
- Vencida;
- Peça faltando;
- Garantia vencida;

são estados calculados do sistema e não representam, por si só, que uma ação física ocorreu no veículo.

## BR-GEN-003 — Histórico representa fatos registrados

Somente ações efetivamente confirmadas pelo usuário deverão gerar eventos históricos correspondentes.

## BR-GEN-004 — Dados derivados devem ser recalculáveis

Sempre que um dado-base for alterado, os dados derivados relacionados deverão ser recalculados.

Exemplos:

- próxima manutenção;
- próxima inspeção;
- vencimento por quilometragem;
- vencimento de garantia;
- estado de alerta.

---

# 3. Estados de manutenção

## BR-STA-001 — Estados principais

Uma manutenção ativa poderá assumir os seguintes estados:

- OK
- Próxima
- Vencida
- Pendente
- Em andamento

## BR-STA-002 — Concluída pertence ao histórico da ocorrência

O estado **Concluída** deverá ser aplicado à ocorrência histórica executada, e não como estado terminal permanente de uma manutenção recorrente.

## BR-STA-003 — Manutenção recorrente permanece ativa

Ao concluir uma ocorrência de uma manutenção recorrente:

1. a ocorrência atual deverá ser registrada como concluída no histórico;
2. o plano de manutenção permanecerá ativo;
3. novos limites deverão ser calculados;
4. o novo ciclo passará a ser acompanhado.

---

# 4. Lógica de vencimento

## BR-DUE-001 — Vencimento por quilometragem

Uma manutenção com limite de quilometragem deverá ser considerada vencida quando:

```text
quilometragem_atual >= quilometragem_de_vencimento
```

## BR-DUE-002 — Vencimento por data

Uma manutenção com limite de data deverá ser considerada vencida quando:

```text
data_atual >= data_de_vencimento
```

## BR-DUE-003 — Regra "o que ocorrer primeiro"

Quando uma manutenção possuir simultaneamente limite por data e por quilometragem, deverá ser considerada vencida quando qualquer um dos limites for atingido primeiro.

Formalmente:

```text
VENCIDA =
  (quilometragem_atual >= quilometragem_de_vencimento)
  OU
  (data_atual >= data_de_vencimento)
```

## BR-DUE-004 — Um critério vencido prevalece

Se o limite de data estiver vencido, a manutenção continuará Vencida mesmo que ainda faltem muitos quilômetros.

## BR-DUE-005 — Quilometragem vencida prevalece

Se o limite de quilometragem estiver vencido, a manutenção continuará Vencida mesmo que ainda falte muito tempo para a data.

## BR-DUE-006 — Manutenção sem recorrência

Uma manutenção pontual poderá possuir:

- somente data;
- somente quilometragem;
- data e quilometragem;
- nenhum dos dois, permanecendo como pendência manual.

---

# 5. Faixas globais de alerta

## BR-ALT-001 — Antecedência padrão por quilometragem

O valor inicial global de alerta será:

**1.000 km antes do vencimento**

## BR-ALT-002 — Antecedência padrão por data

O valor inicial global de alerta será:

**60 dias antes do vencimento**

## BR-ALT-003 — Valores editáveis

Esses valores deverão ser configuráveis posteriormente pelo usuário nas configurações.

## BR-ALT-004 — Estado Próxima por quilometragem

Uma manutenção deverá ser considerada Próxima quando:

```text
quilometragem_de_vencimento - quilometragem_atual <= alerta_global_km
```

desde que ainda não esteja vencida.

## BR-ALT-005 — Estado Próxima por data

Uma manutenção deverá ser considerada Próxima quando:

```text
data_de_vencimento - data_atual <= alerta_global_dias
```

desde que ainda não esteja vencida.

## BR-ALT-006 — Combinação de critérios

Em manutenção com data e quilometragem, atingir qualquer faixa de alerta deverá colocar o item como Próximo.

## BR-ALT-007 — Vencido tem prioridade sobre Próximo

Se um item satisfizer simultaneamente uma condição de Próximo e uma condição de Vencido, o estado final deverá ser Vencido.

---

# 6. Retorno automático de estado

## BR-REV-001 — Estados calculados são reversíveis

Estados derivados de data ou quilometragem poderão voltar automaticamente para um estado anterior quando o dado-base for corrigido.

Exemplo:

```text
Vencida → Próxima → OK
```

## BR-REV-002 — Correção de quilometragem

Se a quilometragem atual for corrigida para um valor menor, o sistema deverá recalcular todas as condições dependentes dela.

## BR-REV-003 — Sem evento histórico por simples mudança calculada

Uma manutenção deixar de ser Vencida após correção de quilometragem não deverá gerar evento histórico de manutenção.

---

# 7. Prioridade entre estados

## BR-PRI-001 — Ordem de gravidade funcional

Para fins de exibição e ordenação, a prioridade conceitual deverá ser:

1. Peça faltando essencial
2. Vencida
3. Em andamento
4. Pendente
5. Próxima
6. OK

A apresentação visual definitiva será definida no Design System.

## BR-PRI-002 — Peça faltando essencial é estado crítico próprio

A ausência de uma peça essencial deverá ser tratada como condição distinta e de maior gravidade do que uma manutenção simplesmente vencida.

---

# 8. Ciclos independentes de manutenção

## BR-CYC-001 — Cada plano possui ciclo próprio

Cada plano de manutenção deverá possuir seu próprio ciclo independente.

Exemplos para o mesmo componente:

- Inspecionar
- Limpar
- Regular
- Reparar
- Substituir

## BR-CYC-002 — Inspeção não reinicia ciclo de substituição

Concluir uma inspeção não deverá reiniciar automaticamente o ciclo de substituição da peça.

Exemplo:

```text
Bateria instalada: 100.000 km
Troca prevista: 140.000 km

Inspeção realizada: 125.000 km
Próxima inspeção: 135.000 km

Próxima troca continua: 140.000 km
```

## BR-CYC-003 — Reinício apenas do plano correspondente

Ao concluir uma ocorrência, somente o plano ao qual ela pertence deverá ser reiniciado.

## BR-CYC-004 — Dependências explícitas

Um plano só poderá afetar outro automaticamente se essa dependência estiver explicitamente definida.

## BR-CYC-005 — Substituição real reinicia ciclo da peça substituída

Quando uma peça for efetivamente substituída, os planos de substituição dependentes daquela instalação deverão passar a contar a partir da nova instalação.

---

# 9. Cálculo de recorrência por quilometragem

## BR-RKM-001 — Base de cálculo

Para recorrência por quilometragem:

```text
proximo_vencimento_km =
  km_da_ultima_ocorrencia_valida + intervalo_km
```

## BR-RKM-002 — Exemplo

```text
Troca realizada: 148.200 km
Intervalo: 10.000 km
Próxima troca: 158.200 km
```

## BR-RKM-003 — Última ocorrência válida

O cálculo deverá usar a última ocorrência concluída pertencente ao mesmo plano de manutenção.

---

# 10. Cálculo de recorrência por tempo

## BR-RTM-001 — Base de cálculo

Para recorrência por tempo:

```text
proxima_data =
  data_da_ultima_ocorrencia_valida + intervalo_temporal
```

## BR-RTM-002 — Unidades aceitas

O intervalo poderá ser definido em:

- dias;
- meses;
- anos.

## BR-RTM-003 — Última ocorrência válida

O cálculo deverá usar a última ocorrência concluída pertencente ao mesmo plano.

---

# 11. Recorrência combinada

## BR-RCB-001 — Dois limites simultâneos

Um plano poderá possuir:

- próximo vencimento por quilometragem;
- próxima data de vencimento.

## BR-RCB-002 — Primeiro critério determina o estado

O sistema deverá considerar o primeiro limite alcançado para fins de alerta e vencimento.

## BR-RCB-003 — Conclusão reinicia os dois limites

Quando a ocorrência correspondente for concluída, os dois limites deverão ser recalculados a partir dos dados reais da conclusão.

---

# 12. Conclusão de manutenção recorrente

## BR-CMP-001 — Dados reais como nova base

Ao concluir uma manutenção recorrente, a nova recorrência deverá usar:

- data real informada;
- quilometragem real informada.

## BR-CMP-002 — Não usar automaticamente o vencimento anterior

O próximo ciclo não deverá ser calculado a partir da data ou quilometragem originalmente prevista quando o serviço tiver sido realizado em outro momento.

Exemplo:

```text
Previsto: 158.000 km
Realizado: 159.250 km
Intervalo: 10.000 km

Próximo: 169.250 km
```

## BR-CMP-003 — Histórico preserva atraso

O histórico deverá manter a data e quilometragem reais da execução, permitindo posteriormente identificar que um serviço foi realizado após o vencimento.

---

# 13. Edição de registros históricos

## BR-EDT-001 — Edição permitida

Registros históricos poderão ser editados para correção.

## BR-EDT-002 — Recalcular apenas ciclos derivados

Ao editar uma ocorrência histórica, o sistema deverá recalcular somente os ciclos derivados daquele registro.

## BR-EDT-003 — Exemplo de correção

```text
Troca de óleo registrada: 148.000 km
Intervalo: 10.000 km
Próxima: 158.000 km

Correção histórica:
147.500 km

Nova próxima troca:
157.500 km
```

## BR-EDT-004 — Ciclos paralelos permanecem independentes

Editar uma inspeção não deverá alterar automaticamente a recorrência de substituição.

Editar uma substituição não deverá alterar uma inspeção independente, salvo dependência explícita.

## BR-EDT-005 — Propagação em cadeia

Se uma alteração histórica afetar uma sequência de ocorrências futuras derivadas do mesmo plano, o sistema deverá recalcular de forma consistente as dependências aplicáveis.

A estratégia técnica dessa propagação será definida posteriormente no modelo de dados.

---

# 14. Exclusão de registros históricos

## BR-DEL-001 — Exclusão excepcional

Excluir um registro histórico deverá exigir confirmação explícita.

## BR-DEL-002 — Recalcular dependências

Se o registro excluído for usado como base de recorrência, o sistema deverá recalcular o plano a partir da ocorrência válida anterior.

## BR-DEL-003 — Aviso de impacto

Antes da exclusão, o sistema deverá informar quando a ação puder afetar:

- próxima manutenção;
- peça atual;
- garantia;
- custos;
- histórico relacionado.

---

# 15. Regras de peças

## BR-PART-001 — Componente é permanente

Um componente estrutural deverá continuar existindo mesmo quando nenhuma peça estiver instalada nele.

## BR-PART-002 — Peça é instância histórica

A peça específica representa um item instalado em determinado momento.

Exemplo:

```text
Componente: Bateria
Peça instalada: Moura M60GD
```

## BR-PART-003 — Instalada

Uma peça em estado Instalada deverá representar o item atualmente presente no veículo naquela função/posição.

## BR-PART-004 — Substituída

Quando uma nova peça assumir a função de uma anterior:

1. a antiga deixa de ser atual;
2. a antiga passa para o histórico como Substituída;
3. a nova passa a ser Instalada.

## BR-PART-005 — Removida/Descartada

Quando uma peça sair do veículo sem substituição imediata:

1. a peça deverá sair do estado atual;
2. deverá permanecer no histórico como Removida/Descartada;
3. não deverá existir como item de estoque.

## BR-PART-006 — Sem estoque

O sistema não deverá manter inventário de peças compradas, guardadas ou removidas.

---

# 16. Peça faltando

## BR-MISS-001 — Componente essencial sem peça

Se uma peça essencial for removida sem substituição, o componente deverá assumir o estado:

**Peça faltando**

## BR-MISS-002 — Alerta crítico

Peça faltando em componente essencial deverá gerar alerta interno de alta gravidade.

## BR-MISS-003 — Componente opcional

A ausência de peça em componente opcional não deverá necessariamente gerar alerta crítico.

## BR-MISS-004 — Instalação resolve ausência

Ao registrar nova peça instalada no componente faltante:

1. o estado Peça faltando deverá ser removido;
2. a nova peça deverá assumir estado Instalada;
3. o evento deverá ser registrado no histórico.

---

# 17. Motivo de substituição ou remoção

## BR-REA-001 — Texto livre

O motivo de substituição ou remoção deverá ser digitado em campo de texto livre.

## BR-REA-002 — Sem lista obrigatória

Não deverá existir uma lista obrigatória de motivos pré-definidos.

## BR-REA-003 — Texto extenso permitido

O campo deverá permitir descrição em parágrafo.

---

# 18. Posição da peça

## BR-LOC-001 — Somente posições predefinidas

A localização de uma peça deverá ser selecionada exclusivamente de uma lista hardcoded ou configurada pelo sistema.

## BR-LOC-002 — Sem posição personalizada

O usuário não deverá criar posições através de texto livre.

## BR-LOC-003 — Busca obrigatória

O seletor de posição deverá permitir pesquisa.

## BR-LOC-004 — Catálogo abrangente

A lista deverá ser abrangente o suficiente para cobrir as posições relevantes do Sandero Expression 2012 1.6 8V.

---

# 19. Catálogo estrutural do Sandero

## BR-CAT-001 — Catálogo hardcoded

A versão inicial deverá usar um catálogo estrutural hardcoded para:

**Renault Sandero Expression 2012 1.6 8V**

## BR-CAT-002 — Componente sem histórico

Um componente poderá existir no catálogo sem possuir qualquer registro histórico.

Nesse caso, deverá apresentar estado equivalente a:

**Sem informações cadastradas**

## BR-CAT-003 — Essencialidade

Cada componente deverá poder possuir classificação funcional de:

- essencial;
- opcional.

## BR-CAT-004 — Fonte técnica

A lista final de componentes, posições e classificações deverá ser validada com documentação técnica apropriada antes de ser usada como referência definitiva.

---

# 19A. Peças usadas, recondicionadas e de histórico incompleto

## BR-COND-001 — Condição não define vida restante

A condição informada na instalação — Nova, Usada, Recondicionada ou Desconhecida — não deverá, sozinha, determinar a vida útil restante.

## BR-COND-002 — Vida anterior desconhecida

Quando o uso anterior da peça for desconhecido, o sistema não deverá inventar:

- quilometragem anterior;
- idade anterior;
- percentual de vida restante;
- data provável de substituição.

## BR-COND-003 — Recorrência somente explícita

Uma peça de histórico incompleto somente deverá receber vencimentos automáticos quando houver uma regra explicitamente definida pelo usuário ou pelo plano de manutenção aplicável.

## BR-COND-004 — Inspeção como alternativa

Quando a vida restante não puder ser determinada, o usuário poderá acompanhar a peça através de inspeções periódicas sem que isso implique substituição automática.

## BR-COND-005 — Dados técnicos iniciais

Medições ou observações técnicas feitas no momento da instalação poderão servir como referência histórica, mas não deverão ser convertidas automaticamente em vida útil restante sem uma regra definida.

---

# 20. Garantias

## BR-WAR-001 — Garantia por tempo

Uma garantia poderá vencer por data.

## BR-WAR-002 — Garantia por quilometragem

Uma garantia poderá vencer por quilometragem.

## BR-WAR-003 — Garantia combinada

Quando houver data e quilometragem, a garantia deverá vencer pelo critério atingido primeiro.

## BR-WAR-004 — Regra formal

```text
GARANTIA_VENCIDA =
  (km_atual >= km_limite_garantia)
  OU
  (data_atual >= data_limite_garantia)
```

## BR-WAR-005 — Alertas globais

Garantias deverão usar os mesmos limites globais de antecedência, salvo se uma regra específica for definida posteriormente.

## BR-WAR-006 — Garantia não implica defeito

Garantia próxima ou vencida não deverá alterar automaticamente o estado mecânico da peça ou serviço.

---

# 21. Problemas e manutenção corretiva

## BR-ISS-001 — Problema permanece até ação explícita

Um problema deverá permanecer aberto até que o usuário altere explicitamente seu estado.

## BR-ISS-002 — Estados possíveis

Os estados serão:

- Identificado
- Pendente
- Em andamento
- Adiado
- Resolvido
- Ignorado / Não será feito

## BR-ISS-003 — Resolução não presumida

Executar uma manutenção relacionada não deverá marcar automaticamente um problema como resolvido sem confirmação do usuário.

O fluxo poderá sugerir a resolução, mas deverá exigir confirmação.

## BR-ISS-004 — Problema resolvido permanece no histórico

Ao ser resolvido, o problema não deverá desaparecer.

---

# 22. Inspeções

## BR-INSP-001 — Inspeção não implica manutenção

Uma inspeção poderá resultar em:

- OK;
- atenção;
- necessidade de manutenção;
- necessidade de substituição.

## BR-INSP-002 — Inspeção concluída

A inspeção deverá gerar seu próprio registro histórico.

## BR-INSP-003 — Inspeção não altera peça automaticamente

Mesmo que uma inspeção indique necessidade de troca, a peça não deverá ser marcada como substituída até que o usuário registre a substituição real.

---

# 23. Quilometragem

## BR-ODO-001 — Histórico de leituras

Toda leitura de quilometragem deverá permanecer registrada até edição ou exclusão explícita.

## BR-ODO-002 — Data manual ou automática

Se uma data não for informada, deverá ser usada a data do registro.

## BR-ODO-003 — Edição recalcula dependências

Editar uma leitura deverá recalcular os estados dependentes de quilometragem.

## BR-ODO-004 — Exclusão recalcula dependências

Excluir uma leitura poderá alterar a quilometragem corrente considerada pelo sistema e deverá disparar recálculo dos itens dependentes.

## BR-ODO-005 — Quilometragem real prevalece

Somente leituras informadas pelo usuário deverão ser tratadas como quilometragem real.

Estimativas futuras, caso existam, não poderão substituir a quilometragem real.

---

# 24. Gastos

## BR-EXP-001 — Somente gastos do escopo

O módulo financeiro deverá considerar apenas gastos vinculados a elementos registráveis no sistema.

## BR-EXP-002 — Cálculo de total

Quando uma manutenção possuir:

- peças;
- mão de obra;
- outros custos relacionados;

o total deverá ser calculado pela soma desses valores.

## BR-EXP-003 — Edição financeira

Alterar custos históricos deverá atualizar os resumos financeiros derivados.

## BR-EXP-004 — Sem combustível

Combustível não deverá participar de nenhum cálculo financeiro do sistema.

---

# 25. Documentos

## BR-DOC-001 — Documento vencido por data

Documento com vencimento deverá assumir estado de vencido quando a data atual atingir ou ultrapassar a data definida.

## BR-DOC-002 — Documento próximo

Documento deverá usar o limite global de 60 dias para o estado Próximo, salvo configuração futura diferente.

## BR-DOC-003 — Documento sem vencimento

Documento sem data de vencimento não deverá gerar alerta automático.

---

# 26. Persistência de filtros

## BR-FLT-001 — Filtros persistentes

Filtros selecionados no Hub de Peças deverão permanecer salvos entre acessos.

## BR-FLT-002 — Combinação

Múltiplos filtros poderão permanecer ativos simultaneamente.

## BR-FLT-003 — Alteração explícita

Os filtros persistentes somente deverão mudar quando o usuário:

- alterar uma seleção;
- limpar filtros;
- restaurar padrões.

---

# 27. Ordem de recálculo

Quando uma alteração relevante ocorrer, o sistema deverá seguir conceitualmente esta ordem:

```text
1. Persistir o dado-base
2. Validar relações
3. Recalcular ciclos afetados
4. Recalcular datas e quilometragens de vencimento
5. Recalcular estados
6. Recalcular alertas
7. Recalcular resumos derivados
8. Atualizar a interface
```

---

# 28. Exemplos consolidados

## 28.1 Troca de óleo

```text
Última troca:
20/09/2026
148.200 km

Recorrência:
10.000 km ou 12 meses

Próximo limite por KM:
158.200 km

Próximo limite por data:
20/09/2027

Alerta:
a partir de 157.200 km
ou a partir de 22/07/2027 aproximadamente,
considerando o limite global de 60 dias.
```

A manutenção será Vencida quando qualquer um dos limites finais for atingido.

## 28.2 Inspeção independente

```text
Bateria instalada:
100.000 km

Plano A:
Inspecionar a cada 10.000 km

Plano B:
Substituir a cada 40.000 km ou 4 anos
```

Uma inspeção em 125.000 km poderá gerar:

```text
Próxima inspeção:
135.000 km
```

mas não mudará:

```text
Próxima substituição:
140.000 km
```

## 28.3 Remoção sem substituição

```text
Componente:
Bateria

Peça atual:
Moura M60GD

Ação:
Remover sem substituição
```

Resultado:

```text
Moura M60GD:
Histórico → Removida/Descartada

Bateria:
Estado atual → Peça faltando

Alerta:
Crítico
```

---

# 29. Regras a serem detalhadas posteriormente

Os seguintes temas serão aprofundados em documentos posteriores:

- precedência visual exata entre alertas;
- catálogo completo de componentes do Sandero;
- lista completa de posições;
- dependências entre planos;
- estratégia de propagação de edições históricas;
- regras de integridade no banco;
- comportamento de exclusões em cascata;
- critérios de aceite;
- comportamento offline;
- sincronização entre sessões;
- UX de confirmação e correção.

---

# 30. Resumo central

O Carango Véio deverá seguir esta lógica:

```text
O sistema calcula.
O sistema alerta.
O usuário confirma o que realmente aconteceu.
O histórico registra o fato.
Somente o ciclo correspondente é reiniciado.
```

Esse princípio deverá orientar toda implementação posterior.

---

# Regras adicionais — Estornos, odômetro e histórico

## BR-REF-001 — Estorno não altera fato mecânico

Estorno financeiro não desfaz manutenção, instalação, garantia ou resolução de problema.

## BR-REF-002 — Gasto líquido

```text
gastoLiquido = effectiveTotal - refundedAmount
```

Para estorno total:

```text
refundedAmount = effectiveTotal
gastoLiquido = 0
```

## BR-REF-003 — Limite de estorno

`refundedAmount` não poderá ser negativo nem superior ao `effectiveTotal`.

## BR-ODO-REG-001 — Odômetro atual monotônico

Novas leituras atuais deverão ser monotonicamente não decrescentes.

Correções devem ocorrer sobre registros históricos existentes, não através de uma nova leitura regressiva.

## BR-HIST-DEL-001 — Rollback seguro

Uma ocorrência histórica que alterou a peça atual somente poderá ser excluída automaticamente quando não possuir dependências posteriores.

Se houver dependências, bloquear e exigir correção explícita do histórico.

## BR-COMP-NA-001 — Componente não aplicável

`notApplicable` é diferente de peça opcional ausente e nunca gera alerta de peça faltando.
