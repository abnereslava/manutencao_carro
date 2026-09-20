# Carango Véio — Visão Geral do Produto

## 1. Identificação

**Nome do aplicativo:** Carango Véio  
**Nome do repositório:** `manutencao_carro`  
**Tipo de aplicação:** aplicação web responsiva para desktop e dispositivos móveis  
**Uso:** pessoal  
**Escopo inicial:** um único veículo

---

## 2. Visão do produto

O **Carango Véio** é uma aplicação pessoal para centralizar o acompanhamento técnico, documental e financeiro de um veículo.

O sistema deverá permitir registrar o estado atual do carro, peças instaladas, serviços realizados, manutenções futuras, problemas identificados, documentos, garantias e despesas.

O objetivo principal é transformar o histórico do veículo em uma base organizada e utilizável para responder rapidamente perguntas como:

- O que já foi trocado no carro?
- Quando determinada peça foi instalada?
- Com quantos quilômetros um serviço foi realizado?
- Quando determinada manutenção deverá ser feita novamente?
- Quais serviços estão próximos do vencimento?
- Quais serviços já estão atrasados?
- Quanto foi gasto com o veículo?
- Qual peça está atualmente instalada?
- Qual a garantia de determinada peça ou serviço?
- Onde determinada manutenção foi realizada?
- Quais problemas ainda estão pendentes?
- Quais documentos do veículo estão próximos do vencimento?

O aplicativo deverá funcionar como um **histórico técnico permanente do veículo** e, ao mesmo tempo, como uma **agenda inteligente de manutenção**.

---

## 3. Problema que o sistema resolve

Informações sobre manutenção de veículos normalmente ficam dispersas entre:

- memória do proprietário;
- notas fiscais;
- conversas;
- comprovantes;
- agendas;
- oficinas;
- planilhas;
- documentos físicos.

Isso dificulta saber com precisão quando uma manutenção foi realizada e quando deverá ser feita novamente.

O Carango Véio deverá concentrar essas informações em um único sistema.

A aplicação deverá permitir que uma manutenção realizada hoje seja utilizada automaticamente para calcular sua próxima ocorrência, quando existir uma regra de recorrência.

Exemplo conceitual:

```text
Troca de óleo realizada
Data: 20/09/2026
Quilometragem: 148.200 km

Regra cadastrada:
10.000 km ou 12 meses

Próximos limites:
158.200 km
20/09/2027
```

Quando configurada dessa forma, a manutenção deverá ser considerada de acordo com o primeiro limite aplicável atingido.

As regras exatas desse comportamento serão definidas no documento de regras de negócio.

---

## 4. Objetivos do sistema

### 4.1 Manutenção preventiva

Registrar serviços planejados que devem ser realizados periodicamente.

Exemplos:

- troca de óleo;
- troca de filtros;
- correias;
- fluidos;
- velas;
- pneus;
- alinhamento;
- balanceamento;
- revisões.

As manutenções poderão ter recorrência baseada em:

- quilometragem;
- data;
- combinação de quilometragem e data.

### 4.2 Manutenção corretiva

Registrar problemas encontrados no veículo e acompanhar sua resolução.

Exemplo:

```text
Problema:
Barulho na suspensão dianteira

Status:
Pendente
```

Após a resolução, o registro deverá passar a fazer parte do histórico permanente do veículo.

---

## 5. Histórico do veículo

Toda manutenção concluída deverá gerar um registro histórico.

O histórico deverá permitir consultar, entre outras informações:

- serviço realizado;
- data;
- quilometragem;
- peças utilizadas;
- custo;
- oficina ou prestador;
- observações;
- garantia;
- links relacionados.

Registros históricos não deverão depender da existência atual da peça, tarefa ou plano de manutenção que os originou.

O histórico deverá preservar o que efetivamente aconteceu com o veículo.

---

## 6. Inventário de peças

O sistema deverá possuir um inventário das peças instaladas no veículo.

Uma peça não deverá existir apenas como texto dentro de uma manutenção.

Ela poderá possuir registro próprio contendo informações como:

- nome;
- categoria;
- fabricante;
- marca;
- modelo;
- código;
- data de instalação;
- quilometragem da instalação;
- preço;
- fornecedor;
- garantia;
- situação atual;
- observações;
- URL externa para imagem;
- URL externa para nota fiscal ou comprovante.

O sistema deverá permitir identificar quais peças estão atualmente instaladas e quais pertencem apenas ao histórico do veículo.

---

## 7. Gastos

O Carango Véio deverá registrar os custos relacionados às manutenções e peças do veículo.

Os registros poderão incluir, conforme aplicável:

- custo da peça;
- mão de obra;
- outros custos;
- custo total.

Posteriormente, esses dados poderão alimentar resumos e indicadores financeiros do veículo.

O controle de combustível não fará parte do sistema.

