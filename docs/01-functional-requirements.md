# Carango Véio — Requisitos Funcionais

## 1. Objetivo deste documento

Este documento define **o que o sistema deve fazer**.

Ele descreve funcionalidades, ações disponíveis ao usuário, estados funcionais e comportamentos esperados do Carango Véio, sem definir ainda:

- layout final;
- identidade visual;
- arquitetura técnica;
- estrutura definitiva do banco;
- implementação do Firebase;
- componentes de interface;
- regras detalhadas de cálculo;
- critérios de aceite.

Esses pontos serão especificados nos documentos seguintes do SDD.

---

# 2. Escopo funcional geral

O Carango Véio deverá possuir os seguintes módulos funcionais:

1. Autenticação
2. Dashboard
3. Cadastro do veículo
4. Quilometragem
5. Manutenções
6. Problemas e correções
7. Recorrências
8. Histórico
9. Hub de peças
10. Catálogo estrutural do Sandero
11. Garantias
12. Gastos
13. Documentos
14. Alertas internos
15. Filtros e preferências de visualização
16. Configurações
17. URLs externas

---

# 3. Autenticação

## FR-AUTH-001 — Login com Google

O sistema deverá permitir autenticação exclusivamente através do Google.

## FR-AUTH-002 — Contas autorizadas

Somente as seguintes contas deverão possuir acesso:

- `mariner.eslava@gmail.com`
- `abner.eslava@gmail.com`

## FR-AUTH-003 — Mesmo conjunto de dados

As duas contas deverão acessar exatamente o mesmo conjunto de dados.

Não deverá existir separação de informações por conta.

## FR-AUTH-004 — Mesmo nível de permissão

Ambas as contas deverão possuir permissão equivalente para:

- visualizar;
- cadastrar;
- editar;
- concluir;
- arquivar;
- excluir, quando permitido;
- alterar configurações.

## FR-AUTH-005 — Bloqueio de usuários não autorizados

Uma conta Google autenticada, mas não pertencente à lista autorizada, não deverá conseguir acessar os dados da aplicação.

---

# 4. Dashboard

## FR-DASH-001 — Visão principal

Ao entrar no sistema, o usuário deverá visualizar uma visão resumida do estado atual do veículo.

## FR-DASH-002 — Quilometragem atual

O dashboard deverá exibir a quilometragem atual do veículo em posição de destaque.

## FR-DASH-003 — Manutenções vencidas

O dashboard deverá mostrar manutenções vencidas por:

- data;
- quilometragem;
- ou ambos.

## FR-DASH-004 — Manutenções próximas

O dashboard deverá mostrar manutenções que estejam dentro da faixa global de alerta configurada.

## FR-DASH-005 — Problemas pendentes

O dashboard deverá apresentar problemas ou manutenções corretivas ainda não resolvidos.

## FR-DASH-006 — Documentos próximos do vencimento

O dashboard deverá apresentar documentos com vencimento próximo ou já vencidos.

## FR-DASH-007 — Garantias próximas do vencimento

O dashboard deverá apresentar garantias próximas do vencimento por:

- data;
- quilometragem;
- ou ambos.

## FR-DASH-008 — Resumo de gastos

O dashboard deverá apresentar um resumo financeiro relacionado aos itens registráveis no sistema.

## FR-DASH-009 — Ações rápidas

O dashboard deverá possuir, no mínimo, ações rápidas para:

- atualizar quilometragem;
- registrar manutenção.

Outras ações rápidas poderão ser adicionadas posteriormente no documento de telas.

---

# 5. Cadastro inicial do veículo

## FR-VEH-001 — Configuração inicial

Na primeira utilização, o sistema deverá permitir cadastrar os dados do veículo.

## FR-VEH-002 — Veículo único

A versão inicial deverá operar com apenas um veículo.

## FR-VEH-003 — Dados editáveis

As informações cadastradas do veículo deverão poder ser editadas posteriormente.

