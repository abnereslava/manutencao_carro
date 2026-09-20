# Carango Véio — Especificação de Telas

## 1. Objetivo

Este documento define a estrutura funcional das telas do Carango Véio.

Ele especifica:

- conteúdo;
- seções;
- hierarquia;
- botões;
- ações;
- filtros;
- formulários;
- estados vazios;
- comportamento em desktop;
- comportamento em mobile;
- uso de modal, página dedicada e FAB.

A identidade visual, cores, tipografia, espaçamentos e demais tokens serão definidos posteriormente no Design System.

---

# 2. Regras gerais de interface

## 2.1 Desktop

O desktop deverá utilizar:

- menu superior;
- breadcrumbs em telas internas;
- ações primárias no topo direito da tela;
- tabelas quando houver ganho real de densidade;
- cards para resumos, alertas e indicadores;
- painéis de detalhe para contexto complementar.

## 2.2 Mobile

O mobile deverá utilizar:

- menu lateral sobreposto;
- menu abrindo da direita para a esquerda;
- abertura por botão;
- abertura/fechamento por swipe;
- fechamento ao tocar fora;
- fechamento ao navegar;
- cards em lugar de tabelas extensas;
- FAB para ação principal da tela;
- formulários complexos em tela cheia.

## 2.3 Ações simples

Devem preferencialmente usar modal.

Exemplos:

- atualizar quilometragem;
- editar observação curta;
- confirmar exclusão;
- confirmar arquivamento;
- alterar status simples.

## 2.4 Ações complexas

Devem usar página dedicada ou tela cheia no mobile.

Exemplos:

- nova manutenção;
- concluir manutenção;
- cadastrar peça;
- editar peça;
- cadastrar documento;
- editar documento;
- registrar problema complexo.

---

# 3. Navegação principal

## Desktop

Menu superior com:

- Início
- Manutenções
- Peças
- Histórico
- Gastos
- Documentos
- Veículo
- Configurações

## Mobile

Menu lateral com as mesmas opções.

---

# 4. Tela: Login

## Objetivo

Permitir entrada exclusivamente via Google.

## Conteúdo

- nome do app: Carango Véio;
- botão "Entrar com Google";
- mensagem curta informando que o acesso é restrito.

## Comportamento

Se a conta autenticada não for autorizada:

- bloquear acesso;
- não carregar dados;
- exibir mensagem de acesso não autorizado.

## Mobile e desktop

Mesma lógica, layout centralizado.

## Primeiro acesso

Após autenticação válida, o usuário deverá ir diretamente ao Dashboard.

Não haverá onboarding nem tela para criar veículo. O Sandero já existirá no contexto da aplicação; seus dados poderão ser completados posteriormente em **Veículo**.

---

# 5. Tela: Início / Dashboard

## Objetivo

Mostrar rapidamente o estado atual do carro.

## Header exclusivo do Dashboard

Deverá conter:

- nome/logo Carango Véio;
- quilometragem atual;
- botão "Atualizar KM";
- conta autenticada/avatar.

## Bloco 1 — Resumo crítico

Cards com:

- Peças faltando;
- Manutenções vencidas;
- Problemas urgentes;
- Documentos vencidos.

Itens sem ocorrência poderão ser ocultados ou exibidos zerados conforme decisão visual futura.

## Bloco 2 — Próximas manutenções

Lista ordenada por proximidade.

Cada item deverá mostrar:

- título;
- sistema/componente;
- limite em KM;
- limite em data;
- estado;
- distância restante em KM;
- dias restantes;
- ação "Ver".

## Bloco 3 — Problemas pendentes

Mostrar:

- título;
- prioridade;
- estado;
- componente;
- data de identificação.

## Bloco 4 — Garantias

Mostrar garantias:

- próximas do vencimento;
- vencidas.

## Bloco 5 — Documentos

Mostrar:

- IPVA;
- licenciamento;
- seguro;
- personalizados.

## Bloco 6 — Gastos

Resumo:

