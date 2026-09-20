# Carango Véio — Arquitetura da Informação

## 1. Objetivo deste documento

Este documento define como as informações e funcionalidades do Carango Véio serão organizadas na interface.

Ele descreve:

- áreas principais;
- hierarquia de navegação;
- agrupamento de funcionalidades;
- relações entre telas;
- comportamento geral de navegação em desktop e mobile.

Este documento não define ainda o layout visual detalhado de cada tela. Isso será feito posteriormente no documento de especificação de telas.

---

# 2. Princípios de arquitetura da informação

## IA-GEN-001 — Navegação por domínio

As funcionalidades deverão ser agrupadas conforme o tipo de informação que o usuário deseja consultar ou alterar.

## IA-GEN-002 — Acesso rápido ao estado atual

As áreas mais importantes para acompanhamento cotidiano deverão estar acessíveis diretamente pelo menu principal.

## IA-GEN-003 — Histórico unificado

Eventos relevantes do veículo deverão poder ser consultados em uma linha do tempo geral, independentemente do módulo que os originou.

## IA-GEN-004 — Garantias são contextuais

Garantias não possuirão uma área principal própria.

Elas deverão aparecer associadas aos objetos aos quais pertencem e também em visões agregadas quando relevantes.

## IA-GEN-005 — Problemas pertencem a Manutenções

Problemas não possuirão uma área principal própria.

Eles deverão ser tratados como parte do domínio de Manutenções.

---

# 3. Menu principal

O menu principal deverá possuir as seguintes áreas:

1. Início
2. Manutenções
3. Peças
4. Histórico
5. Gastos
6. Documentos
7. Veículo
8. Configurações

---

# 4. Estrutura geral

```text
Carango Véio
│
├── Início
│
├── Manutenções
│   ├── Visão geral
│   ├── Pendentes
│   ├── Próximas
│   ├── Vencidas
│   ├── Em andamento
│   ├── Recorrentes
│   ├── Inspeções
│   └── Problemas
│
├── Peças
│   ├── Visão do carro
│   ├── Todas as peças
│   ├── Peças faltando
│   ├── Por sistema
│   └── Histórico
│
├── Histórico
│
├── Gastos
│
├── Documentos
│
├── Veículo
│
└── Configurações
```

---

# 5. Início

A área Início será o dashboard principal.

## Objetivo

Permitir que o usuário compreenda rapidamente a situação atual do veículo.

## Conteúdo principal

A tela deverá agregar:

- quilometragem atual;
- manutenções vencidas;
- manutenções próximas;
- problemas pendentes;
- peças faltando;
- documentos próximos do vencimento;
- garantias próximas do vencimento;
- resumo de gastos;
- ações rápidas.

## Ações rápidas mínimas

- Atualizar KM
- Registrar manutenção

---

# 6. Manutenções

A área Manutenções será responsável por todo acompanhamento de serviços, inspeções, problemas e recorrências.

## Estrutura

### 6.1 Visão geral

Deverá consolidar o estado geral das manutenções.

Poderá mostrar:

- quantidade vencida;
- quantidade próxima;
- quantidade pendente;
- quantidade em andamento;
- próximas ocorrências;
- problemas abertos;
- inspeções previstas.

### 6.2 Pendentes

Listará atividades ainda não concluídas que aguardam ação.

### 6.3 Próximas

Listará manutenções dentro das faixas globais de alerta.

### 6.4 Vencidas

Listará manutenções cujo limite de data ou quilometragem já foi atingido.

### 6.5 Em andamento

Listará manutenções ou correções atualmente em execução.

### 6.6 Recorrentes

Listará planos de manutenção com recorrência ativa.

### 6.7 Inspeções

Listará planos e ocorrências do tipo inspeção/verificação.

### 6.8 Problemas

Listará problemas associados ao veículo.

Deverá permitir filtrar por:

- Identificado
- Pendente
- Em andamento
- Adiado
- Resolvido
- Ignorado / Não será feito

Também deverá permitir filtrar por prioridade.

---

# 7. Garantias dentro de Manutenções

Garantias relacionadas a serviço deverão aparecer:

- no detalhe da manutenção;
- no detalhe da ocorrência histórica;
- em alertas do dashboard quando próximas do vencimento;
- na timeline geral do Histórico quando pertinente.

Não deverá existir uma tela principal independente chamada Garantias.

---

# 8. Peças

A área Peças funcionará como um Hub estrutural do veículo.

Ela deverá representar tanto o catálogo hardcoded quanto o estado atual e histórico dos componentes.

## 8.1 Visão do carro

Deverá apresentar uma visão estruturada do veículo por sistemas e componentes.

Objetivo:

- visualizar rapidamente quais áreas possuem informações;
- identificar peças faltando;
- navegar por sistema;
- acessar o histórico de um componente.

## 8.2 Todas as peças

Deverá exibir a listagem completa dos componentes e peças conhecidas.

A tela deverá suportar filtros múltiplos e persistentes.

## 8.3 Peças faltando

Deverá listar componentes cujo estado atual seja `missing`.

Componentes essenciais deverão possuir destaque de maior gravidade.

## 8.4 Por sistema

Deverá agrupar componentes por sistemas do veículo.

Exemplos:

- Motor
- Freios
- Suspensão
- Elétrica
- Arrefecimento
- Transmissão
- Direção
- Iluminação
- Climatização
- Interior

## 8.5 Histórico

Deverá exibir eventos históricos relacionados a peças.

Exemplos:

- instalada;
- substituída;
- removida;
- inspecionada;
- reparada.

---

# 9. Garantias dentro de Peças

Garantias de peças deverão aparecer:

- no detalhe da peça;
- no detalhe do componente;
- no histórico;
- no dashboard quando próximas do vencimento.

Não deverão criar uma área independente.

---

# 10. Histórico

O Histórico deverá ser uma linha do tempo geral do veículo.

## Objetivo

Reunir em uma única visão todos os eventos relevantes.

## Eventos possíveis

- manutenção concluída;
- inspeção concluída;
- peça instalada;
- peça substituída;
- peça removida;
- problema identificado;
- problema resolvido;
- documento criado;
- documento renovado;
- garantia iniciada;
- garantia vencida;
- leitura de quilometragem;
- alterações documentais relevantes;
- custos registrados.

## Comportamento

A timeline deverá permitir filtros por:

- tipo de evento;
- data;
- sistema;
- componente;
- peça;
- categoria;
- posição;
- manutenção;
- problema.

---

# 11. Histórico contextual

Além da timeline geral, o sistema deverá permitir visualizar históricos derivados em contextos específicos.

Exemplos:

- histórico de um componente;
- histórico de uma peça;
- histórico de um sistema;
- histórico de uma posição;
- histórico de uma manutenção recorrente;
- histórico de um documento.

Essas visualizações deverão derivar dos mesmos registros-base.

---

# 12. Gastos

A área Gastos deverá concentrar os dados financeiros registráveis do veículo.

## Seções funcionais

### 12.1 Visão geral

Deverá mostrar:

- total acumulado;
- total no ano atual;
- total em período selecionado;
- média por período, se aplicável.

### 12.2 Por ano

Agrupamento por ano.

### 12.3 Por categoria

Agrupamento por:

- peças;
- mão de obra;
- documentos;
- seguro;
- impostos;
- outros custos válidos do escopo.

### 12.4 Por peça

Permitir identificar quanto foi gasto com peças ou componentes específicos.

### 12.5 Por manutenção

Permitir visualizar custos por manutenção ou ocorrência.

### 12.6 Histórico de despesas

Listagem cronológica das despesas registradas.

---

# 13. Documentos

A área Documentos será responsável pelos registros documentais do veículo.

