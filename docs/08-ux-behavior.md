# Carango Véio — Comportamento de UX

## 1. Objetivo

Este documento define comportamentos de interação e experiência do usuário que se aplicam transversalmente ao Carango Véio.

Ele cobre:

- autosave de rascunhos;
- saída de formulários;
- collapses;
- toasts;
- undo;
- menus contextuais;
- filtros;
- carregamento;
- prevenção de ações acidentais;
- navegação;
- feedback;
- persistência de preferências.

---

# 2. Princípios gerais

## UX-GEN-001 — Não perder trabalho

O sistema deverá priorizar a preservação do que o usuário já digitou.

## UX-GEN-002 — Não interromper desnecessariamente

Feedbacks e notificações internas não deverão bloquear a interação quando isso não for necessário.

## UX-GEN-003 — Ações destrutivas devem ser deliberadas

Excluir, remover ou alterar estados críticos deverá exigir intenção clara.

## UX-GEN-004 — Preferências devem persistir

Estados de interface úteis deverão permanecer entre acessos quando isso reduzir repetição.

---

# 3. Autosave de rascunhos

## UX-DRAFT-001 — Rascunho automático

Formulários complexos deverão salvar rascunhos automaticamente enquanto o usuário preenche.

## UX-DRAFT-002 — Aplicação

Autosave deverá ser usado em, no mínimo:

- Nova manutenção;
- Concluir manutenção;
- Novo problema;
- Novo documento;
- Editar peça;
- Editar veículo;
- formulários extensos equivalentes.

## UX-DRAFT-003 — Frequência

O autosave deverá ocorrer:

- após pequena pausa de digitação;
- ao mudar de campo;
- antes de navegação interna quando possível.

A implementação técnica poderá usar debounce.

## UX-DRAFT-004 — Feedback

O estado do rascunho deverá ser indicado de forma discreta.

Exemplos:

- Salvando...
- Rascunho salvo

Não deverá exibir toast a cada autosave.

---

# 4. Rascunho x registro definitivo

## UX-DRAFT-005 — Separação

Rascunho não deverá ser tratado como registro concluído.

Exemplo:

uma manutenção em rascunho não deverá:

- entrar no histórico;
- alterar peças;
- alterar gastos;
- recalcular recorrência;
- gerar alerta definitivo.

## UX-DRAFT-006 — Confirmação final

Somente a ação explícita de:

- Salvar;
- Criar;
- Concluir;

deverá transformar o rascunho em registro definitivo.

---

# 5. Retomar rascunho

Se existir rascunho não finalizado:

```text
Abrir formulário
    ↓
Encontrar rascunho
    ↓
Oferecer:
- Continuar rascunho
- Descartar rascunho
```

Quando houver apenas um rascunho claramente associado à ação atual, o sistema poderá restaurá-lo automaticamente e informar isso discretamente.

---

# 6. Saída com alterações não salvas

## UX-LEAVE-001

Ao tentar sair de um formulário com alterações ainda não sincronizadas ou rascunho relevante, o sistema deverá solicitar confirmação.

## Mensagem recomendada

> Existem alterações ainda não finalizadas. Deseja sair mesmo assim?

## Opções

- Continuar editando
- Sair

## UX-LEAVE-002

Se o rascunho já estiver salvo e puder ser retomado com segurança, a mensagem poderá informar:

> Seu rascunho está salvo e poderá ser retomado depois.

---

# 7. Fechamento do navegador / app

Quando tecnicamente possível, alterações ainda não persistidas deverão ser protegidas por:

- autosave;
- evento de saída;
- aviso do navegador quando necessário.

A aplicação não deverá depender exclusivamente de `beforeunload`.

---

# 8. Collapses

## UX-COL-001 — Persistência

O sistema deverá lembrar quais seções recolhíveis o usuário deixou:

- abertas;
- fechadas.

## UX-COL-002 — Escopo

A persistência deverá ser aplicada por tela ou contexto.

Exemplo:

```text
Detalhe da peça:
- Garantia: aberto
- Auditoria: fechado
- Observações: aberto
```

## UX-COL-003 — Exceção

Se uma seção recolhida contiver:

- erro;
- alerta crítico;
- validação necessária;

ela poderá abrir automaticamente.

---

# 9. Toasts

## UX-TOAST-001 — Não bloqueantes

Toasts deverão aparecer sem impedir clique, scroll ou interação com os demais elementos da tela.

## UX-TOAST-002 — Duração

Toasts comuns deverão desaparecer automaticamente após alguns segundos.

Referência:

```text
3–5 segundos
```

## UX-TOAST-003 — Posição

Deverão ocupar região que não cubra:

- FAB;
- botões principais;
- campos ativos;
- menus.

## UX-TOAST-004 — Conteúdo

Mensagens devem ser curtas.

Exemplos:

- Quilometragem atualizada.
- Manutenção concluída.
- Documento salvo.

---

# 10. Toasts de erro

Erros importantes poderão permanecer um pouco mais.

Quando houver ação possível:

- Tentar novamente
- Ver detalhes
- Restaurar