- total no ano;
- total no período atual;
- últimas despesas.

## Ações rápidas

No mínimo:

- Atualizar KM
- Registrar manutenção

## Mobile

Organização vertical em cards.

FAB sugerido:

- ação principal: Registrar manutenção.

Atualizar KM permanece como botão visível no bloco principal.

---

# 6. Modal: Atualizar quilometragem

## Campos

- Quilometragem
- Data
- Observações

## Regras

- Data opcional;
- se vazia, usar data atual;
- quilometragem obrigatória;
- observações opcionais.

## Botões

- Cancelar
- Salvar

## Após salvar

- recalcular alertas;
- recalcular estados;
- atualizar Dashboard.

---

# 7. Tela: Manutenções — Visão geral

## Objetivo

Consolidar todo o acompanhamento de manutenção.

## Header

Breadcrumb:

`Início > Manutenções`

Ação principal:

`+ Nova manutenção`

## Tabs / navegação interna

- Visão geral
- Pendentes
- Próximas
- Vencidas
- Em andamento
- Recorrentes
- Inspeções
- Problemas

## Resumo

Cards:

- Vencidas
- Próximas
- Pendentes
- Em andamento
- Problemas urgentes
- Inspeções próximas

## Lista principal

Mostrar os itens mais relevantes por prioridade funcional.

## Mobile

Tabs podem virar:

- seletor horizontal;
- menu interno;
- chips roláveis.

FAB:

`+` Nova manutenção

---

# 8. Tela: Manutenções — Pendentes

## Conteúdo

Lista de manutenções pendentes.

## Cada item

- título;
- tipo;
- componente;
- prioridade;
- data prevista;
- KM previsto;
- estado;
- ações.

## Ações

- Ver
- Editar
- Iniciar
- Concluir
- Adiar
- Arquivar
- Excluir

As ações disponíveis devem respeitar o estado atual.

---

# 9. Tela: Manutenções — Próximas

## Conteúdo

Itens dentro da faixa global de alerta.

## Ordenação padrão

1. menor distância até vencimento;
2. maior prioridade;
3. data.

## Indicadores

- faltam X km;
- faltam Y dias;
- qual critério está mais próximo.

---

# 10. Tela: Manutenções — Vencidas

## Conteúdo

Todos os itens vencidos.

## Destaque

Mostrar claramente:

- vencido por data;
- vencido por KM;
- vencido por ambos.

## Ações

- Ver
- Editar
- Concluir
- Iniciar
- Adiar quando aplicável.

---

# 11. Tela: Manutenções — Em andamento

## Conteúdo

Manutenções iniciadas e ainda não concluídas.

## Cada item

- título;
- data de início;
- componente;
- peças relacionadas;
- prestador;
- observações;
- prioridade.

---

# 12. Tela: Manutenções — Recorrentes

## Conteúdo

Planos com recorrência ativa.

## Cada item

- título;
- componente;
- tipo de recorrência;
- intervalo;
- próxima data;
- próximo KM;
- estado.

## Ações

- Ver
- Editar recorrência
- Pausar
- Reativar
- Arquivar

---

# 13. Tela: Manutenções — Inspeções

## Conteúdo

Planos e ocorrências do tipo inspeção.

## Cada item

- título;
- componente;
- próxima inspeção;
- última inspeção;
- resultado anterior;
- estado.

---

# 14. Tela: Manutenções — Problemas

## Conteúdo

Lista de problemas.

## Filtros

- status;
- prioridade;
- sistema;
- componente;
- período.

## Estados

- Identificado
- Pendente
- Em andamento
- Adiado
- Resolvido
- Ignorado / Não será feito

## Prioridades

- Baixa
- Média
- Alta
- Urgente

## Ação principal

`+ Novo problema`

## Cada item

- título;
- descrição resumida;
- prioridade;
- estado;
- componente;
- data de identificação.

---

# 15. Tela: Nova manutenção

## Tipo

Página dedicada.

## Seção 1 — Dados principais

Campos:

- Título
- Tipo
- Descrição
- Componente
- Peças relacionadas
- Prioridade
- Observações

## Seção 2 — Prazo

Campos:

- Data prevista
- KM previsto

## Seção 3 — Recorrência

Opções:

- Sem recorrência
- A cada X km
- A cada X dias
- A cada X meses
- A cada X anos
- X km ou Y tempo

## Seção 4 — Garantia prevista

Opcional.

## Botões

- Cancelar
- Salvar manutenção

---

# 16. Tela: Detalhe da manutenção

## Header

Breadcrumb:

`Início > Manutenções > [Título]`

## Ações principais

- Editar
- Iniciar
- Concluir
- Arquivar

## Conteúdo

### Resumo

- título;
- tipo;
- estado;
- prioridade;
- componente;
- peça relacionada.

### Vencimento

- próxima data;
- próximo KM;
- critério atual;
- distância restante.

### Recorrência

- tipo;
- intervalo;
- origem do ciclo.

### Histórico

Lista de ocorrências anteriores.

### Peças

Peças relacionadas.

### Custos

Resumo dos custos históricos.

### Garantia

Garantia relacionada.

### Observações

Campo textual.

---

# 17. Tela: Concluir manutenção

## Tipo

Página dedicada.

## Seção 1 — Execução

Campos:

- Data realizada
- Quilometragem
- Oficina/prestador
- Observações

## Seção 2 — Peças

Permitir:

- instalar peça;
- substituir peça;
- remover peça;
- inspecionar peça;
- reparar peça.

Uma manutenção poderá envolver múltiplas peças.

Ao instalar uma peça, permitir informar:

- condição: Nova, Usada, Recondicionada ou Desconhecida;
- se a vida útil anterior é conhecida;
- observação livre sobre o estado inicial;
- campos técnicos específicos daquele componente, quando existirem.

Se a vida útil anterior for desconhecida, a interface não deverá apresentar uma validade estimada como se fosse conhecida.

## Seção 3 — Custos

Campos:

- custo individual de cada peça;
- mão de obra;
- outros custos;
- total calculado;
- total manual opcional.

Se houver override manual:

- destacar;
- manter total calculado visível.

## Seção 4 — Garantia

Permitir cadastrar:

- garantia por data;
- garantia por KM;
- garantia combinada.

## Seção 5 — Próximo ciclo

Mostrar prévia calculada de:

- próxima data;
- próximo KM.

## Botões

- Cancelar
- Concluir manutenção

---

# 18. Tela: Peças — Visão do carro

## Objetivo

Representar estruturalmente o carro.

## Estrutura

Agrupamento por sistemas.

Exemplos:

- Motor
- Freios
- Suspensão
- Direção
- Elétrica
- Arrefecimento
- Transmissão
- Iluminação
- Climatização
- Interior

## Cada componente

Mostrar:

- nome;
- posição;
- estado;
- peça atual;
- alerta;
- garantia;
- recorrência.

## Ações

- Abrir componente
- Ver histórico

---

# 19. Tela: Peças — Todas as peças

## Conteúdo

Lista completa de componentes do catálogo hardcoded.

## Filtros persistentes

- estado;
- sistema;
- categoria;
- posição;
- possui histórico;
- possui garantia;
- garantia próxima;
- possui recorrência;
- possui alerta;
- peça faltando.

## Busca

Pesquisar por:

- componente;
- marca;
- modelo;
- código;
- sistema;
- posição.

## Visualização

Desktop:

- tabela ou lista densa.

Mobile:

- cards.

---

# 20. Tela: Peças — Peças faltando

## Conteúdo

Somente componentes em estado `missing`.

## Ordenação

1. essenciais;
2. demais.

## Cada item

- componente;
- sistema;
- posição;
- data da remoção;
- última peça conhecida;
- ação relacionada.

---

# 21. Tela: Peças — Por sistema

## Conteúdo

Agrupamento hierárquico:

```text
Sistema
  → Categoria
    → Componente
      → Peça atual
```