## Conteúdo

Deverá permitir visualizar e gerenciar:

- IPVA;
- licenciamento;
- seguro;
- documentos personalizados.

## Agrupamento

Registros deverão poder ser agrupados por:

- tipo;
- ano;
- status;
- vencimento.

## Histórico

Documentos antigos deverão permanecer consultáveis.

---

# 14. Veículo

A área Veículo deverá centralizar os dados gerais do carro.

## Conteúdo

- fabricante;
- modelo;
- versão;
- ano;
- ano-modelo;
- motor;
- combustível;
- cor;
- placa;
- RENAVAM;
- chassi;
- quilometragem atual;
- URL de imagem;
- observações.

## Subseções

### 14.1 Informações gerais

Dados cadastrais do veículo.

### 14.2 Quilometragem

Histórico de leituras.

### 14.3 Documentação resumida

Atalhos para os principais documentos.

### 14.4 Estado geral

Resumo dos sistemas, quando aplicável.

---

# 15. Configurações

A área Configurações deverá conter preferências globais.

## Itens previstos

- antecedência de alerta em quilômetros;
- antecedência de alerta em dias;
- filtros persistentes;
- preferências de visualização;
- informações de sessão;
- conta autenticada;
- ações de restauração de preferências.

## Valores iniciais

- 1.000 km
- 60 dias

---

# 16. Navegação desktop

No desktop, o menu principal deverá permanecer facilmente acessível durante a navegação.

A forma visual exata será definida posteriormente, podendo utilizar:

- sidebar;
- navegação lateral fixa;
- navegação lateral recolhível.

A arquitetura deverá priorizar acesso direto às oito áreas principais.

---

# 17. Navegação mobile

No mobile, o padrão principal será **menu lateral**.

## IA-MOB-001 — Menu lateral

O menu deverá conter as mesmas áreas principais do desktop.

## IA-MOB-002 — Abertura por gesto

O menu deverá poder ser aberto através de gesto horizontal de swipe apropriado.

## IA-MOB-003 — Fechamento por gesto

O menu deverá poder ser fechado através de swipe no sentido oposto.

## IA-MOB-004 — Fechamento por toque externo

Tocar fora do menu aberto deverá fechá-lo.

## IA-MOB-005 — Fechamento ao navegar

Selecionar uma opção do menu deverá fechar o menu automaticamente.

## IA-MOB-006 — Acesso alternativo

Além do gesto de swipe, deverá existir um botão visível para abrir o menu.

O gesto não deverá ser o único meio de acesso.

---

# 18. Navegação hierárquica

A navegação deverá seguir a lógica:

```text
Área principal
    ↓
Lista / visão geral
    ↓
Item
    ↓
Detalhe
    ↓
Ação
```

Exemplo:

```text
Peças
→ Por sistema
→ Freios
→ Pastilha dianteira esquerda
→ Histórico
```

---

# 19. Rotas conceituais

A arquitetura deverá suportar rotas conceituais equivalentes a:

```text
/
 /maintenance
 /maintenance/pending
 /maintenance/upcoming
 /maintenance/overdue
 /maintenance/in-progress
 /maintenance/recurring
 /maintenance/inspections
 /maintenance/issues

 /parts
 /parts/all
 /parts/missing
 /parts/systems
 /parts/history

 /history
 /expenses
 /documents
 /vehicle
 /settings
```

A estrutura técnica final de URLs poderá variar, desde que preserve a arquitetura de informação.

---

# 20. Detalhes de entidade

Entidades importantes deverão possuir telas ou painéis de detalhe.

## Componentes

Detalhe de componente deverá permitir acessar:

- estado atual;
- peça atual;
- posição;
- sistema;
- histórico;
- manutenção relacionada;
- garantias;
- observações.

## Peças

Detalhe de peça deverá permitir acessar:

- dados técnicos;
- instalação;
- remoção/substituição;
- custos;
- garantia;
- manutenção relacionada;
- histórico.

