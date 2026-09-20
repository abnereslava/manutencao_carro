# Carango Véio — Sistema de Alertas

## 1. Objetivo

Este documento define como o Carango Véio deverá gerar, priorizar, exibir, adiar, ocultar e encerrar alertas internos.

A primeira versão utilizará somente alertas dentro do aplicativo.

Não fazem parte deste sistema inicial:

- push notifications;
- e-mails automáticos;
- SMS;
- WhatsApp;
- notificações externas.

---

# 2. Princípios gerais

## ALT-GEN-001 — Central única

Todos os alertas ativos deverão poder ser consultados em uma Central de Alertas única.

## ALT-GEN-002 — Alertas também aparecem contextualmente

Além da central, alertas poderão aparecer em:

- Dashboard;
- listas;
- detalhes de manutenção;
- detalhe de peça;
- detalhe de documento;
- detalhe de garantia;
- detalhe de problema.

## ALT-GEN-003 — Ver não significa resolver

Visualizar um alerta não deverá removê-lo automaticamente.

## ALT-GEN-004 — Estado persiste enquanto a condição existir

O alerta deverá permanecer ativo enquanto sua condição de origem continuar verdadeira, salvo regras específicas de ocultação ou snooze.

---

# 3. Tipos de alerta

O sistema deverá suportar, no mínimo:

1. Peça faltando essencial
2. Manutenção vencida
3. Manutenção próxima
4. Problema urgente
5. Documento vencido
6. Documento próximo
7. Garantia vencida
8. Garantia próxima
9. Inspeção vencida
10. Inspeção próxima
11. Recorrência vencida
12. Recorrência próxima

---

# 4. Central de Alertas

## ALT-CEN-001 — Acesso

O sistema deverá possuir uma central única, acessível a partir da interface principal.

## ALT-CEN-002 — Contador

A central deverá exibir contador de alertas ativos.

## ALT-CEN-003 — Agrupamento

Alertas poderão ser agrupados por:

- gravidade;
- tipo;
- área;
- status;
- data;
- componente.

## ALT-CEN-004 — Ordenação padrão

A ordenação deverá priorizar:

1. Peça faltando essencial
2. Vencida
3. Urgente
4. Próxima
5. Informativa

## ALT-CEN-005 — Ação direta

Clicar/tocar em um alerta deverá abrir diretamente o item responsável.

---

# 5. Estados do alerta

Um alerta poderá possuir estados internos como:

- ativo;
- visto;
- adiado;
- ocultado;
- resolvido;
- expirado.

## ALT-STA-001 — Visto

"Visto" apenas indica que o usuário abriu ou leu o alerta.

Não deverá removê-lo da central se a condição continuar ativa.

---

# 6. Alertas por quilometragem

## ALT-KM-001 — Limite global

Valor padrão:

**1.000 km antes**

## ALT-KM-002 — Próxima

Se faltar até 1.000 km para o vencimento:

```text
estado = Próxima
```

## ALT-KM-003 — Vencida

Ao atingir ou ultrapassar o limite:

```text
estado = Vencida
```

## ALT-KM-004 — Exibir distância restante

Exemplo:

> Faltam 800 km.

## ALT-KM-005 — Exibir atraso

Exemplo:

> Vencida há 320 km.

---

# 7. Alertas por data

## ALT-DATE-001 — Limite global

Valor padrão:

**60 dias antes**

## ALT-DATE-002 — Próxima

Quando restarem até 60 dias:

```text
estado = Próxima
```

## ALT-DATE-003 — Vencida

Quando a data chegar ou passar:

```text
estado = Vencida
```

## ALT-DATE-004 — Exibir tempo restante

Exemplo:

> Faltam 43 dias.

## ALT-DATE-005 — Exibir atraso

Exemplo:

> Vencida há 18 dias.

---

# 8. Alertas combinados de data + KM

Quando um item possuir os dois critérios, o alerta deverá mostrar ambos.

Exemplo:

> Faltam 800 km ou 43 dias.

## ALT-COMB-001 — Critério mais próximo

A interface deverá destacar qual critério representa maior urgência.

## ALT-COMB-002 — Primeiro vencimento prevalece

Se qualquer um dos critérios estiver vencido, o alerta será Vencido.

Exemplo:

```text
Data vencida há 5 dias
KM ainda faltando 2.000
→ Vencida
```

---

# 9. Manutenção vencida