poderá existir botão dentro do toast.

---

# 11. Undo

## UX-UNDO-001 — Quando possível

Ações reversíveis deverão oferecer:

`Desfazer`

por alguns segundos.

## Exemplos

- arquivamento;
- alteração simples de status;
- remoção de item não dependente;
- exclusão lógica.

## UX-UNDO-002 — Exclusões complexas

Operações que já causaram:

- recálculos;
- exclusões em cascata;
- mudança de peça atual;
- alteração histórica complexa;

não deverão depender apenas de Undo.

Elas deverão usar confirmação prévia.

---

# 12. Exclusão com Undo

Fluxo preferencial quando seguro:

```text
Excluir
    ↓
Remover visualmente
    ↓
Toast:
"Item excluído. Desfazer"
    ↓
Janela curta
    ↓
Persistir definitivamente
```

A técnica exata dependerá da implementação.

---

# 13. Menus contextuais

## UX-MENU-001 — Ações secundárias

Ações menos frequentes deverão ficar em menu:

`⋮`

## Exemplos

- Editar
- Arquivar
- Duplicar, se existir
- Excluir
- Ver auditoria

## UX-MENU-002 — Ação principal

A ação mais importante não deverá ficar escondida no menu quando for central ao fluxo.

Exemplo:

`Concluir manutenção`

deve permanecer visível.

---

# 14. Swipe em cards

## UX-SWIPE-001 — Não usar ações por swipe

Cards e itens de lista não deverão executar ações como:

- excluir;
- concluir;
- editar;

por swipe.

## Motivo

Reduzir ações acidentais.

O swipe ficará reservado principalmente para navegação do menu mobile.

---

# 15. Menu mobile por swipe

## Abrir

Swipe da borda direita para a esquerda.

## Fechar

Swipe da esquerda para a direita sobre o menu.

## Regras

- exigir distância mínima de gesto;
- evitar conflito com scroll vertical;
- não ativar por pequenos movimentos diagonais;
- manter botão visível como alternativa.

---

# 16. Menu lateral

Ao abrir:

- overlay no conteúdo;
- foco visual no menu;
- scroll da página principal poderá ser bloqueado.

Ao fechar:

- restaurar posição anterior;
- não perder filtros ou estado da tela.

---

# 17. Voltar

## Desktop

Breadcrumbs e navegação do navegador deverão funcionar.

## Mobile

Botão voltar deverá levar ao contexto anterior.

Exemplo:

```text
Peças
→ Freios
→ Pastilha
→ Voltar
→ Freios
```

Evitar retornar sempre à raiz da área.

---

# 18. Preservação de scroll

Ao abrir detalhe e retornar para uma lista, o sistema deverá, quando possível, restaurar:

- posição de scroll;
- filtros;
- busca;
- ordenação.

---

# 19. Filtros persistentes

Filtros configurados deverão permanecer entre sessões.

## UX-FLT-001

Persistir:

- filtros;
- ordenação;
- modo de visualização quando aplicável.

## UX-FLT-002

Disponibilizar:

- Limpar filtros
- Restaurar padrão

---

# 20. Busca

Busca deverá funcionar enquanto o usuário digita.

## Regras

- debounce curto;
- sem botão Buscar;
- limpar rapidamente;
- preservar filtros ativos;
- mostrar quantidade de resultados quando útil.

---

# 21. Nenhum resultado

Quando busca/filtros não retornarem itens:

> Nenhum resultado encontrado com os filtros atuais.

Ações possíveis:

- Limpar busca
- Limpar filtros

---

# 22. Loading

## UX-LOAD-001 — Skeleton

Preferir skeleton para:

- cards;
- listas;
- Dashboard;
- detalhes.

## UX-LOAD-002 — Ações

Botões submetidos deverão mostrar loading local.

Exemplo:

```text
[Salvando...]
```

e ficar temporariamente desabilitados para evitar envio duplicado.

---

# 23. Loading sem bloquear a tela

Atualizações secundárias não deverão bloquear a interface inteira.

Exemplo:

ao atualizar um filtro, a aplicação poderá recarregar apenas a lista.

---

# 24. Erros de salvamento

Se um save falhar:

- manter dados digitados;
- indicar falha;
- permitir tentar novamente;
- não fechar formulário;
- não limpar rascunho.

---

# 25. Conectividade

Se houver falha de rede:

- informar de forma discreta;
- manter rascunhos locais quando tecnicamente possível;
- não afirmar que algo foi salvo remotamente sem confirmação.

---

# 26. Ações irreversíveis

Ações irreversíveis deverão usar modal.

## Modal deve conter

- entidade afetada;
- consequência;
- dependências;
- botão Cancelar;
- ação destrutiva.

---

# 27. Confirmação de remoção de peça essencial

Fluxo:

```text
Remover peça
    ↓
Componente essencial
    ↓
Modal crítico
```

Mensagem:

> Esta ação deixará um componente essencial sem peça instalada e criará um alerta de Peça faltando.

Botões:

- Cancelar
- Remover mesmo assim

---

# 28. Confirmação de resolução de problema