Portanto, o escopo não inclui:

- abastecimentos;
- consumo médio;
- preço por litro;
- autonomia;
- custo de combustível por quilômetro.

---

## 8. Informações do veículo

O aplicativo deverá possuir uma área dedicada às informações do carro.

O aplicativo já nascerá vinculado ao único veículo do projeto: **Renault Sandero Expression 2012 1.6 8V**.

Não haverá fluxo de cadastro ou criação de veículo. A área **Veículo** servirá para preencher, completar e editar os dados do Sandero já existente no sistema.

Os dados exatos do veículo serão definidos posteriormente.

O sistema deverá estar preparado para armazenar informações como:

- fabricante;
- modelo;
- versão;
- ano;
- motorização;
- quilometragem atual;
- placa;
- RENAVAM;
- chassi;
- combustível;
- cor;
- informações de seguro;
- informações de licenciamento;
- outras informações relevantes.

Nenhuma informação documental ou identificadora específica do veículo deverá ser presumida nesta etapa da documentação.

---

## 9. Documentos e vencimentos

O sistema também deverá permitir controlar informações relacionadas à documentação do veículo.

Poderão existir registros como:

- licenciamento;
- seguro;
- IPVA;
- garantias;
- outros documentos ou compromissos associados ao veículo.

Quando houver uma data relevante, o sistema deverá poder apresentá-la juntamente com os demais eventos próximos.

---

## 10. URLs externas

O Carango Véio não terá como requisito inicial o armazenamento próprio de fotografias ou arquivos.

Em vez disso, determinados registros poderão possuir campos opcionais para URLs externas.

Exemplos:

- URL da foto do veículo;
- URL da foto de uma peça;
- URL de nota fiscal;
- URL de comprovante;
- URL de documento;
- URL de página do fabricante;
- URL de produto.

O aplicativo deverá armazenar apenas o endereço informado.

O armazenamento de imagens pelo próprio sistema não faz parte do escopo inicial.

---

## 11. Quilometragem

A quilometragem atual será um dos dados centrais da aplicação.

O sistema deverá permitir atualizar a quilometragem do veículo regularmente.

Cada atualização deverá poder ser utilizada pelos mecanismos responsáveis por identificar manutenções:

- próximas;
- vencidas;
- ainda dentro do intervalo previsto.

O histórico de quilometragem será especificado posteriormente no modelo de dados e nas regras de negócio.

---

## 12. Alertas

Os alertas existirão exclusivamente dentro da interface do Carango Véio nesta primeira versão.

Não fazem parte do escopo inicial:

- notificações push;
- e-mails automáticos;
- SMS;
- WhatsApp;
- notificações externas.

Enquanto houver uma situação relevante, o aplicativo deverá manter o aviso visível de forma apropriada dentro da interface.

Os possíveis estados e níveis de urgência serão definidos posteriormente.

---

## 13. Usuários autorizados

O sistema será de uso pessoal.

Existirão somente duas contas Google autorizadas:

- `mariner.eslava@gmail.com`
- `abner.eslava@gmail.com`

As duas contas acessarão exatamente os mesmos dados e possuirão os mesmos privilégios dentro da aplicação, incluindo:

- visualizar;
- criar;
- editar;
- concluir;
- arquivar;
- excluir registros, quando essa operação estiver disponível.

Não existirão dados separados por conta.

As duas identidades representam acessos autorizados ao mesmo conjunto de dados.

> **Requisito de segurança:** nenhum segredo, token, chave privada ou credencial deverá ser versionado no repositório. A autorização efetiva deverá ser aplicada também no backend/Firebase, e não apenas na interface.

---

## 14. Autenticação

O acesso deverá ocorrer exclusivamente através de autenticação Google.

Nenhuma outra forma de autenticação deverá ser necessária na versão inicial.

Não deverão existir:

- cadastro por senha;
- login por usuário e senha próprios;
- cadastro público;
- criação aberta de contas.

Somente as duas contas Google autorizadas deverão possuir acesso aos dados da aplicação.

---

## 15. Segurança

Os dados do veículo poderão conter informações privadas, incluindo informações documentais.

Depois da autenticação, esses dados poderão ser exibidos normalmente na interface.

O sistema não precisará mascarar automaticamente:

- placa;
- RENAVAM;
- chassi;
- dados documentais cadastrados.

Por esse motivo, a proteção do acesso aos dados será um requisito obrigatório da arquitetura.

As regras do Firebase deverão ser definidas de forma restritiva, autorizando acesso somente às identidades permitidas. A interface não deverá ser considerada uma barreira de segurança.

A especificação técnica dessas regras será feita posteriormente no documento de arquitetura e segurança.

---

## 16. Escopo de usuários

Apesar de existirem duas contas Google autorizadas, o produto deverá ser tratado conceitualmente como um sistema pessoal de **um único proprietário lógico**.