O alerta deverá mostrar, quando disponível:

- título;
- componente;
- data prevista;
- KM previsto;
- atraso em dias;
- atraso em KM;
- prioridade;
- ação principal.

## Ações

- Abrir manutenção
- Concluir
- Adiar alerta, quando permitido

---

# 10. Manutenção próxima

Mostrar:

- quanto falta em KM;
- quanto falta em dias;
- critério mais próximo;
- prioridade;
- componente.

---

# 11. Peça faltando essencial

## ALT-MISS-001 — Gravidade máxima

Peça faltando essencial deverá possuir prioridade máxima.

## ALT-MISS-002 — Sempre no topo

Deverá aparecer antes de outros alertas na central.

## ALT-MISS-003 — Não pode ser adiada

Não deverá existir ação:

- adiar;
- snooze;
- ocultar.

## ALT-MISS-004 — Resolução

Só poderá desaparecer quando:

- nova peça for instalada;
- componente deixar de ser considerado faltante por correção de dados.

## ALT-MISS-005 — Acesso direto

O alerta deverá abrir o componente afetado.

---

# 12. Problema urgente

Problemas com prioridade Urgente deverão gerar alerta ativo.

## Ações

- Abrir problema
- Iniciar manutenção
- Alterar status
- Adiar alerta, quando permitido

A alteração de alerta não deverá alterar automaticamente o status do problema.

---

# 13. Documentos

## Próximo

Usa o limite global de 60 dias.

## Vencido

Permanece alerta enquanto o documento estiver vencido e ainda relevante.

## Ações

- Abrir documento
- Registrar renovação
- Adiar alerta
- Ocultar, quando aplicável

---

# 14. Garantias próximas do vencimento

Garantias deverão alertar por:

- data;
- KM;
- ambos.

Exemplo:

> Garantia termina em 12 dias ou 600 km.

---

# 15. Garantias vencidas

## ALT-WAR-001 — Persistência pós-vencimento

Após vencer, a garantia deverá continuar aparecendo na Central de Alertas por:

**7 dias**

## ALT-WAR-002 — Após 7 dias

Depois de 7 dias:

- remover da Central de Alertas;
- manter no histórico;
- manter visível no detalhe da peça/serviço.

## ALT-WAR-003 — Ocultação manual

O usuário poderá ocultar a garantia vencida antes do fim dos 7 dias.

## ALT-WAR-004 — Histórico

Ocultar ou expirar o alerta não deverá apagar o registro de garantia.

---

# 16. Snooze / Adiar alerta

Alertas permitidos poderão ser adiados.

## ALT-SNOOZE-001 — Por tempo

Opções padrão:

- 1 dia
- 7 dias
- 30 dias
- data personalizada

## ALT-SNOOZE-002 — Por quilometragem

Opções padrão:

- 100 km
- 500 km
- 1.000 km
- valor personalizado

## ALT-SNOOZE-003 — Combinação

Quando o usuário definir condição de tempo e KM, o alerta deverá reaparecer quando qualquer uma das condições for atingida primeiro.

## ALT-SNOOZE-004 — Persistência

O snooze deverá ser salvo entre sessões.

## ALT-SNOOZE-005 — Exceção

Peça faltando essencial não poderá usar snooze.

---

# 17. Alerta adiado

Enquanto estiver adiado:

- não aparecer na lista principal de alertas ativos;
- poderá aparecer em seção "Adiados";
- continuará associado ao item original.

## Ação

- Reativar agora

---

# 18. Ocultar alerta

Ocultar significa retirar manualmente um alerta da visão principal.

## ALT-HIDE-001

Ocultação não deverá:

- alterar manutenção;
- alterar peça;
- alterar problema;
- apagar histórico.

## ALT-HIDE-002

Alertas críticos de peça faltando essencial não poderão ser ocultados.

## ALT-HIDE-003

Garantias vencidas poderão ser ocultadas antes dos 7 dias.

---

# 19. Reaparecimento de alerta

Um alerta adiado deverá reaparecer quando:

- chegar a data definida;
- atingir o delta de KM definido;
- qualquer uma das duas condições ocorrer primeiro.

---

# 20. Resolução automática do alerta

Um alerta poderá ser encerrado automaticamente quando sua condição-base deixar de existir.

Exemplos:

### Manutenção vencida

Ao concluir a manutenção:

```text
alerta antigo → resolvido
novo ciclo → recalculado
```

