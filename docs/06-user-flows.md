# Carango Véio — Fluxos de Usuário

## 1. Objetivo

Este documento define os principais fluxos de interação do Carango Véio.

Ele descreve:

- ponto de entrada;
- sequência de ações;
- decisões do usuário;
- validações;
- efeitos no estado atual;
- efeitos no histórico;
- efeitos em recorrências, peças, garantias e alertas.

Os fluxos devem ser implementados sem presumir ações físicas que não tenham sido confirmadas pelo usuário.

---

# 2. Princípios gerais dos fluxos

## UF-GEN-001 — Sandero pré-existente

O sistema já deverá nascer vinculado ao Renault Sandero Expression 2012 1.6 8V.

Não haverá:

- criação de veículo;
- seleção de veículo;
- onboarding de cadastro.

## UF-GEN-002 — Confirmação de fatos

Mudanças físicas no carro somente ocorrerão no sistema após confirmação explícita do usuário.

## UF-GEN-003 — Pré-preenchimento contextual

Quando uma ação partir de um item existente, o formulário deverá reaproveitar todos os dados conhecidos e pedir apenas o que precisa ser confirmado ou completado.

## UF-GEN-004 — Histórico automático após confirmação

Ações concluídas deverão gerar os eventos históricos correspondentes.

---

# 3. Primeiro acesso

```text
Abrir aplicação
    ↓
Entrar com Google
    ↓
Validar conta autorizada
    ↓
Carregar dados compartilhados
    ↓
Dashboard do Sandero
```

## Conta não autorizada

```text
Login Google
    ↓
Conta fora da allowlist
    ↓
Bloquear leitura dos dados
    ↓
Exibir "Acesso não autorizado"
```

Não deverá existir opção de criar uma conta interna.

---

# 4. Completar dados do veículo

Como não existe cadastro inicial:

```text
Dashboard
    ↓
Veículo
    ↓
Editar veículo
    ↓
Preencher dados conhecidos
    ↓
Salvar
```

Campos desconhecidos poderão permanecer vazios quando forem opcionais.

---

# 5. Atualizar quilometragem

```text
Dashboard
    ↓
Atualizar KM
    ↓
Modal
    ↓
Informar quilometragem
    ↓
[Data opcional]
    ↓
[Observação opcional]
    ↓
Salvar
```

Após salvar:

```text
Criar OdometerRecord
    ↓
Atualizar KM atual
    ↓
Recalcular manutenções
    ↓
Recalcular garantias
    ↓
Recalcular alertas
    ↓
Atualizar Dashboard
```

Nenhuma manutenção deverá ser marcada como realizada automaticamente.

---

# 6. Corrigir quilometragem

```text
Veículo
    ↓
Histórico de KM
    ↓
Selecionar leitura
    ↓
Editar
    ↓
Salvar
    ↓
Recalcular dependências
```

Estados calculados poderão regredir:

```text
Vencida → Próxima → OK
```

quando a correção justificar isso.

---

# 7. Criar manutenção

```text
Manutenções
    ↓
+ Nova manutenção
    ↓
Selecionar tipo
    ↓
Preencher dados principais
    ↓
Associar componente/peça
    ↓
Definir prazo
    ↓
Definir recorrência ou "Sem recorrência"
    ↓
Salvar
```

Tipos:

- Preventiva recorrente
- Preventiva única
- Corretiva
- Inspeção

---

# 8. Abrir manutenção a partir de alerta

```text
Dashboard
    ↓
Tocar/clicar no alerta
    ↓
Abrir diretamente o item responsável
```

O alerta não deverá levar apenas à lista genérica quando o item específico for conhecido.

---

# 9. Concluir manutenção existente

```text
Manutenção
    ↓
Concluir
    ↓
Formulário pré-preenchido
    ↓
Informar dados reais
    ↓
Revisar peças
    ↓
Revisar custos
    ↓
Revisar garantia
    ↓
Ver prévia do próximo ciclo
    ↓
Confirmar conclusão
```