## FR-VEH-004 — Dados gerais

O cadastro deverá estar preparado para receber, entre outros:

- fabricante;
- modelo;
- versão;
- ano;
- ano-modelo;
- motorização;
- combustível;
- cor;
- placa;
- RENAVAM;
- chassi;
- quilometragem atual;
- observações gerais;
- URL opcional de imagem.

## FR-VEH-005 — Modelo alvo inicial

O sistema deverá ser inicialmente preparado para o veículo:

**Renault Sandero Expression 2012 1.6 8V**

Os dados específicos do veículo serão preenchidos posteriormente.

---

# 6. Quilometragem

## FR-ODO-001 — Atualização manual

O usuário deverá poder informar manualmente a quilometragem atual.

## FR-ODO-002 — Data da leitura

Cada atualização de quilometragem deverá possuir uma data.

## FR-ODO-003 — Data automática

Se o usuário não informar a data manualmente, o sistema deverá utilizar a data do registro.

## FR-ODO-004 — Histórico de quilometragem

Toda atualização deverá ser salva em histórico.

## FR-ODO-005 — Edição

Uma leitura de quilometragem deverá poder ser editada posteriormente.

## FR-ODO-006 — Exclusão de leitura incorreta

O usuário deverá poder excluir uma leitura de quilometragem registrada incorretamente.

## FR-ODO-007 — Reflexo nos alertas

Alterações de quilometragem deverão atualizar os estados de:

- manutenções;
- peças com recorrência;
- garantias;
- demais itens dependentes de quilometragem.

## FR-ODO-008 — Não presumir serviço realizado

Atingir ou ultrapassar determinada quilometragem nunca deverá marcar automaticamente uma manutenção como concluída.

O sistema deverá apenas alterar seu estado de alerta.

---

# 7. Tipos de manutenção

O sistema deverá suportar quatro tipos principais.

## FR-MNT-001 — Preventiva recorrente

Manutenção planejada que se repete segundo uma regra definida.

Exemplos:

- troca de óleo;
- troca de filtro;
- alinhamento;
- revisão.

## FR-MNT-002 — Preventiva única

Manutenção planejada para ocorrer apenas uma vez.

## FR-MNT-003 — Corretiva

Manutenção relacionada a um defeito, falha, dano ou problema detectado.

## FR-MNT-004 — Inspeção / verificação

Atividade destinada apenas à conferência do estado de um componente ou sistema.

Exemplo:

> Verificar estado das pastilhas aos 155.000 km.

A inspeção não deverá presumir que haverá substituição de peças.

---

# 8. Cadastro de manutenção

## FR-MNT-005 — Criação manual

O usuário deverá poder criar uma manutenção manualmente.

## FR-MNT-006 — Campos funcionais

Uma manutenção deverá poder armazenar, conforme aplicável:

- título;
- tipo;
- descrição;
- componente relacionado;
- peças relacionadas;
- data prevista;
- quilometragem prevista;
- regra de recorrência;
- prioridade;
- status;
- observações;
- garantia;
- custo;
- oficina ou prestador;
- URLs externas.

## FR-MNT-007 — Associação com múltiplas peças

Uma única manutenção poderá envolver várias peças.

Exemplo:

> Revisão do freio dianteiro

poderá incluir:

- pastilhas;
- discos;
- fluido;
- sensores relacionados.

## FR-MNT-008 — Associação com componente

A manutenção poderá estar ligada a um componente estrutural específico do veículo.

---

# 9. Recorrência

## FR-REC-001 — Sem recorrência

Uma manutenção poderá ser pontual.

## FR-REC-002 — Recorrência por quilometragem

O usuário deverá poder definir recorrência do tipo:

> a cada X km.

## FR-REC-003 — Recorrência por tempo

O usuário deverá poder definir recorrência por:

- dias;
- meses;
- anos.

## FR-REC-004 — Recorrência combinada