### Peça faltando

Ao instalar nova peça:

```text
missing → installed
alerta → resolvido
```

### Documento vencido

Ao registrar renovação:

```text
documento antigo → histórico
novo documento → ativo
```

---

# 21. Correção de dados

Se uma correção alterar a condição:

```text
Vencida → Próxima → OK
```

o alerta deverá acompanhar o novo estado.

Não deverá permanecer Vencido se a regra-base não for mais verdadeira.

---

# 22. Contagem da central

O contador deverá representar alertas ativos visíveis.

Alertas:

- adiado;
- ocultado;
- resolvido;
- expirado;

não deverão entrar na contagem principal.

---

# 23. Visto x não visto

A central poderá diferenciar:

- não visto;
- visto.

## Regra

Essa distinção não altera gravidade nem presença do alerta.

---

# 24. Badge da central

O menu poderá exibir badge numérico.

Exemplo:

```text
Alertas  [5]
```

Se houver peça faltando essencial, a interface poderá usar indicador crítico adicional.

---

# 25. Cards no Dashboard

Dashboard deverá mostrar prioritariamente:

- peças faltando essenciais;
- manutenções vencidas;
- problemas urgentes;
- documentos vencidos;
- garantias relevantes;
- próximas manutenções.

---

# 26. Limite de itens no Dashboard

O Dashboard poderá mostrar somente os itens mais relevantes e oferecer:

> Ver todos os alertas

levando à Central de Alertas.

---

# 27. Alertas contextuais

Em uma tela de detalhe, o alerta relacionado deverá aparecer próximo ao dado responsável.

Exemplo:

```text
Bateria
[ALERTA] Peça faltando
```

ou:

```text
Troca de óleo
[VENCIDA] há 320 km
```

---

# 28. Sem alertas

Estado vazio da central:

> Nenhum alerta ativo. O carango está em dia.

Deve manter o tom moderadamente informal definido no Design System.

---

# 29. Filtros da central

Filtros sugeridos:

- gravidade;
- tipo;
- sistema;
- componente;
- status;
- visto/não visto;
- adiado;
- período.

---

# 30. Seção de alertas adiados

A Central deverá permitir visualizar alertas em snooze.

Cada item deverá mostrar:

- motivo/origem;
- data de reaparecimento;
- KM de reaparecimento;
- ação "Reativar agora".

---

# 31. Seção de alertas ocultados

Quando útil, poderá existir área secundária para alertas ocultados.

Essa área deverá ser recolhível e não competir com alertas ativos.

---

# 32. Auditoria do alerta

Alertas derivados não precisam de histórico completo próprio se puderem ser reconstruídos.

Porém ações manuais como:

- adiar;
- ocultar;
- reativar;

deverão guardar metadados mínimos quando necessário.

---

# 33. Estrutura conceitual de AlertState

Uma estrutura equivalente poderá conter:

```text
id
sourceType
sourceId
alertType
severity
status
seenAt
snoozedUntilDate
snoozedUntilKm
hiddenAt
resolvedAt
createdAt
updatedAt
```

A implementação definitiva será definida na arquitetura técnica.

---

# 34. Prioridade semântica

## Crítico

- peça faltando essencial

## Alto

- manutenção vencida;
- problema urgente;
- documento vencido.

## Médio

- manutenção próxima;
- garantia vencida dentro da janela de 7 dias;
- documento próximo.

## Informativo

- garantias próximas;
- demais lembretes.

A prioridade visual final deverá respeitar o Design System.

---

# 35. Exemplos

## Exemplo A — Troca de óleo próxima

```text
Troca de óleo
Faltam 800 km ou 43 dias
Estado: Próxima
```

## Exemplo B — Troca de óleo vencida

```text
Troca de óleo
Vencida há 320 km
Data ainda dentro do prazo
Estado: Vencida
```

## Exemplo C — Bateria removida

```text
Bateria
Peça faltando
Criticidade: Crítica
Não pode adiar
Não pode ocultar
```

## Exemplo D — Garantia vencida

```text
Garantia do alternador
Vencida há 3 dias
Permanece na central por mais 4 dias
Pode ocultar manualmente
```

---

# 36. Regra central

```text
Alertar enquanto importa
+
Não confundir "visto" com "resolvido"
+
Permitir snooze quando seguro
+
Nunca silenciar peça essencial faltando
+
Remover garantias vencidas da central após 7 dias
```