Ao concluir manutenção ligada a problema:

> Marcar este problema como resolvido?

Opções:

- Sim, marcar como resolvido
- Não, manter aberto

---

# 29. Preview antes de concluir manutenção

A tela de conclusão deverá mostrar resumo antes da ação final.

Exemplo:

```text
Data: 20/09/2026
KM: 148.200
Peças substituídas: 2
Custo efetivo: R$ 540,00
Próxima troca: 158.200 km ou 20/09/2027
```

---

# 30. Alteração de total manual

Quando o usuário sobrescrever o total calculado:

- mostrar total calculado;
- mostrar total manual;
- exibir indicação "Total informado manualmente".

A mudança deverá ser reversível.

---

# 31. Autocomplete reutilizável

Oficina, prestador, marca e fabricante deverão:

- sugerir valores previamente usados;
- aceitar texto livre;
- não impedir valor novo.

A lista deverá se adaptar enquanto o usuário digita.

---

# 32. Selects extensos

Para posições e componentes:

- busca obrigatória;
- agrupamento;
- teclado no desktop;
- toque no mobile;
- destacar correspondência.

---

# 33. Teclado e foco

Desktop deverá permitir uso eficiente por teclado.

## Mínimo

- Tab;
- Shift+Tab;
- Enter em ações apropriadas;
- Escape para fechar modal/menu;
- setas em listas quando suportado.

---

# 34. Foco em modal

Ao abrir modal:

- foco deve entrar nele;
- Tab não deve escapar enquanto aberto;
- Escape fecha quando seguro;
- ao fechar, foco retorna ao controle de origem.

---

# 35. Formulários longos

Devem usar:

- seções;
- collapses;
- progresso visual quando fizer sentido;
- botão final sempre acessível.

No mobile, ação de salvar/concluir poderá usar barra fixa inferior.

---

# 36. Validação

Validação deverá ocorrer:

- ao sair do campo;
- ao tentar salvar;
- imediatamente apenas quando útil.

Evitar mostrar erro antes de o usuário ter chance de preencher.

---

# 37. Campos opcionais

Campos opcionais deverão ser claramente distinguíveis.

Evitar marcar todos com "(opcional)" quando isso gerar ruído.

Pode ser preferível marcar apenas obrigatórios.

---

# 38. Datas

Date picker deverá:

- permitir digitação;
- permitir calendário;
- usar formato local.

Formato visual:

`DD/MM/AAAA`

---

# 39. Quilometragem

Campos de KM deverão:

- aceitar apenas valores válidos;
- formatar milhares visualmente;
- manter valor numérico internamente.

---

# 40. Valores monetários

Campos monetários deverão:

- usar moeda BRL;
- permitir digitação natural;
- formatar ao perder foco.

---

# 41. Feedback após ação

Após criação ou conclusão:

- atualizar tela atual;
- atualizar alertas;
- mostrar toast;
- navegar apenas quando fizer sentido.

Evitar redirecionamentos inesperados.

---

# 42. Navegação após concluir manutenção

Após concluir:

```text
Concluir manutenção
    ↓
Salvar
    ↓
Mostrar toast
    ↓
Abrir detalhe atualizado da manutenção
```

O usuário poderá então acessar histórico, peça ou Dashboard.

---

# 43. Navegação após criar problema

Após criar:

- abrir detalhe do problema;
- não voltar automaticamente para Dashboard.

---

# 44. Navegação após atualizar KM

Após salvar:

- fechar modal;
- permanecer na tela atual;
- atualizar dados visíveis;
- exibir toast.

---

# 45. Auditoria recolhida

Informações de auditoria deverão ficar recolhidas por padrão.

Expandir apenas sob ação do usuário.

---

# 46. Estados de edição

Ao entrar em modo edição:

- diferenciar visualmente de leitura;
- permitir cancelar;
- preservar dados originais até salvar.

---

# 47. Cancelar edição

Se nenhuma alteração foi feita:

- sair imediatamente.

Se houve alteração:

- usar regra de saída com rascunho/confirmação.

---

# 48. Conflitos de edição

Se as duas contas alterarem o mesmo item quase simultaneamente:

- detectar conflito quando tecnicamente possível;
- evitar sobrescrever silenciosamente;
- informar que o registro mudou;
- permitir recarregar ou revisar.

A estratégia técnica será detalhada na arquitetura.

---

# 49. Estado de sessão

Se a sessão expirar:

- preservar rascunho local quando possível;
- solicitar novo login;
- restaurar contexto após autenticação.

---

# 50. Responsividade de interação

Mudanças de breakpoint não deverão:

- perder formulário;
- limpar filtros;
- fechar rascunhos;
- alterar estado funcional.

---

# 51. Microinterações

Podem ser usadas para:

- expandir collapse;
- marcar conclusão;
- atualizar badge;
- abrir menu.

Devem ser discretas e rápidas.

---

# 52. Regra central

```text
Preservar contexto
+
Evitar ações acidentais
+
Dar feedback rápido
+
Não bloquear o usuário
+
Não perder dados digitados
```