O usuário deverá poder definir recorrência usando:

> X km ou Y tempo.

## FR-REC-005 — Primeiro limite atingido

Quando uma manutenção possuir limite de quilometragem e de tempo, o sistema deverá acompanhar os dois.

A regra exata de vencimento será definida no documento de regras de negócio.

## FR-REC-006 — Continuidade da mesma manutenção

Ao concluir uma manutenção recorrente:

1. a ocorrência concluída deverá entrar no histórico;
2. a manutenção continuará existindo;
3. seus próximos limites deverão ser recalculados;
4. o ciclo deverá recomeçar.

O sistema não deverá criar uma entidade conceitualmente desconectada para cada nova recorrência.

## FR-REC-007 — Conclusão exclusivamente manual

O sistema nunca deverá presumir que uma manutenção foi realizada apenas porque:

- chegou a data;
- ultrapassou a data;
- atingiu a quilometragem;
- ultrapassou a quilometragem.

A conclusão deverá depender de ação explícita do usuário.

---

# 10. Conclusão de manutenção

## FR-CMP-001 — Ação de concluir

O usuário deverá poder marcar uma manutenção como concluída.

## FR-CMP-002 — Dados da conclusão

Ao concluir, o sistema deverá permitir informar:

- data da realização;
- quilometragem;
- peças envolvidas;
- peças substituídas;
- mão de obra;
- outros custos relacionados ao serviço;
- custo total;
- oficina ou prestador;
- observações;
- garantia;
- URLs externas;
- dados necessários para a próxima recorrência.

## FR-CMP-003 — Histórico automático

A conclusão deverá gerar automaticamente um registro histórico permanente.

## FR-CMP-004 — Atualização das peças

Quando a manutenção envolver instalação, substituição ou remoção de peças, o Hub de Peças deverá ser atualizado de acordo com o registro realizado.

## FR-CMP-005 — Próxima recorrência

Quando aplicável, a conclusão deverá recalcular a próxima ocorrência.

## FR-CMP-006 — Edição posterior

Uma manutenção concluída deverá poder ser corrigida posteriormente.

Alterações que afetem:

- quilometragem;
- data;
- peças;
- custos;
- recorrência;

deverão atualizar os dados derivados relacionados.

As regras de consistência serão detalhadas posteriormente.

---

# 11. Problemas e manutenção corretiva

## FR-ISS-001 — Registro de problema

O usuário deverá poder cadastrar um problema detectado no carro.

## FR-ISS-002 — Estados

Problemas deverão suportar os seguintes estados:

- Identificado
- Pendente
- Em andamento
- Adiado
- Resolvido
- Ignorado / Não será feito

## FR-ISS-003 — Prioridade

Problemas deverão suportar:

- Baixa
- Média
- Alta
- Urgente

## FR-ISS-004 — Descrição livre

O problema deverá possuir campo livre para descrição detalhada.

## FR-ISS-005 — Conversão em histórico

Quando resolvido através de uma manutenção, o problema deverá permanecer rastreável no histórico.

## FR-ISS-006 — Associação

Um problema poderá ser associado a:

- um componente;
- uma ou mais peças;
- uma manutenção corretiva.

---

# 12. Hub de Peças

## FR-PART-001 — Área dedicada

O sistema deverá possuir uma área chamada **Peças**.

## FR-PART-002 — Representação do estado do carro

Essa área deverá representar o conjunto estrutural de componentes e peças do veículo.

Não deverá funcionar como controle de estoque.

## FR-PART-003 — Origem dos dados

O Hub de Peças deverá consolidar:

- catálogo estrutural hardcoded do veículo;
- peças atualmente instaladas;
- histórico de substituições;
- histórico de remoções;
- manutenções relacionadas.

## FR-PART-004 — Peça específica

Uma peça instalada poderá armazenar informações como:

- nome comercial;
- fabricante;
- marca;
- modelo;
- código;
- condição;
- data de instalação;
- quilometragem da instalação;
- custo;
- fornecedor;
- garantia;
- posição;
- observações;
- URL da imagem;
- URL da nota fiscal;
- URL do fabricante ou produto.

## FR-PART-005 — Estados/ocorrências

O sistema deverá trabalhar com três ocorrências principais:

### Instalada

Há uma peça ocupando atualmente o componente/posição correspondente.

### Substituída

Uma peça anteriormente instalada deixou de ser atual porque outra foi colocada em seu lugar.

A peça substituída deverá sair da visão de peças atuais e permanecer somente no histórico.

### Removida/Descartada

Uma peça saiu do veículo sem que outra tenha ocupado imediatamente seu lugar.

A peça removida não deverá permanecer como item atual ou estoque.

Ela deverá existir somente no histórico.

---

# 13. Peça faltando

## FR-PART-006 — Estado estrutural

Quando um componente esperado estiver sem peça instalada, o Hub deverá poder representar:

> Peça faltando

## FR-PART-007 — Componentes essenciais

O catálogo estrutural deverá identificar componentes considerados essenciais ou obrigatórios.

## FR-PART-008 — Alerta automático de ausência

Se uma peça essencial for removida sem substituição, o sistema deverá gerar um alerta interno de **peça faltando**.

## FR-PART-009 — Componentes opcionais

Componentes opcionais poderão ficar sem peça instalada sem necessariamente gerar alerta crítico.

## FR-PART-010 — Exemplo

Se a bateria for removida sem instalação de outra:

- a bateria antiga deverá ir para o histórico;
- o componente **Bateria** permanecerá no Hub;
- seu estado atual deverá ser **Peça faltando**;
- o sistema deverá exibir alerta correspondente.

---

# 14. Substituição automática de estado

## FR-PART-011 — Troca direta

Quando o usuário registrar uma nova peça substituindo outra:

1. a peça antiga deverá ser marcada historicamente como **Substituída**;
2. a nova deverá ser marcada como **Instalada**;
3. a posição deverá passar a apontar para a nova peça;
4. o histórico deverá preservar as duas ocorrências.

## FR-PART-012 — Motivo em texto livre

Ao substituir ou remover uma peça, o usuário deverá poder escrever livremente o motivo.

Não deverá existir lista obrigatória de motivos predefinidos.

O motivo poderá conter um parágrafo completo.

---

# 15. Componente x peça

## FR-PART-013 — Componente estrutural

O sistema deverá distinguir o **componente do veículo** da **peça específica instalada**.

Exemplo:

```text
Componente:
Bateria

Peça atual:
Moura M60GD
```

## FR-PART-014 — Persistência do componente

O componente deverá continuar existindo no Hub mesmo se a peça instalada for:

- substituída;
- removida;
- descartada.

## FR-PART-015 — Histórico de peças

Cada componente deverá permitir consultar o histórico de peças que já ocuparam aquela função/posição.

---

# 16. Catálogo estrutural hardcoded do Sandero

## FR-CAT-001 — Catálogo específico

A versão inicial deverá possuir um catálogo estrutural hardcoded específico para:

**Renault Sandero Expression 2012 1.6 8V**

## FR-CAT-002 — Abrangência

O catálogo deverá buscar representar de forma ampla os componentes relevantes do veículo, incluindo sistemas como:

- motor;
- lubrificação;
- alimentação;
- ignição;
- arrefecimento;
- transmissão;
- embreagem;
- escapamento;
- suspensão;
- direção;
- freios;
- rodas e pneus;
- sistema elétrico;
- bateria e carga;
- iluminação;
- climatização;
- carroceria;
- vidros;
- portas;
- interior;
- segurança;
- itens documentáveis de manutenção.

## FR-CAT-003 — Itens ainda não registrados

Um componente hardcoded deverá poder aparecer mesmo que o usuário nunca tenha registrado manutenção nele.

