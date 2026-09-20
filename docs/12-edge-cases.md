# Carango Véio — Casos de Borda

## 1. Objetivo

Este documento define como o Carango Véio deverá se comportar em situações incomuns, inconsistentes ou potencialmente destrutivas.

A prioridade é preservar:

- coerência histórica;
- integridade das peças atuais;
- cálculos corretos;
- rastreabilidade;
- dados digitados pelo usuário.

---

# 2. Nova leitura de quilometragem menor que a atual

## EDGE-ODO-001 — Bloqueio

Ao registrar uma nova leitura de quilometragem atual, o valor não poderá ser menor que a última leitura válida.

Exemplo:

```text
Última leitura válida:
160.000 km

Nova leitura:
150.000 km
→ BLOQUEAR
```

## EDGE-ODO-002 — Correção

Se a leitura anterior estiver errada, o usuário deverá:

1. abrir o Histórico de KM;
2. editar ou excluir a leitura incorreta;
3. registrar/corrigir os valores;
4. deixar o sistema recalcular as dependências.

Não deverá existir botão "Salvar mesmo assim" para uma nova leitura atual regressiva.

---

# 3. Registro histórico com KM menor que o atual

Uma manutenção antiga poderá possuir quilometragem inferior à atual.

Exemplo:

```text
KM atual:
160.000 km

Serviço realizado meses atrás:
151.200 km
→ PERMITIDO
```

O registro histórico não deverá substituir automaticamente a quilometragem atual do veículo.

---

# 4. Cadastro retroativo de manutenção

O usuário poderá registrar hoje um serviço realizado no passado.

Fluxo:

```text
Registrar serviço realizado
    ↓
Informar data real antiga
    ↓
Informar KM real daquele momento
    ↓
Salvar
    ↓
Inserir no ponto correto da timeline
    ↓
Recalcular dependências
```

A ordem de criação no banco não deverá definir a ordem histórica.

---

# 5. Recalcular histórico após cadastro retroativo

Se uma ocorrência retroativa afetar um ciclo recorrente, o sistema deverá reconstruir a sequência daquele plano.

Deverá considerar:

- ocorrências anteriores;
- ocorrência recém-inserida;
- ocorrências posteriores;
- ciclo atual.

Não deverá alterar ciclos independentes.

---

# 6. Editar data ou KM de instalação de peça

O usuário poderá corrigir:

- data de instalação;
- KM de instalação;
- condição inicial;
- informações técnicas;
- dados relacionados.

Após salvar:

- recalcular tempo instalada;
- recalcular KM desde instalação;
- recalcular garantias dependentes;
- recalcular planos cuja origem seja aquela instalação;
- atualizar timeline.

---

# 7. Informação desconhecida torna-se conhecida

Uma peça poderá começar com:

```text
Data: desconhecida
KM: desconhecido
```

e posteriormente ser corrigida.

O sistema deverá aceitar o preenchimento posterior sem criar nova peça.

---

# 8. Informação conhecida torna-se desconhecida

Se um dado tiver sido cadastrado erroneamente, o usuário poderá removê-lo quando o campo for opcional.

O sistema deverá:

- parar de exibir derivados que dependam desse dado;
- mostrar "Desconhecido";
- não manter cálculos antigos como se ainda fossem válidos.

---

# 9. Arquivar manutenção recorrente que não será mais feita

O usuário poderá arquivar um plano recorrente.

Deverá solicitar:

- confirmação;
- motivo em texto livre.

Após arquivar:

- não gerar novos vencimentos;
- remover alertas futuros daquele plano;
- manter ocorrências históricas;
- manter motivo e auditoria do arquivamento.

---

# 10. Reativar plano arquivado

Caso o plano seja reativado:

- não inventar uma ocorrência;
- recuperar o último ciclo válido;
- recalcular próximo prazo a partir da origem válida existente.

Se não houver origem suficiente, solicitar nova referência de data/KM.

---

# 11. Componente que não existe neste veículo

Mesmo fazendo parte do catálogo hardcoded geral do modelo, um componente poderá não existir na unidade específica.

Adicionar estado:

`Não se aplica`

## Efeito

Quando um componente estiver como Não se aplica:

- não considerar como peça faltando;
- não gerar alertas;
- não exigir peça atual;
- manter disponível para consulta;
- permitir retornar a um estado aplicável.

---

# 12. Não se aplica x opcional ausente

Os estados são diferentes.

## Não se aplica

O componente não existe/configura aquela unidade.

## Opcional ausente

O componente poderia existir, mas não está instalado.

A interface não deverá tratá-los como sinônimos.

---

# 13. Excluir manutenção que substituiu peça — sem dependências posteriores

Exemplo:

```text
Peça A
    ↓
Manutenção X
    ↓
Peça B instalada
```

Se:

- B ainda for a peça atual;
- não existirem eventos posteriores dependentes de B;
- não houver outra relação que impeça rollback;

a exclusão poderá ser permitida com confirmação.

## Rollback

Ao excluir X:

```text
Peça B
→ deixa de existir como instalação válida daquela ocorrência

Peça A
→ volta ao estado anterior aplicável

Componente
→ volta a apontar para A
```

Custos, garantias e derivados ligados exclusivamente à ocorrência excluída deverão ser recalculados.

---

# 14. Excluir manutenção com dependências posteriores

Exemplo:

```text
A → B em 2025
B → C em 2026
```

Excluir diretamente a ocorrência A → B quebraria a cadeia histórica.

Nesse caso:

```text
Excluir
    ↓
Detectar dependências
    ↓
BLOQUEAR exclusão
```

Mensagem equivalente:

> Este registro possui eventos posteriores dependentes. Corrija o histórico antes de excluí-lo.

Ações:

- Editar ocorrência
- Ver dependências
- Cancelar

O sistema não deverá reconstruir silenciosamente uma história mecânica diferente.

---

# 15. Exclusão com garantia dependente

Se uma garantia existir exclusivamente por causa de uma peça/serviço que será removido do histórico:

- incluir a garantia na análise de dependências;
- remover/reverter somente quando a relação for inequívoca;
- bloquear quando houver dependência posterior ambígua.

---

# 16. Exclusão com custos dependentes

Custos diretamente pertencentes à ocorrência excluída deverão deixar de compor os totais.

O registro de auditoria da operação poderá permanecer.

---

# 17. Conflito entre as duas contas

Se as duas contas editarem o mesmo registro e houver conflito detectável:

```text
Versão local
VS
Versão remota
```

O sistema não deverá escolher automaticamente qual conteúdo textual manter.

---

# 18. Tela de resolução de conflito

Mostrar lado a lado ou em blocos comparáveis:

- valor local;
- valor remoto;
- data da alteração;
- conta responsável;
- campos divergentes.

Ações:

- Manter versão local
- Manter versão remota
- Revisar manualmente

---

# 19. Conflito após trabalho offline

Se dois dispositivos trabalharem offline:

1. ambos poderão ter alterações locais;
2. conflito poderá aparecer somente após reconexão;
3. o sistema deverá preservar as duas versões até resolução quando o conflito for detectável.

Não sobrescrever deliberadamente uma versão sem aviso.

---

# 20. Rascunho em conflito

Rascunho local nunca deverá ser apagado apenas porque uma versão remota mudou.

Ao detectar conflito:

- preservar rascunho;
- informar alteração remota;
- permitir comparação.

---

# 21. Estorno de gasto

Não criar despesa negativa.

O registro original permanece com seu valor original.

Estados financeiros:

- Normal
- Parcialmente estornada
- Estornada

Visualmente, o estado poderá ser apresentado como tag/badge.

---

# 22. Estorno total

Exemplo:

```text
Gasto original:
R$ 500,00

Status:
Estornada

Valor estornado:
R$ 500,00

Impacto no gasto líquido:
R$ 0,00
```

O valor original continua visível no histórico.

---

# 23. Estorno parcial

Exemplo:

```text
Gasto original:
R$ 500,00

Valor estornado:
R$ 150,00

Status:
Parcialmente estornada

Gasto líquido:
R$ 350,00
```

O usuário deverá informar explicitamente o valor estornado.

---

# 24. Validação do estorno parcial

O valor estornado deverá ser:

```text
> 0
e
< valor efetivo original
```

Se for igual ao valor total, o estado deverá ser:

`Estornada`

Não permitir estorno superior ao valor efetivo original.

---

# 25. Totais financeiros com estorno

Definições:

```text
Gasto bruto =
soma dos valores efetivos originais

Total estornado =
soma dos valores estornados

Gasto líquido =
gasto bruto - total estornado
```

---

# 26. Exibição financeira

A área Gastos deverá mostrar separadamente, quando houver estornos:

- Gasto bruto
- Total estornado
- Gasto líquido

O principal total de gasto deverá representar o valor líquido.

---

# 27. Histórico de item estornado

Mesmo totalmente estornado, o registro deverá continuar visível.

Exemplo:

```text
Serviço X
R$ 500,00
[Estornada]
R$ 500,00 estornados
Impacto líquido: R$ 0,00
```

---

# 28. Estorno não desfaz manutenção

Marcar um gasto como estornado não significa que:

- a manutenção não aconteceu;
- a peça não foi instalada;
- a garantia deixou de existir;
- o problema voltou a ficar aberto.

Estorno é exclusivamente um estado financeiro.

---

# 29. Editar estorno

O usuário poderá corrigir:

- estado;
- valor estornado;
- observação do estorno.

Os totais deverão ser recalculados imediatamente.

---

# 30. Remover estorno

