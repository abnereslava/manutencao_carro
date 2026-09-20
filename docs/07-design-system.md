# Carango Véio — Design System

## 1. Objetivo

Este documento define a linguagem visual do Carango Véio.

O sistema deverá transmitir:

- organização;
- confiança;
- praticidade;
- leitura rápida;
- leve identidade automotiva;
- personalidade informal moderada, coerente com o nome "Carango Véio".

A interface não deverá parecer:

- excessivamente corporativa;
- infantil;
- caricata;
- pesada visualmente;
- inspirada em dashboards industriais antigos.

---

# 2. Direção visual

## DS-VIS-001 — Estilo geral

O Carango Véio deverá combinar:

- visual moderno e minimalista;
- referências discretas ao universo automotivo;
- alta densidade de informação;
- componentes arredondados;
- hierarquia visual clara;
- comportamento consistente entre desktop e mobile.

## DS-VIS-002 — Personalidade

A identidade deverá ser:

- profissional;
- acessível;
- levemente descontraída;
- objetiva;
- sem exageros gráficos.

O nome "Carango Véio" pode trazer personalidade, mas a interface deve continuar adequada para uso cotidiano prolongado.

---

# 3. Temas

O aplicativo deverá possuir:

- tema claro;
- tema escuro;
- opção de seguir o tema do sistema.

## DS-THEME-001 — Tema automático

Por padrão, o app poderá usar a preferência do sistema operacional.

## DS-THEME-002 — Preferência manual

Configurações deverá permitir selecionar:

- Claro
- Escuro
- Sistema

## DS-THEME-003 — Equivalência funcional

Nenhuma informação poderá depender exclusivamente de cor ou existir apenas em um dos temas.

---

# 4. Paleta base

A identidade deverá usar uma base neutra grafite com um acento quente discreto.

## 4.1 Cor de destaque principal

**Amber / laranja automotivo moderado**

Valor de referência:

```text
Accent 500: #D97706
```

O acento deverá ser usado com moderação em:

- ações primárias;
- item ativo de navegação;
- foco;
- elementos de identidade;
- pequenos destaques.

Não deverá ser usado como cor predominante de grandes superfícies.

---

# 5. Paleta — Tema claro

Valores de referência:

```text
Background:        #F6F7F8
Surface:           #FFFFFF
Surface Secondary: #F0F2F4
Surface Elevated:  #FFFFFF

Text Primary:      #17191C
Text Secondary:    #5F6670
Text Muted:        #8A919B

Border:            #DDE1E6
Border Strong:     #C8CDD4

Accent:            #D97706
Accent Hover:      #B85F05
Accent Soft:       #FFF3E0
```

---

# 6. Paleta — Tema escuro

Valores de referência:

```text
Background:        #111315
Surface:           #191C1F
Surface Secondary: #202429
Surface Elevated:  #252A30

Text Primary:      #F3F4F6
Text Secondary:    #B4BAC2
Text Muted:        #7F8791

Border:            #30353B
Border Strong:     #444A52

Accent:            #F59E0B
Accent Hover:      #FBBF24
Accent Soft:       #35240A
```

---

# 7. Cores semânticas

Estados deverão utilizar cor + texto + ícone sempre que possível.

## OK

```text
Verde
Referência: #16A34A
```

## Próxima

```text
Amarelo / âmbar
Referência: #EAB308
```

## Vencida

```text
Vermelho
Referência: #DC2626
```

## Crítico / Peça faltando essencial

```text
Vermelho intenso
Referência: #B91C1C
```

## Em andamento

```text
Azul
Referência: #2563EB
```

## Pendente

```text
Laranja neutro / âmbar
Referência: #D97706
```

## Desconhecido / Inativo

```text
Cinza
Referência: #6B7280
```

## Resolvido / Concluído

Pode usar verde com tratamento visual menos chamativo que "OK atual".

---

# 8. Regra de acessibilidade de cor

Cor nunca deverá ser o único indicador de estado.

Exemplo correto:

```text
[ícone] Vencida
```

e não apenas um card vermelho sem texto.

---

# 9. Tipografia

A interface deverá usar fonte sans-serif moderna e legível.

## Fonte recomendada

```text
Inter
```

Fallback:

```css
font-family:
  Inter,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

## Motivo

- boa leitura em interfaces densas;
- números claros;
- boa legibilidade em mobile;
- aparência moderna sem excesso de personalidade.

---

# 10. Escala tipográfica

Referência:

```text
Display / destaque: 28–32 px
H1:                 24 px
H2:                 20 px
H3:                 17–18 px
Body:               14 px
Body Small:         13 px
Caption:            11–12 px
```

## Mobile

Títulos poderão reduzir levemente, mas textos interativos não deverão ficar pequenos demais para leitura confortável.

---

# 11. Peso tipográfico

```text
Regular:   400
Medium:    500
Semibold:  600
Bold:      700
```

Uso preferido:

- títulos: 600;
- labels: 500;
- corpo: 400;
- números importantes: 600 ou 700.

---

# 12. Espaçamento

A interface será compacta.

Escala base recomendada:

```text
4 px
8 px
12 px
16 px
20 px
24 px
32 px
```

## Regra

Evitar espaços verticais excessivos.

Cards e listas devem maximizar leitura sem parecer comprimidos.

---

# 13. Densidade

## DS-DENS-001 — Compacta por padrão

Listas, tabelas e cards deverão apresentar bastante informação por viewport.

## DS-DENS-002 — Informações secundárias

Detalhes menos importantes deverão ser:

- recolhíveis;
- exibidos em collapses;
- mostrados em tooltips;
- acessíveis em detalhe.

## DS-DENS-003 — Mobile

Mesmo no mobile, evitar cards excessivamente altos quando o conteúdo puder ser resumido.

---

# 14. Bordas e raio

O estilo será arredondado/moderno.

## Raio recomendado

```text
Campos:      8 px
Botões:      8 px
Cards:       12 px
Modais:      14–16 px
Chips:       999 px
FAB:         circular
```

Não utilizar cantos excessivamente arredondados em grandes painéis.

---

# 15. Sombras

Sombras deverão ser discretas.

Tema claro:

- usar para superfícies elevadas;
- cards principais;
- modais;
- menus.

Tema escuro:

- priorizar contraste entre superfícies e bordas;
- usar sombras com menor dependência visual.

---

# 16. Cards

## Estrutura

Um card poderá conter:

- título;
- ícone;
- estado;
- informação principal;
- metadados;
- ações contextuais.

## Regra de densidade

Preferir:

```text
Título + dado principal
Linha secundária
Ações discretas
```

em vez de blocos grandes com muito espaço vazio.

---

# 17. Cards recolhíveis

Collapses deverão ser utilizados quando houver informação secundária.

Exemplos:

- detalhes de garantia;
- histórico recente;
- custos detalhados;
- dados documentais;
- observações;
- informações técnicas da peça.

## Estados

- Recolhido por padrão quando secundário.
- Expandido automaticamente quando existir erro, alerta ou ação em andamento relevante.

---

# 18. Botões

## Primário

Uso:

- salvar;
- concluir;
- criar;
- confirmar ação principal.

Estilo:

- preenchido com Accent.

## Secundário

Uso:

- editar;
- visualizar;
- ações alternativas.

Estilo:

- superfície neutra;
- borda.

## Terciário

Uso:

- ações discretas;
- filtros;
- menus.

Estilo:

- texto/ícone sem preenchimento forte.

## Destrutivo

Uso:

- excluir;
- remover permanentemente.

Cor:

- vermelho semântico.

---

# 19. Botões com ícone

Sempre que o significado não for universalmente óbvio, ícone deverá acompanhar texto.

Exemplo:

```text
[✓] Concluir
```

em vez de somente um símbolo sem label.

---

# 20. FAB

No mobile:

- canto inferior direito;
- ação principal da tela;
- tamanho adequado para toque;
- sombra discreta;
- Accent como padrão.

Quando houver menu de FAB:

- opções curtas;
- ícone + label;
- não mais que poucas ações.

---

# 21. Ícones

## Biblioteca recomendada

Preferir uma biblioteca consistente, como:

- Lucide;
- Material Symbols;
- equivalente open source compatível.

## Logo / ícone do app

Usar ícone de veículo simples da mesma biblioteca visual.

Não é obrigatório criar arte personalizada.

## Estilo

- traço simples;
- sem efeitos 3D;
- sem ícones realistas;
- espessura consistente.

---

# 22. Ícone do Carango Véio

O ícone principal poderá utilizar uma silhueta genérica de carro.

Uso:

- tela de login;
- favicon;
- menu;
- PWA;
- cabeçalho do Dashboard.

## Regra

O ícone deve parecer moderno e simples.

Não precisa representar fielmente um Sandero.

---

# 23. Logo textual

Composição recomendada:

```text
[ícone de carro] Carango Véio
```

"Carango Véio" deverá usar o mesmo sistema tipográfico da aplicação.

Evitar fontes decorativas.

A personalidade vem principalmente:

- do nome;
- do acento quente;
- do ícone;
- das microinterações.

---

# 24. Navegação desktop

Menu superior.

## Comportamento visual

- fundo da superfície principal;
- item ativo com Accent discreto;
- hover suave;
- sem barras excessivamente altas.

## Item ativo

Pode usar:

- texto Accent;
- underline;
- pequeno indicador;
- fundo Accent Soft.

Não combinar todos ao mesmo tempo.

---

# 25. Navegação mobile

Menu lateral entrando pela direita.

## Visual

- painel sobreposto;
- fundo Surface Elevated;
- overlay no conteúdo;
- itens com ícone + texto;
- item ativo destacado.

## Animação

Curta e suave.

Não deverá atrasar a navegação.

---

# 26. Breadcrumbs

Desktop:

- pequenos;
- discretos;
- Text Secondary;
- item atual em Text Primary.

Separador recomendado:

```text
/
```

ou chevron discreto.

---

# 27. Tabelas

Desktop poderá usar tabelas para alta densidade.

## Regras

- cabeçalho fixo quando útil;
- linhas compactas;
- hover sutil;
- status em badge;
- ações em menu contextual;
- permitir ordenação onde fizer sentido.

## Mobile

Tabelas extensas deverão virar cards ou listas.

---

# 28. Badges

Badges serão usados para:

- status;
- prioridade;
- garantia;
- condição da peça.

Exemplos:

```text
OK
Próxima
Vencida
Urgente
Usada
Recondicionada
```

Devem ser compactos.

---

# 29. Chips de filtro

Filtros ativos deverão ser exibidos como chips quando útil.

Exemplo:

```text
[Freios ×] [Vencidas ×] [Dianteira ×]
```

Deverá existir ação:

`Limpar filtros`

---

# 30. Campos de formulário

## Estrutura

- label acima;
- campo;
- texto auxiliar quando necessário;
- erro abaixo.

## Estados

- normal;
- hover;
- focus;
- erro;
- disabled;
- read-only.

## Focus

Usar Accent com contraste suficiente.

---

# 31. Autocomplete

Campos reutilizáveis, como oficina e fabricante, deverão:

- aceitar digitação livre;
- mostrar sugestões abaixo;
- destacar correspondência;
- permitir criar valor novo simplesmente continuando a digitação.

---

# 32. Busca

Busca deverá filtrar dinamicamente.

## Visual

- ícone de lupa;
- placeholder claro;
- botão de limpar quando houver texto.

Não utilizar botão "Buscar".

---

# 33. Select pesquisável

Usado em listas extensas, especialmente posições.

Deverá incluir:

- campo de pesquisa;
- agrupamento quando útil;
- navegação por teclado no desktop;
- lista rolável.

---

# 34. Modais

Usados para ações simples.

## Estrutura

- título;
- descrição curta;
- conteúdo;
- ações no rodapé.

## Mobile

Poderão ocupar grande parte da tela quando necessário.

---

# 35. Confirmações destrutivas

Modal deverá usar:

- ícone de alerta;
- título claro;
- descrição do impacto;
- botão Cancelar;
- botão destrutivo explícito.

Evitar confirmações vagas como:

> Tem certeza?

Preferir:

> Excluir esta ocorrência histórica?

---

# 36. Alertas

Alertas internos deverão existir em três formas possíveis:

1. Card no Dashboard
2. Badge/indicador em listas
3. Banner contextual em detalhe

## Crítico

Peça faltando essencial deverá ter maior destaque.

---

# 37. Prioridade visual

Ordem:

1. Peça faltando essencial
2. Vencida
3. Urgente
4. Em andamento
5. Pendente
6. Próxima
7. OK
8. Desconhecida

---

# 38. Ícones semânticos

Sugestões conceituais:

```text
OK             → check-circle
Próxima        → clock
Vencida        → alert-triangle
Peça faltando  → circle-alert / wrench
Em andamento   → loader / activity
Documento      → file-text
Garantia       → shield
KM             → gauge
Peças          → wrench
Gastos         → wallet
Histórico      → history
```

A biblioteca final deverá manter consistência.

---

# 39. Prioridades de problema

## Baixa

Cinza ou azul discreto.

## Média

Azul ou âmbar suave.

## Alta

Laranja.

## Urgente

Vermelho.

Cor deve acompanhar label textual.

---

# 40. Gráficos

Quando houver gráficos financeiros:

- simples;
- pouco decorativos;
- labels claros;
- tooltip;
- responsivos.

Não usar gráficos 3D.

## Tema

Cores devem adaptar-se ao tema claro/escuro.

---

# 41. Timeline

O Histórico deverá usar timeline compacta.

Cada evento:

- marcador;
- data;
- título;
- resumo;
- KM opcional;
- tipo;
- ação de detalhe.

Eventos do mesmo dia poderão ser visualmente agrupados.

---

# 42. Estado vazio

Estados vazios deverão usar:

- ícone simples;
- frase curta;
- ação quando aplicável.

Exemplo:

```text
Nenhuma manutenção vencida.
O Carango Véio está em dia.
```

O tom pode ser levemente informal, sem virar piada constante.

---

# 43. Linguagem da interface

A linguagem deverá ser direta.

Preferir:

- "Atualizar KM"
- "Concluir manutenção"
- "Peça faltando"
- "Próxima troca"

Evitar textos burocráticos.

---

# 44. Tom de personalidade

O nome permite pequenas frases informais em áreas secundárias.

Exemplo aceitável:

> Nenhuma manutenção vencida. O carango está em dia.

Exemplo a evitar:

> Seu possante está tinindo, meu patrão!

A interface deverá manter moderação.

---

# 45. Animações

Usar apenas para:

- menu mobile;
- collapses;
- modais;
- feedback de ação;
- mudança de estado.

## Duração recomendada

```text
120–220 ms
```

Evitar animações longas ou decorativas.

---

# 46. Hover

Desktop deverá possuir hover em:

- botões;
- linhas;
- cards clicáveis;
- itens de menu;
- links.

Hover deverá ser sutil.

---

# 47. Feedback de clique

Toda ação deve fornecer feedback imediato.

Exemplos:

- loading no botão;
- toast;
- mudança de estado;
- skeleton.

---

# 48. Toasts

Usar para ações concluídas.

Exemplos:

- "Quilometragem atualizada."
- "Manutenção concluída."
- "Documento salvo."

Erros deverão ser claros e acionáveis.

---

# 49. Skeleton loading

Preferir skeleton em:

- Dashboard;
- listas;
- cards;
- detalhes.

Evitar spinner de tela inteira quando o conteúdo puder carregar progressivamente.

---

# 50. Scroll

## Desktop

Preferir scroll da página.

Tabelas podem possuir scroll interno apenas quando necessário.

## Mobile

Evitar múltiplas áreas roláveis aninhadas.

---

# 51. Componentes recolhíveis

Collapses são recomendados para:

- dados técnicos;
- observações;
- histórico secundário;
- garantias;
- custos;
- documentos;
- detalhes de auditoria.

---

# 52. Auditoria visual

Campos como:

- criado em;
- criado por;
- alterado em;
- alterado por;

deverão ficar em área secundária/recolhível.

Não devem competir com os dados mecânicos principais.

---

# 53. Responsividade

Breakpoints poderão seguir valores convencionais.

Referência:

```text
Mobile:   < 768 px
Tablet:   768–1023 px
Desktop:  >= 1024 px
```

Valores finais poderão variar conforme framework.

---

# 54. Touch targets

Controles mobile devem possuir área confortável para toque.

Referência mínima:

```text
44 × 44 px
```

mesmo quando o ícone visual for menor.

---

# 55. Contraste

Textos, botões e status deverão buscar conformidade com WCAG AA.

Em especial:

- texto secundário no dark mode;
- amarelo sobre fundo claro;
- vermelho em badges;
- Accent em texto.

---

# 56. Números e quilometragem

Quilometragens deverão ser formatadas de modo consistente.

Exemplo:

```text
148.250 km
```

Valores monetários:

```text
R$ 1.249,90
```

Datas:

```text
20/09/2026
```

---

# 57. Design tokens

A implementação deverá centralizar tokens de:

- cores;
- radius;
- sombras;
- spacing;
- typography;
- transitions;
- z-index;
- breakpoints.

Não espalhar valores arbitrários pelo código.

---

# 58. Tokens semânticos

Preferir nomes como:

```text
--color-bg
--color-surface
--color-text-primary
--color-status-ok
--color-status-warning
--color-status-danger
--color-accent
```

em vez de nomes baseados apenas em cor.

---

# 59. Dark mode

O dark mode não deverá ser uma simples inversão.

Deverá usar:

- superfícies em níveis;
- bordas adequadas;
- textos com contraste;
- Accent levemente mais luminoso;
- cores semânticas calibradas.

---

# 60. Resultado visual esperado

O Carango Véio deverá parecer:

```text
Sistema moderno
+
Dashboard automotivo discreto
+
Alta densidade
+
Cantos arredondados
+
Informação técnica organizada
+
Personalidade moderada
```

A interface deve ser suficientemente séria para gerenciar documentação e histórico do veículo, mas suficientemente informal para combinar com o nome "Carango Véio".