Nesse caso, deverá possuir estado equivalente a:

> Sem informações cadastradas

## FR-CAT-004 — Fonte futura do catálogo

A relação exata de componentes deverá ser documentada em arquivo próprio e validada com fontes técnicas adequadas antes da implementação final.

Nenhuma peça específica deverá ser inventada como original do veículo sem verificação.

---

# 17. Localização da peça

## FR-LOC-001 — Posições predefinidas

Toda localização deverá ser selecionada a partir de uma lista predefinida.

## FR-LOC-002 — Sem texto livre

O usuário não deverá cadastrar posições arbitrárias através de texto livre.

## FR-LOC-003 — Lista abrangente

A lista deverá ser suficientemente ampla para cobrir regiões e posições relevantes do veículo.

## FR-LOC-004 — Pesquisa

O seletor de localização deverá permitir pesquisa por texto.

## FR-LOC-005 — Exemplos de grupos

A lista deverá contemplar, no mínimo, grupos conceituais como:

- Geral / sem lateralidade
- Dianteira
- Traseira
- Esquerda
- Direita
- Dianteira esquerda
- Dianteira direita
- Traseira esquerda
- Traseira direita
- Eixo dianteiro
- Eixo traseiro
- Cofre do motor
- Motor
- Transmissão
- Sistema de escapamento
- Porta dianteira esquerda
- Porta dianteira direita
- Porta traseira esquerda
- Porta traseira direita
- Interior
- Painel
- Porta-malas
- Teto
- Roda dianteira esquerda
- Roda dianteira direita
- Roda traseira esquerda
- Roda traseira direita

A lista final deverá ser expandida em documento específico.

---

# 18. Recorrência de peça

## FR-PART-016 — Recorrência própria

Uma peça instalada poderá possuir regra própria de acompanhamento.

## FR-PART-017 — Critérios

A recorrência da peça poderá usar:

- quilometragem;
- tempo;
- quilometragem ou tempo.

## FR-PART-018 — Geração de acompanhamento

Quando uma peça possuir regra de recorrência, o sistema deverá criar ou manter um acompanhamento de manutenção associado a ela.

## FR-PART-019 — Sem conclusão automática

Mesmo que a peça atinja seu limite previsto, o sistema deverá apenas:

- alertar;
- marcar como próxima;
- marcar como vencida, quando aplicável.

O sistema não deverá assumir que a peça foi substituída ou revisada.

---

# 19. Filtros do Hub de Peças

## FR-FLT-001 — Filtros múltiplos

O usuário deverá poder combinar vários filtros simultaneamente.

## FR-FLT-002 — Exemplos

Os filtros deverão poder incluir critérios como:

- categoria;
- sistema;
- posição;
- estado;
- possui histórico;
- possui garantia;
- garantia próxima do vencimento;
- possui recorrência;
- possui alerta;
- peça faltando.

## FR-FLT-003 — Persistência

Os filtros selecionados deverão permanecer salvos entre acessos até que o usuário os altere ou limpe.

## FR-FLT-004 — Visualização de todas

Por padrão funcional, o Hub deverá ser capaz de mostrar simultaneamente:

- componentes com peças instaladas;
- componentes sem informações;
- componentes com peça faltando;
- componentes com histórico de substituição.

Itens históricos individuais não deverão ser confundidos com peças atualmente instaladas.

---

# 20. Garantias

## FR-WAR-001 — Garantia de peça

Uma peça poderá possuir garantia.

## FR-WAR-002 — Garantia de serviço

Uma manutenção ou serviço também poderá possuir garantia própria.

## FR-WAR-003 — Garantia por data

A garantia poderá ser definida por tempo/data.

## FR-WAR-004 — Garantia por quilometragem

A garantia poderá ser definida por quilometragem.

## FR-WAR-005 — Garantia combinada

A garantia poderá possuir simultaneamente limite de:

- tempo;
- quilometragem.