Se a marcação tiver sido feita por engano:

```text
Parcialmente estornada / Estornada
    ↓
Remover estorno
    ↓
Normal
```

O valor efetivo original volta integralmente aos totais líquidos.

---

# 31. Duplo clique em ação de salvar/concluir

Enquanto uma operação de escrita estiver em andamento:

- desabilitar ação de envio;
- mostrar loading;
- impedir criação duplicada.

---

# 32. Reconexão após conclusão offline

Uma manutenção concluída offline deverá aparecer localmente como pendente de sincronização.

Ao reconectar:

- sincronizar;
- confirmar escrita;
- atualizar indicadores.

Não criar segunda ocorrência apenas porque o usuário reabriu a tela.

---

# 33. Alerta adiado cuja causa foi resolvida

Se um alerta em snooze tiver sua causa resolvida antes do prazo:

- marcar alerta como resolvido;
- não fazê-lo reaparecer.

---

# 34. Alerta ocultado cuja condição muda

Se a origem mudar para uma condição materialmente mais grave, o sistema poderá gerar novo alerta quando aplicável.

Exceção:

- peça faltando essencial nunca pode ser ocultada.

---

# 35. Garantia vencida ocultada

Se ocultada durante os sete dias pós-vencimento:

- sair da central imediatamente;
- permanecer no histórico;
- não reaparecer apenas pelo passar do tempo.

---

# 36. Intervalo de recorrência inválido

Não permitir:

- 0 km;
- número negativo;
- 0 dias;
- período negativo.

A recorrência deve possuir pelo menos um limite válido.

---

# 37. Recorrência combinada incompleta

Se o usuário escolher:

`KM ou tempo`

deverá informar os dois critérios.

Caso queira apenas um, deverá selecionar o tipo simples correspondente.

---

# 38. Plano sem ocorrência anterior

Um plano poderá ser criado com próxima referência explícita.

Se não houver ocorrência anterior suficiente para calcular o ciclo, o sistema deverá pedir:

- próximo KM;
- próxima data;
- ou origem inicial correspondente.

Não inventar referência.

---

# 39. Peça instalada sem data/KM

Permitido.

Derivados correspondentes deverão aparecer como desconhecidos.

A ausência desses dados não impede:

- histórico;
- associação ao componente;
- manutenção futura;
- inspeção;
- observações.

---

# 40. Substituir peça atual desconhecida

Se o componente possui uma peça física no carro, mas ela nunca foi cadastrada:

o usuário poderá registrar a substituição indicando que a peça anterior era desconhecida.

O histórico poderá registrar:

`Peça anterior não cadastrada/desconhecida`

A nova peça passa a ser a primeira PartInstance conhecida.

---

# 41. Remover componente sem PartInstance conhecida

Se o usuário precisa registrar uma remoção física, mas a peça anterior nunca foi cadastrada:

- permitir ocorrência de manutenção;
- registrar remoção de peça anterior desconhecida;
- atualizar ComponentState.

Se essencial:

- gerar Peça faltando após confirmação.

---

# 42. URLs inválidas

Campos de URL deverão validar formato.

Não bloquear outros dados do registro por URL opcional inválida sem informar claramente o problema.

---

# 43. Documento duplicado no mesmo ano

O sistema poderá alertar que já existe documento semelhante para o mesmo tipo/ano.

Não deverá excluir ou substituir automaticamente.

A decisão de manter ambos deverá permanecer explícita.

---

# 44. PWA atualizada durante edição

Se houver nova versão disponível enquanto formulário estiver aberto:

- não recarregar automaticamente;
- salvar rascunho;
- permitir atualizar depois.

---

# 45. Logout com writes pendentes

Se houver alterações ainda não sincronizadas:

- avisar o usuário;
- não afirmar que estão salvas no servidor;
- tentar preservar rascunho/estado conforme política de segurança;
- evitar logout silencioso que descarte trabalho sem aviso.

---

# 46. Dispositivo não confiável sem internet

Durante a sessão atual, dados existentes em memória poderão continuar acessíveis.

Após encerrar/reabrir, o app não deverá prometer disponibilidade offline persistente.

A interface deverá comunicar a limitação.

---

# 47. Catálogo atualizado por nova versão do app

Se o catálogo hardcoded ganhar novos componentes:

- adicioná-los sem apagar estados existentes;
- novos componentes começam como Sem informações cadastradas ou estado apropriado;
- preservar IDs de componentes já existentes.

---

# 48. Componente removido do catálogo por correção

Se um ID já possuir histórico:

- não apagar silenciosamente;
- manter definição de compatibilidade/migração;
- migrar deliberadamente para definição correta.

---

# 49. Regra central

```text
Bloquear inconsistências novas.
Permitir corrigir o passado.
Recalcular somente o que depende da alteração.
Nunca inventar uma reconstrução histórica ambígua.
```