## Manutenções

Detalhe de manutenção deverá permitir acessar:

- plano;
- recorrência;
- próximos limites;
- estado;
- histórico de ocorrências;
- peças associadas;
- custos;
- garantia;
- observações.

## Problemas

Detalhe de problema deverá permitir acessar:

- descrição;
- prioridade;
- estado;
- componentes relacionados;
- manutenção relacionada;
- resolução;
- histórico.

---

# 21. Pesquisa

Áreas com grande quantidade de conteúdo deverão possuir mecanismos de pesquisa.

## Locais mínimos

- Manutenções
- Peças
- Histórico
- Documentos
- Gastos, quando aplicável

## Peças

A pesquisa deverá considerar:

- nome do componente;
- marca;
- modelo;
- código;
- sistema;
- posição.

---

# 22. Filtros persistentes

Filtros do Hub de Peças deverão persistir entre sessões.

A arquitetura deverá permitir o mesmo comportamento em outras áreas quando útil.

## Exemplos de filtros

- estado;
- sistema;
- categoria;
- posição;
- garantia;
- recorrência;
- alerta;
- período.

---

# 23. Ações globais e contextuais

A interface deverá distinguir:

## Ações globais

Exemplos:

- Atualizar KM
- Registrar manutenção

## Ações contextuais

Exemplos:

- Editar peça
- Concluir manutenção
- Resolver problema
- Renovar documento
- Ver histórico do componente

---

# 24. Princípio de uma única fonte de dados

Uma mesma informação não deverá existir de forma duplicada apenas para atender a telas diferentes.

Exemplo:

A timeline geral, o histórico de uma peça e o histórico de um componente deverão consultar os mesmos eventos históricos e apenas aplicar agrupamentos/filtros diferentes.

---

# 25. Garantias como camada transversal

Garantias deverão funcionar como uma camada transversal da arquitetura.

Elas poderão aparecer em:

- Dashboard
- Manutenção
- Peça
- Histórico
- Alertas

mas não possuirão item próprio no menu principal.

---

# 26. Problemas como subdomínio de manutenção

Problemas deverão aparecer dentro da área Manutenções.

Isso evita duplicar fluxos e permite que:

```text
Problema
    ↓
Manutenção corretiva
    ↓
Resolução
    ↓
Histórico
```

seja um fluxo natural.

---

# 27. Estados vazios

Toda área deverá possuir comportamento previsto para ausência de dados.

Exemplos:

- Nenhuma manutenção vencida
- Nenhum problema aberto
- Nenhuma peça faltando
- Nenhum documento cadastrado
- Nenhum gasto registrado

A especificação textual e visual desses estados será feita no documento de telas.

---

# 28. Responsividade estrutural

A arquitetura da informação deverá permanecer equivalente entre desktop e mobile.

A diferença será principalmente de apresentação.

Exemplo:

```text
Desktop:
sidebar + conteúdo amplo

Mobile:
menu lateral sobreposto + conteúdo em largura reduzida
```

Nenhuma funcionalidade essencial deverá existir apenas em uma das plataformas.

---

# 29. Fluxo principal de navegação

```text
Início
│
├── Ver alerta
│   └── Abrir item relacionado
│
├── Atualizar KM
│   └── Recalcular estado
│
└── Registrar manutenção
    └── Concluir
        └── Histórico
            ├── Peças
            ├── Gastos
            └── Garantias
```

---

# 30. Resumo

A navegação principal do Carango Véio será:

```text
Início
Manutenções
Peças
Histórico
Gastos
Documentos
Veículo
Configurações
```

Com:

- Problemas dentro de Manutenções;
- Garantias contextuais;
- Histórico unificado;
- Hub de Peças estruturado;
- Gastos em área própria;
- menu lateral no mobile;
- abertura e fechamento do menu por swipe;
- acesso alternativo por botão visível.