## FR-WAR-006 — Alertas

Garantias próximas do vencimento deverão gerar alerta interno.

## FR-WAR-007 — Histórico

Garantias expiradas deverão permanecer vinculadas ao histórico correspondente.

---

# 21. Gastos

## FR-EXP-001 — Gastos relacionados

O sistema deverá registrar somente gastos vinculados a itens pertencentes ao escopo funcional do aplicativo.

## FR-EXP-002 — Exemplos permitidos

Poderão gerar gastos:

- manutenção;
- peças;
- mão de obra;
- documentação;
- seguro;
- impostos do veículo;
- garantias ou serviços diretamente relacionados ao veículo.

## FR-EXP-003 — Fora do escopo

Não deverão fazer parte do controle financeiro:

- combustível;
- estacionamento;
- lavagem;
- despesas genéricas de uso;
- gastos não relacionados aos módulos existentes.

## FR-EXP-004 — Composição do custo

Uma manutenção poderá possuir:

- custo de peças;
- custo de mão de obra;
- outros custos diretamente relacionados;
- total calculado.

## FR-EXP-005 — Histórico financeiro

O sistema deverá permitir consultar gastos históricos.

---

# 22. Documentos

## FR-DOC-001 — Cadastro

O usuário deverá poder cadastrar documentos relacionados ao veículo.

## FR-DOC-002 — Tipos predefinidos

O sistema poderá fornecer tipos iniciais como:

- IPVA;
- licenciamento;
- seguro.

## FR-DOC-003 — Tipo personalizado

O usuário deverá poder criar documentos de tipo personalizado.

## FR-DOC-004 — Campos

Um documento poderá conter:

- nome;
- tipo;
- número ou referência;
- data de emissão;
- data de vencimento;
- valor;
- situação;
- observações;
- URL externa.

## FR-DOC-005 — Alertas

Documentos com data de vencimento deverão participar do sistema de alertas internos.

---

# 23. Alertas internos

## FR-ALT-001 — Somente no aplicativo

A primeira versão deverá utilizar apenas alertas internos.

## FR-ALT-002 — Alertas por quilometragem

O sistema deverá alertar itens próximos ou vencidos por quilometragem.

## FR-ALT-003 — Alertas por data

O sistema deverá alertar itens próximos ou vencidos por data.

## FR-ALT-004 — Alertas de peça faltando

O sistema deverá alertar ausência de componentes essenciais.

## FR-ALT-005 — Alertas de garantia

O sistema deverá alertar garantias próximas ou vencidas.

## FR-ALT-006 — Alertas de documentos

O sistema deverá alertar documentos próximos ou vencidos.

## FR-ALT-007 — Configuração global

Os limites de antecedência deverão ser globais.

Exemplos conceituais:

- avisar X km antes;
- avisar X dias antes.

Os valores exatos serão definidos posteriormente.

## FR-ALT-008 — Persistência visual

Enquanto a condição continuar relevante, o alerta deverá permanecer visível dentro do aplicativo.

---

# 24. Histórico

## FR-HIS-001 — Registro permanente

O histórico deverá registrar eventos relevantes ocorridos no veículo.

## FR-HIS-002 — Eventos

O histórico deverá contemplar, conforme aplicável:

- manutenção concluída;
- inspeção concluída;
- problema resolvido;
- peça instalada;
- peça substituída;
- peça removida;
- garantia associada;
- alterações documentais relevantes;
- custos relacionados.

## FR-HIS-003 — Edição

Registros históricos deverão poder ser editados para correção.

## FR-HIS-004 — Preservação

Alterações em cadastros atuais não deverão apagar automaticamente registros históricos.

## FR-HIS-005 — Relações

O histórico deverá manter relações com:

- componentes;
- peças;
- manutenções;
- problemas;
- custos;
- garantias;
- documentos, quando aplicável.

---

# 25. Exclusão, arquivamento e proteção