## Pré-preenchimento

O formulário deverá trazer automaticamente:

- manutenção;
- componente;
- peças já relacionadas;
- recorrência;
- oficina/prestador anterior quando útil como sugestão;
- demais dados de contexto.

O usuário deverá completar principalmente:

- data real;
- KM real;
- peças efetivamente alteradas;
- custos reais;
- garantia real;
- observações.

---

# 10. Manutenção com múltiplas peças

Uma manutenção poderá realizar várias ações em uma única conclusão.

Exemplo:

```text
Revisão dos freios
    ↓
Pastilhas → substituir
Discos → inspecionar
Fluido → substituir
    ↓
Custos de cada item
    ↓
Mão de obra
    ↓
Confirmar
```

O sistema deverá registrar cada ação individualmente no histórico sem separar artificialmente a manutenção principal.

---

# 11. Instalar peça nova

```text
Concluir manutenção
    ↓
Adicionar ação de peça
    ↓
Instalar
    ↓
Selecionar componente/posição
    ↓
Informar peça
    ↓
Condição = Nova
    ↓
Informar dados conhecidos
    ↓
Confirmar
```

Após confirmação:

- criar PartInstance;
- marcar como Instalada;
- atualizar ComponentState;
- registrar evento histórico.

---

# 12. Instalar peça usada ou recondicionada

```text
Concluir manutenção
    ↓
Instalar peça
    ↓
Condição:
Usada / Recondicionada / Desconhecida
    ↓
Vida útil anterior conhecida?
    ├── Sim → preencher dados conhecidos
    └── Não → marcar histórico anterior desconhecido
    ↓
Observação livre
    ↓
[Campos técnicos específicos opcionais]
    ↓
Salvar
```

## Regra

Se a vida útil anterior for desconhecida:

- não calcular vida restante automaticamente;
- não inventar data de troca;
- não inventar KM de troca;
- permitir criar inspeção periódica;
- permitir criar manualmente um plano de substituição.

## Exemplos de uso

- pneu meia-vida;
- alternador recondicionado;
- motor de partida recondicionado;
- disco de freio usado;
- caixa de direção recondicionada;
- transmissão usada;
- componente elétrico usado.

---

# 13. Campos técnicos específicos

Quando o componente possuir dados técnicos próprios:

```text
Selecionar componente
    ↓
Carregar technicalFieldSchema
    ↓
Mostrar somente campos aplicáveis
```

Exemplos:

```text
Pneu
→ profundidade do sulco

Disco de freio
→ espessura

Bateria
→ observação/teste inicial
```

Todos deverão ser opcionais, salvo regra técnica futura explicitamente documentada.

---

# 14. Substituir uma peça

```text
Manutenção
    ↓
Concluir
    ↓
Ação: Substituir peça
    ↓
Selecionar peça atualmente instalada
    ↓
Informar nova peça
    ↓
Informar condição da nova peça
    ↓
Informar motivo da substituição
    ↓
Revisar
    ↓
Confirmar
```

Após confirmar:

```text
Peça antiga
→ status = Substituída
→ vai para histórico

Peça nova
→ status = Instalada

Componente
→ aponta para a nova peça
```

A substituição deverá existir vinculada à ocorrência de manutenção.

---

# 15. Remover peça sem substituição

```text
Manutenção
    ↓
Ação: Remover peça
    ↓
Selecionar peça
    ↓
Informar motivo
    ↓
Sistema identifica se o componente é essencial
```

## Componente não essencial

```text
Confirmação
    ↓
Remover
    ↓
Peça vai para histórico
```

## Componente essencial

Antes da conclusão deverá aparecer confirmação explícita equivalente a:

> Esta remoção deixará um componente essencial sem peça instalada e gerará um alerta de Peça faltando. Deseja continuar?

Somente após confirmação:

```text
Peça → Removida/Descartada
Componente → Peça faltando
Alerta → Crítico
```