## Exemplo

```text
Freios
  → Dianteiro
    → Pastilha dianteira esquerda
    → Disco dianteiro esquerdo
```

---

# 22. Tela: Peças — Histórico

## Conteúdo

Timeline específica de peças.

Eventos:

- instalada;
- substituída;
- removida;
- inspecionada;
- reparada.

## Filtros

- sistema;
- componente;
- posição;
- evento;
- período.

---

# 23. Tela: Detalhe do componente

## Breadcrumb

`Início > Peças > [Sistema] > [Componente]`

## Conteúdo

### Estado atual

- estado;
- essencial/opcional;
- posição;
- sistema.

### Peça atual

- marca;
- modelo;
- código;
- data de instalação;
- KM de instalação;
- garantia.

### Manutenções

- planos ativos;
- próximas;
- vencidas.

### Histórico

Timeline consolidada.

### Observações

Campo textual do componente.

---

# 24. Tela: Detalhe da peça

## Conteúdo

- nome;
- marca;
- fabricante;
- modelo;
- código;
- condição na instalação;
- vida útil anterior conhecida/desconhecida;
- observação sobre estado inicial;
- dados técnicos específicos, quando existirem;
- instalação;
- remoção/substituição;
- fornecedor;
- preço;
- garantia;
- URLs;
- observações;
- histórico.

## Ações

- Editar
- Substituir
- Remover
- Registrar manutenção relacionada

---

# 25. Tela: Histórico

## Objetivo

Timeline unificada de eventos.

## Eventos

- manutenção;
- inspeção;
- instalação de peça;
- substituição;
- remoção;
- problema;
- documento;
- garantia;
- quilometragem;
- gasto.

## Filtros

- tipo de evento;
- data;
- sistema;
- componente;
- peça;
- posição;
- manutenção;
- problema.

## Cada evento

Mostrar:

- data;
- KM quando houver;
- tipo;
- título;
- descrição resumida;
- origem;
- ação "Ver detalhes".

---

# 26. Tela: Gastos

## Bloco 1 — Resumo geral

- total acumulado;
- total no ano;
- total no período filtrado.

## Bloco 2 — Por categoria

Categorias:

- peças;
- mão de obra;
- documentos;
- seguro;
- impostos;
- outros custos válidos.

## Bloco 3 — Por manutenção

Agrupamento por ocorrência.

## Bloco 4 — Por peça

Agrupamento por componente/peça.

## Bloco 5 — Histórico

Lista cronológica.

## Filtros

- período;
- categoria;
- sistema;
- componente;
- manutenção.

---

# 27. Tela: Documentos

## Conteúdo

Lista de documentos.

## Tipos

- IPVA
- Licenciamento
- Seguro
- Personalizado

## Filtros

- tipo;
- ano;
- status;
- vencimento.

## Ação principal

`+ Novo documento`

## Cada item

- nome;
- tipo;
- ano;
- vencimento;
- valor;
- status.

---

# 28. Tela: Novo / Editar documento

## Campos

- Tipo
- Nome
- Ano de referência
- Número/referência
- Data de emissão
- Data de vencimento
- Valor
- Situação
- URL
- Observações

## Botões

- Cancelar
- Salvar

---

# 29. Tela: Veículo

## Seção 1 — Dados gerais

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
- chassi.

## Seção 2 — Quilometragem

- KM atual;
- histórico;
- botão atualizar.

## Seção 3 — Documentos resumidos

Atalhos.

## Seção 4 — Observações

Campo textual.

## Ação principal

`Editar veículo`

---

# 30. Tela: Histórico de quilometragem

## Conteúdo

Lista cronológica de leituras.

## Cada item

- KM;
- data;
- observação;
- criado por.

## Ações

- Editar
- Excluir

## Ação principal

`+ Registrar KM`

---

# 31. Tela: Configurações

## Seção 1 — Alertas

Campos:

- antecedência em KM;
- antecedência em dias.

Valores iniciais:

- 1.000 km
- 60 dias