## FR-DEL-001 — Tarefas futuras

Tarefas ou manutenções futuras poderão ser excluídas.

## FR-DEL-002 — Cadastros incorretos

Peças ou registros criados por engano poderão ser excluídos quando ainda não fizerem parte de um histórico dependente.

## FR-DEL-003 — Histórico concluído

Registros históricos concluídos deverão preferencialmente ser:

- editados;
- ou arquivados.

## FR-DEL-004 — Exclusão histórica excepcional

A exclusão definitiva de um registro histórico deverá exigir confirmação explícita.

## FR-DEL-005 — Dependências

Se uma exclusão puder afetar:

- peça atual;
- recorrência;
- custos;
- garantia;
- histórico;

o sistema deverá informar o impacto antes de concluir a ação.

---

# 26. URLs externas

## FR-URL-001 — Uso opcional

Campos de URL deverão ser opcionais.

## FR-URL-002 — Aplicações

URLs poderão ser associadas a:

- veículo;
- peça;
- manutenção;
- documento;
- garantia;
- comprovante;
- nota fiscal;
- fabricante;
- produto.

## FR-URL-003 — Sem upload próprio

A versão inicial não deverá depender de armazenamento próprio de arquivos ou imagens.

---

# 27. Pesquisa e localização de informações

## FR-SRC-001 — Pesquisa

As áreas com grande volume de itens deverão permitir pesquisa.

## FR-SRC-002 — Peças

O Hub de Peças deverá permitir localizar componentes ou peças por nome.

## FR-SRC-003 — Posições

A lista predefinida de posições deverá possuir busca.

## FR-SRC-004 — Histórico

O histórico deverá permitir localizar registros por texto e filtros.

Os critérios exatos serão detalhados no documento de telas.

---

# 28. Configurações funcionais

## FR-SET-001 — Alertas globais

O usuário deverá poder configurar globalmente:

- antecedência em quilômetros;
- antecedência em dias.

## FR-SET-002 — Persistência

As configurações deverão ser persistidas.

## FR-SET-003 — Preferências de visualização

Filtros persistentes e outras preferências de visualização deverão ser armazenados.

---

# 29. Comportamentos que o sistema não deverá executar automaticamente

Para evitar inferências incorretas sobre o estado real do carro, o sistema **não deverá**:

1. marcar manutenção como realizada apenas porque venceu;
2. marcar peça como substituída apenas porque atingiu vida útil estimada;
3. considerar inspeção como troca;
4. considerar alerta resolvido sem ação do usuário;
5. criar estoque de peças removidas;
6. presumir que uma peça comprada foi instalada;
7. presumir que uma peça faltante foi substituída;
8. excluir histórico ao atualizar o estado atual;
9. considerar quilometragem estimada como quilometragem real;
10. interpretar recorrência como evidência de execução.

---

# 30. Resumo do fluxo funcional principal

```text
Usuário atualiza KM
        ↓
Sistema recalcula estados
        ↓
Itens podem ficar:
OK / Próximos / Vencidos / Pendentes
        ↓
Usuário realiza uma manutenção
        ↓
Marca manualmente como concluída
        ↓
Informa dados reais do serviço
        ↓
Sistema registra histórico
        ↓
Atualiza peças e custos
        ↓
Atualiza garantias
        ↓
Recalcula recorrência
        ↓
Novo ciclo passa a ser acompanhado
```

---

# 31. Dependências de especificação futura

Este documento estabelece os requisitos funcionais, mas depende dos seguintes documentos posteriores:

- regras de negócio;
- catálogo completo do Sandero Expression 2012 1.6 8V;
- modelo de dados;
- arquitetura de informação;
- telas;
- fluxos;
- design system;
- alertas;
- arquitetura técnica;
- segurança;
- casos extremos;
- critérios de aceite.

Esses documentos deverão detalhar as regras necessárias para implementar os requisitos aqui definidos sem ambiguidade.