Não deverá ser criado estoque.

---

# 16. Resolver estado "Peça faltando"

```text
Dashboard / Peças faltando
    ↓
Abrir componente
    ↓
Registrar manutenção
    ↓
Instalar peça
    ↓
Confirmar
```

Após confirmar:

- remover estado Peça faltando;
- nova peça passa a Instalada;
- registrar histórico;
- remover alerta correspondente.

---

# 17. Realizar inspeção

```text
Inspeção
    ↓
Concluir
    ↓
Informar data/KM
    ↓
Registrar resultado
    ↓
Adicionar observação
    ↓
Confirmar
```

A inspeção deverá reiniciar apenas seu próprio ciclo.

Não deverá reiniciar o ciclo de substituição da peça.

---

# 18. Inspeção identifica problema

Após registrar resultado de inspeção:

```text
Resultado indica problema
    ↓
Botão:
"Criar problema a partir desta inspeção"
    ↓
Abrir formulário de problema
    ↓
Pré-preencher:
- componente
- peça
- inspeção de origem
- data
- KM
    ↓
Usuário completa descrição/prioridade
    ↓
Salvar
```

A criação do problema deve ser opcional e explícita.

---

# 19. Criar problema manualmente

```text
Manutenções
    ↓
Problemas
    ↓
+ Novo problema
    ↓
Título
Descrição
Prioridade
Componente
Peça
Data/KM
    ↓
Salvar
```

Estado inicial deverá ser definido conforme regras posteriores de UX, sem presumir resolução.

---

# 20. Problema gera manutenção corretiva

```text
Abrir problema
    ↓
Criar manutenção corretiva
    ↓
Pré-preencher contexto
    ↓
Completar plano
    ↓
Salvar
```

Problema e manutenção deverão permanecer relacionados.

---

# 21. Concluir manutenção ligada a problema

```text
Concluir manutenção corretiva
    ↓
Registrar execução
    ↓
Antes da confirmação final:
"Marcar o problema [X] como resolvido?"
    ↓
Usuário escolhe
    ├── Sim → problema = Resolvido
    └── Não → problema mantém estado atual
```

A manutenção não deverá resolver o problema silenciosamente.

---

# 22. Manutenção recorrente concluída

```text
Plano recorrente
    ↓
Concluir ocorrência
    ↓
Registrar dados reais
    ↓
Gerar histórico
    ↓
Recalcular somente o ciclo correspondente
    ↓
Plano permanece ativo
    ↓
Mostrar novo vencimento
```

Não deverá ser criada uma tarefa conceitualmente desconectada.

---

# 23. Inspeção e substituição em ciclos separados

Exemplo:

```text
Bateria

Plano A:
Inspecionar a cada 10.000 km

Plano B:
Substituir a cada 40.000 km ou 4 anos
```

Ao concluir Plano A:

```text
Recalcular próxima inspeção
NÃO recalcular próxima substituição
```

---

# 24. Registrar custos

Dentro da conclusão:

```text
Peças individuais
+
Mão de obra
+
Outros custos válidos
    ↓
Total calculado
```

O usuário poderá:

### Opção A — detalhamento completo

Informar custos individuais.

### Opção B — somente total

Informar apenas valor total da manutenção.

### Opção C — detalhamento + override

```text
Total calculado: R$ X
Total manual: R$ Y
```

Quando houver override:

- manter X visível;
- destacar que Y foi informado manualmente;
- usar Y nos resumos financeiros.

---

# 25. Registrar garantia

Durante manutenção ou peça:

```text
Adicionar garantia
    ↓
Escolher:
- tempo
- KM
- tempo + KM
    ↓
Informar limites
    ↓
Salvar
```

Quando houver dois limites, vencer pelo primeiro atingido.

---

# 26. Documento anual

```text
Documentos
    ↓
+ Novo documento
    ↓
Tipo
Ano
Dados
Vencimento
Valor
URL
Observações
    ↓
Salvar
```