Não será necessário implementar nesta versão:

- cadastro de usuários;
- gerenciamento de membros;
- convites;
- permissões diferentes;
- equipes;
- organizações;
- compartilhamento entre proprietários.

A estrutura de código deverá, quando razoável, evitar decisões que tornem extremamente difícil adicionar múltiplos usuários futuramente.

Entretanto, recursos multiusuário não deverão ser implementados antecipadamente.

---

## 17. Escopo de veículos

A primeira versão será projetada para um único veículo.

Não será necessário implementar:

- seletor de veículos;
- garagem;
- múltiplos carros;
- transferência de registros entre veículos.

A arquitetura deverá evitar dependências desnecessárias que impeçam futura expansão para múltiplos veículos.

A interface inicial, entretanto, deverá permanecer orientada para apenas um carro.

---

## 18. Plataformas

O Carango Véio deverá funcionar em:

- desktop;
- smartphone.

A aplicação deverá possuir design responsivo.

Nenhuma das duas experiências deverá ser tratada como simples adaptação secundária da outra.

### Desktop

Maior quantidade de informação simultânea, tabelas, painéis e ações rápidas.

### Mobile

Cards, navegação adequada para toque, controles dimensionados para telas menores e priorização das informações mais importantes.

A especificação completa de responsividade será realizada nos documentos de telas e design system.

---

## 19. Princípios do produto

### 19.1 Registrar uma vez, reutilizar a informação

Uma manutenção concluída deverá alimentar automaticamente outras partes do sistema sempre que possível.

### 19.2 Histórico não deve ser perdido

Alterações futuras em peças, planos ou configurações não deverão apagar o que aconteceu anteriormente.

### 19.3 Próxima ação deve estar evidente

Ao abrir o aplicativo, o usuário deverá conseguir identificar rapidamente:

- o que está vencido;
- o que está próximo;
- o que está pendente;
- o que está normal.

### 19.4 Reduzir preenchimento repetitivo

Quando uma informação puder ser derivada de dados já registrados, o sistema deverá preferir o cálculo automático.

### 19.5 Permitir edição sem comprometer consistência

Os registros deverão ser editáveis quando necessário, mas alterações que possam afetar cálculos, histórico ou relacionamentos deverão possuir comportamento definido.

### 19.6 Interface simples com dados completos

O sistema poderá armazenar muitos detalhes, mas a interface principal não deverá apresentar todas as informações simultaneamente.

Informações secundárias deverão estar disponíveis sob demanda.

### 19.7 Mobile e desktop são experiências de primeira classe

Funcionalidades essenciais deverão estar acessíveis nas duas plataformas.

---

## 20. Fora do escopo inicial

Não fazem parte do escopo inicial:

- controle de combustível;
- abastecimentos;
- consumo médio;
- integração com oficinas;
- integração com montadoras;
- leitura automática da ECU;
- integração OBD-II;
- notificações push;
- notificações por e-mail;
- WhatsApp;
- SMS;
- upload próprio de fotos;
- armazenamento próprio de notas fiscais;
- múltiplos veículos;
- múltiplos proprietários;
- cadastro público;
- controle de permissões por usuário;
- marketplace de peças;
- compra de peças dentro da aplicação.

Esses itens poderão ser avaliados posteriormente sem fazer parte dos requisitos da primeira versão.

---

## 21. Visão conceitual

```text
CARANGO VÉIO
│
├── Veículo
│   ├── Informações
│   ├── Documentos
│   └── Quilometragem
│
├── Manutenções
│   ├── Preventivas
│   ├── Corretivas
│   ├── Pendentes
│   ├── Próximas
│   └── Vencidas
│
├── Peças
│   ├── Atualmente instaladas
│   └── Histórico
│
├── Histórico
│   └── Serviços realizados
│
├── Gastos
│
└── Configurações
```

---

## 22. Ciclo principal

```text
Registrar estado atual do veículo
            ↓
Cadastrar manutenção ou problema
            ↓
Executar serviço
            ↓
Registrar serviço concluído
            ↓
Atualizar histórico
            ↓
Atualizar peças instaladas
            ↓
Registrar custos
            ↓
Calcular próxima manutenção
            ↓
Acompanhar novo vencimento
```

Esse ciclo será detalhado posteriormente nos documentos de regras de negócio e fluxos de usuário.

---

## 23. Resultado esperado

Ao final da implementação, o Carango Véio deverá funcionar como uma base pessoal centralizada capaz de mostrar:

```text
O que existe atualmente no carro
+
O que já aconteceu com o carro
+
O que precisa ser feito agora
+
O que precisará ser feito futuramente
+
Quanto tudo isso custou
```

Essa será a definição central do produto e deverá orientar os documentos subsequentes do SDD.