## Seção 2 — Preferências

- filtros persistentes;
- restaurar filtros;
- preferências de visualização.

## Seção 3 — Conta

Mostrar:

- conta autenticada;
- ação de sair.

---

# 32. Breadcrumbs

No desktop, telas internas deverão usar breadcrumbs.

Exemplos:

```text
Início > Manutenções > Troca de óleo
```

```text
Início > Peças > Freios > Pastilha dianteira esquerda
```

No mobile, breadcrumbs poderão ser reduzidos ou substituídos por:

- botão voltar;
- título da tela.

---

# 33. FAB no mobile

## Regra

O FAB deverá representar a ação principal da tela.

## Exemplos

Manutenções:

`+` Nova manutenção

Problemas:

`+` Novo problema

Documentos:

`+` Novo documento

Quilometragem:

`+` Registrar KM

## Múltiplas ações

Se a tela possuir múltiplas ações principais, o FAB poderá abrir um menu curto.

---

# 34. Estados vazios

Cada tela deverá possuir estado vazio explícito.

## Exemplos

### Manutenções vencidas

"Nenhuma manutenção vencida."

### Peças faltando

"Nenhuma peça essencial está faltando."

### Problemas

"Nenhum problema registrado."

### Documentos

"Nenhum documento cadastrado."

### Gastos

"Nenhum gasto registrado no período."

## Ação sugerida

Quando fizer sentido, o estado vazio deverá oferecer uma ação direta.

Exemplo:

`+ Cadastrar primeira manutenção`

---

# 35. Estados de carregamento

Listas e dashboards deverão possuir estados de carregamento apropriados.

O comportamento visual será definido no Design System.

---

# 36. Estados de erro

Erros deverão:

- informar que a operação falhou;
- preservar os dados digitados quando possível;
- permitir tentar novamente;
- não exibir mensagens técnicas cruas do Firebase ao usuário.

---

# 37. Confirmações

Ações destrutivas deverão exigir confirmação.

Exemplos:

- excluir histórico;
- excluir leitura de KM;
- remover peça;
- arquivar plano;
- excluir documento.

## Modal

Deverá informar:

- o que será afetado;
- dependências relevantes;
- ação final.

---

# 38. Edição

Toda entidade editável deverá possuir ação claramente acessível.

## Regras

- edição simples pode ocorrer em modal;
- edição complexa deve usar página dedicada;
- alterações derivadas deverão ser recalculadas após salvar.

---

# 39. Pesquisa

Campos de busca deverão existir em:

- Manutenções
- Peças
- Histórico
- Documentos
- Gastos quando necessário

A busca deverá filtrar dinamicamente sem botão "Buscar".

---

# 40. Persistência de filtros

Filtros persistentes deverão:

- manter o estado entre sessões;
- possuir ação "Limpar filtros";
- possuir ação "Restaurar padrão" quando aplicável.

---

# 41. Desktop x Mobile

## Desktop

Priorizar:

- densidade;
- comparação;
- tabelas;
- breadcrumbs;
- ações no topo.

## Mobile

Priorizar:

- cards;
- toque;
- menus sobrepostos;
- tela cheia em formulários;
- FAB;
- navegação por swipe.

---

# 42. Menu mobile

## Abertura

- botão visível;
- swipe da borda direita para a esquerda.

## Fechamento

- swipe inverso;
- toque fora;
- seleção de item;
- botão fechar.

## Regra

O swipe não deverá ser o único método de navegação.

---

# 43. Resumo

As telas principais serão:

1. Login
2. Dashboard
3. Manutenções
4. Detalhe de manutenção
5. Nova manutenção
6. Concluir manutenção
7. Problemas
8. Peças
9. Detalhe de componente
10. Detalhe de peça
11. Histórico
12. Gastos
13. Documentos
14. Veículo
15. Histórico de KM
16. Configurações

A experiência deverá permanecer funcionalmente equivalente entre desktop e mobile, adaptando apenas a forma de apresentação e interação.