Novo ano deverá criar novo registro.

Exemplo:

```text
IPVA 2026
IPVA 2027
```

O registro anterior não deverá ser sobrescrito.

---

# 27. Renovar documento

A renovação deverá preferir criar uma nova ocorrência anual quando o documento for periódico.

```text
IPVA 2026
    ↓
Novo registro
    ↓
IPVA 2027
```

O histórico anterior permanece intacto.

---

# 28. Acessar evento pelo Histórico

```text
Histórico
    ↓
Filtrar ou pesquisar
    ↓
Selecionar evento
    ↓
Abrir detalhe da entidade de origem
```

Exemplos:

- troca de peça → peça/manutenção;
- leitura de KM → registro de KM;
- documento → documento;
- problema → problema.

---

# 29. Log contextual de componente

```text
Peças
    ↓
Abrir componente
    ↓
Histórico
    ↓
Sistema reúne eventos relacionados
```

O log deverá ser derivado de:

- manutenções;
- inspeções;
- peças;
- problemas;
- observações;
- garantias.

Não haverá coleção própria de notas.

---

# 30. Editar ocorrência histórica

```text
Histórico
    ↓
Abrir ocorrência
    ↓
Editar
    ↓
Alterar dado-base
    ↓
Salvar
    ↓
Recalcular somente dependências afetadas
```

Exemplo:

```text
Troca de óleo:
148.000 km → corrigida para 147.500 km
    ↓
Próxima troca é recalculada
```

Ciclos independentes não deverão ser alterados.

---

# 31. Excluir ocorrência histórica

```text
Abrir ocorrência
    ↓
Excluir
    ↓
Mostrar impactos
    ↓
Solicitar confirmação explícita
    ↓
Confirmar
    ↓
Excluir
    ↓
Recalcular dependências
```

A interface deverá informar, quando aplicável, impacto em:

- peça atual;
- recorrência;
- custos;
- garantia;
- histórico.

---

# 32. Alertas do Dashboard

Cada alerta deverá ser acionável.

```text
Alerta
    ↓
Clique/toque
    ↓
Abrir diretamente:
- manutenção
- componente
- peça
- documento
- garantia
- problema
```

O usuário não deverá precisar procurar manualmente o item que originou o alerta.

---

# 33. Menu mobile

## Abrir

```text
Swipe da borda direita para a esquerda
OU
Botão de menu
    ↓
Menu entra pela direita
```

## Fechar

```text
Swipe inverso
OU
Tocar fora
OU
Selecionar item
OU
Botão fechar
```

---

# 34. Fluxo completo de exemplo

```text
Dashboard
    ↓
Alerta: troca de óleo vencida
    ↓
Abrir manutenção
    ↓
Concluir
    ↓
Formulário pré-preenchido
    ↓
Data real
KM real
Óleo utilizado
Filtro substituído
Oficina
Custos
Garantia, se houver
    ↓
Confirmar
    ↓
Criar ocorrência histórica
    ↓
Atualizar peça(s)
    ↓
Registrar custos
    ↓
Recalcular somente plano de troca de óleo
    ↓
Novo prazo
    ↓
Dashboard atualizado
```

---

# 35. Fluxo completo de peça usada

```text
Manutenção
    ↓
Instalar pneu
    ↓
Condição = Usado
    ↓
Vida anterior conhecida = Não
    ↓
Observação:
"Pneu meia-vida; desgaste aparentemente uniforme."
    ↓
[Profundidade do sulco opcional]
    ↓
Sem vencimento automático inventado
    ↓
Criar opcionalmente:
"Inspecionar pneu a cada X km"
    ↓
Confirmar
    ↓
Histórico + peça atual
```

---

# 36. Regra central dos fluxos

```text
O sistema pode sugerir.
O sistema pode calcular.
O sistema pode alertar.
O sistema não pode afirmar que uma ação física aconteceu sem confirmação do usuário.
```
