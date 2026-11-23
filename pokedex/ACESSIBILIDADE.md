# Pokédex Acessível — Relatório de acessibilidade

**Equipe:** Antonio Felipe, João Vitor, Yuri
**Tema do trabalho:** Desenvolvimento ou Adaptação de Software Acessível
**Tipo:** adaptação de um sistema existente (a Pokédex feita na disciplina de Desenvolvimento Web)
**Diretrizes seguidas:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/), nível AA, e [eMAG 3.1](https://emag.governoeletronico.gov.br/)
**Tecnologias assistivas alvo:** NVDA (Windows), TalkBack (Android), navegação só por teclado, zoom/ampliação e alto contraste

---

## 1. O que foi entregue

| Entregável pedido | Onde está |
|---|---|
| Código-fonte com suporte a leitores de tela (ARIA, HTML semântico, componentes acessíveis) | `frontend/src/` (ver seção 4) |
| Navegação completa via teclado | Todas as telas; atalhos na seção 5 |
| Contraste configurável | Faixa de acessibilidade → **Alto contraste** e **Preferências de acessibilidade** |


---

## 2. Problemas encontrados na versão original

| # | Problema | Quem era afetado | Critério WCAG |
|---|---|---|---|
| 1 | Página declarada em inglês (`<html lang="en">`) com conteúdo em português | Leitor de tela lia com sotaque/pronúncia errada | 3.1.1 |
| 2 | Cartões de Pokémon e cabeçalhos das regiões eram `<div onClick>` | Quem usa teclado não conseguia abrir detalhes nem recolher regiões | 2.1.1, 4.1.2 |
| 3 | Campos de busca e formulários só com `placeholder`, sem `<label>` | Leitor de tela anunciava "editar, em branco" sem dizer o que é | 1.3.1, 3.3.2 |
| 4 | Modal de detalhes sem `role="dialog"`, sem levar o foco, sem fechar com Esc; o Tab "vazava" para a página de trás | Teclado e leitor de tela | 2.1.2, 2.4.3, 4.1.2 |
| 5 | Botão de fechar só com "✕" e botões de mover só com "←" / "→" | Leitor de tela lia "multiplicação", "seta para a esquerda" | 2.4.4, 4.1.2 |
| 6 | 12 dos 18 tipos tinham texto branco com contraste abaixo de 4,5:1 (Elétrico: **1,5:1**). Mensagem de sucesso: 2,9:1. Bordas dos campos: 1,6:1 | Baixa visão, daltonismo, telas ao sol | 1.4.3, 1.4.11 |
| 7 | Vários botões "Editar", "Excluir", "Remover" iguais, sem dizer de qual time/Pokémon | Leitor de tela (lista de botões fica ambígua) | 2.4.4 |
| 8 | Mensagens de erro e sucesso apareciam na tela, mas não eram anunciadas | Leitor de tela | 4.1.3 |
| 9 | Ao trocar de página no menu, nada era anunciado e o título da aba era sempre "Dex" | Leitor de tela | 2.4.2, 2.4.3 |
| 10 | Sem links para pular blocos; cabeçalho fixo (sticky) podia cobrir o elemento focado | Teclado, zoom | 2.4.1, 2.4.11 |
| 11 | EVs mostrados como "0/0/252/4/0/252" e abreviações "Atq. Esp." | Leitor de tela lia números soltos | 1.3.1 |
| 12 | Botão "Salvar" desabilitado quando os EVs passavam de 510, sem explicar o motivo | Todos, principalmente leitor de tela | 3.3.1, 3.3.3 |
| 13 | Nenhuma opção de contraste, tamanho de texto ou espaçamento | Baixa visão, dislexia | (requisito do trabalho), 1.4.4, 1.4.12 |

---

## 3. Mapa de conformidade (WCAG 2.2 AA)

| Critério | Como foi atendido | Arquivo(s) |
|---|---|---|
| **1.1.1** Conteúdo não textual | Imagens só decorativas têm `alt=""` (o nome já está escrito ao lado); a arte do modal tem `alt="Arte oficial de Pikachu"` e muda para "forma shiny" | `pages/Dex.jsx`, `pages/Times.jsx`, `components/Navbar.jsx` |
| **1.3.1** Informações e relações | Marcos `header`, `nav`, `main`, `footer`; hierarquia de títulos h1 → h5; listas `ul`; dados em `dl`; status base em `<table>` com `caption` e `th scope`; `fieldset` + `legend` nos grupos; todo campo com `<label for>` | todas as páginas |
| **1.3.2** Sequência com significado | Ordem do código = ordem de leitura (nome → número → tipo nos cartões) | `pages/Dex.jsx` |
| **1.4.1** Uso de cor | Tipo sempre escrito; erros com ícone ⚠ e texto; página atual com borda + negrito; contador de EVs diz "passou X" | `index.css`, `components/EtiquetaTipo.jsx` |
| **1.4.3** Contraste mínimo | Paleta revisada; cor do texto das etiquetas calculada automaticamente (preto ou branco, o que der mais contraste). Medido: pior caso **5,58:1** (claro e escuro), **21:1** no alto contraste | `utils/acessibilidade.js`, `index.css` |
| **1.4.4** Redimensionar texto | Tudo em `rem`; controle de 100% a 200% no painel | `acessibilidade/Preferencias.jsx` |
| **1.4.10** Reflow | Testado em 320 px de largura (equivale a 400% de zoom): sem rolagem horizontal nas 3 páginas | `index.css` (grids com `minmax(min(100%, …))`) |
| **1.4.11** Contraste não textual | Bordas de campos 4,54:1; contorno de foco 3 px com cor de alto contraste | `index.css` |
| **1.4.12** Espaçamento de texto | Opção "Aumentar espaçamento" aplica os valores do critério (altura de linha 1,8; letras 0,12em; palavras 0,16em; parágrafos 2em) sem cortar conteúdo | `index.css` |
| **2.1.1** Teclado | Só elementos nativos (`button`, `a`, `input`, `select`); nada de `div` clicável | todas as páginas |
| **2.1.2** Sem bloqueio do teclado | Modal e painel fecham com Esc; o foco nunca fica preso fora de um modal | `components/Modal.jsx`, `acessibilidade/PainelPreferencias.jsx` |
| **2.1.4** Atalhos por caractere | Atalhos usam modificador (Alt / Alt+Shift), padrão `accesskey` do eMAG | `acessibilidade/atalhos.js` |
| **2.4.1** Ignorar blocos | Links "Ir para o conteúdo/menu/busca/rodapé" + marcos + títulos; botões "Recolher todas" as regiões | `acessibilidade/FaixaAcessibilidade.jsx`, `pages/Dex.jsx` |
| **2.4.2** Página com título | `<title>` muda a cada rota: "Meus Times — Pokédex Acessível" | `App.jsx` |
| **2.4.3** Ordem do foco | Foco vai para o `h1` ao trocar de página; entra no modal ao abrir e volta ao cartão ao fechar; após salvar/excluir, vai para um lugar lógico (nunca se perde no `body`) | `App.jsx`, `components/Modal.jsx`, `pages/Times.jsx` |
| **2.4.4** Finalidade do link/botão | Texto oculto completa o nome: "Editar time Kalos", "Remover Ninja do time" | `pages/Times.jsx` |
| **2.4.6** Cabeçalhos e rótulos | Títulos descritivos em todas as seções; rótulos visíveis em todos os campos | todas as páginas |
| **2.4.7** Foco visível | `:focus-visible` com contorno de 3 px (4 px e amarelo no alto contraste) | `index.css` |
| **2.4.11** Foco não obscurecido | Cabeçalho deixou de ser fixo; `scroll-padding` | `index.css` |
| **2.5.3** Rótulo no nome | O texto visível sempre começa o nome acessível ("Editar…", "Antes…", "Aumentar") | todas as páginas |
| **2.5.8** Tamanho do alvo | Botões com no mínimo 36 px de altura (a maioria 44 px) | `index.css` |
| **3.1.1** Idioma da página | `<html lang="pt-BR">` | `index.html` |
| **3.1.2** Idioma das partes | Nomes de habilidades (em inglês, vindos da PokéAPI) marcados com `lang="en"` | `pages/Dex.jsx`, `pages/Times.jsx` |
| **3.2.1 / 3.2.2** Em foco / em entrada | Nenhuma mudança de contexto ao focar ou ao escolher opção | — |
| **3.3.1** Identificação do erro | Campo com `aria-invalid`, mensagem ligada por `aria-describedby` e foco levado ao primeiro campo com erro | `pages/Times.jsx` |
| **3.3.2** Rótulos ou instruções | Obrigatórios marcados (*); regras dos EVs escritas antes dos campos | `pages/Times.jsx` |
| **3.3.3** Sugestão de erro | "A soma dos EVs é 604 e passou do limite de 510. Retire 94 pontos." | `pages/Times.jsx` |
| **4.1.2** Nome, função, valor | `aria-expanded` (regiões, painel, equipe), `aria-pressed` (alto contraste), `aria-current="page"` (menu), `aria-invalid`, `<dialog>` nativo com `aria-labelledby` | vários |
| **4.1.3** Mensagens de status | Anunciador com regiões `aria-live` ("1 Pokémon encontrado", "Time criado", "Ninja foi removido do time") | `acessibilidade/Anunciador.jsx` |

### Recomendações do eMAG atendidas

- **Barra de acessibilidade** no topo, com atalhos numerados (1 conteúdo, 2 menu, 3 busca, 4 rodapé) via `accesskey`.
- **Página "Acessibilidade"** explicando os recursos e as teclas de atalho (`/acessibilidade`).
- **Opção de alto contraste** sempre visível no topo.
- Conteúdo, menu, busca e rodapé com âncoras próprias; links e botões com textos que fazem sentido fora de contexto.

---

## 4. Arquitetura da adaptação

```
frontend/src/
├── acessibilidade/
│   ├── Anunciador.jsx          # regiões aria-live + hook useAnunciador()
│   ├── Preferencias.jsx        # tema, tamanho do texto, espaçamento... (salvo no localStorage)
│   ├── PainelPreferencias.jsx  # painel com as opções de contraste/texto/movimento
│   ├── FaixaAcessibilidade.jsx # barra eMAG: links de salto, alto contraste, preferências
│   └── atalhos.js              # lista de teclas de atalho
├── components/
│   ├── Modal.jsx               # <dialog> nativo: foco preso, Esc, devolve o foco
│   ├── EtiquetaTipo.jsx        # etiqueta de tipo com cor de texto calculada
│   ├── Navbar.jsx              # cabeçalho + menu com aria-current
│   └── Rodape.jsx
├── pages/
│   ├── Dex.jsx                 # busca, regiões recolhíveis, cartões-botão, modal de detalhes
│   ├── Times.jsx               # CRUD de times e equipe, validação acessível
│   └── Acessibilidade.jsx      # declaração de acessibilidade e atalhos
├── utils/acessibilidade.js     # contraste, formatação de nomes, foco programático
└── index.css                   # temas por variáveis CSS, foco visível, sr-only
```


## 5. Teclado

| Tecla | Ação |
|---|---|
| `Tab` / `Shift+Tab` | Próximo / anterior elemento interativo |
| `Enter` / `Espaço` | Ativa botão (abre Pokémon, expande região, salva) |
| Setas | Trocam a opção em grupos de rádio (ícone do time, tema) e listas |
| `Esc` | Fecha o modal, fecha o painel de preferências, cancela a edição de um Pokémon |
| `Alt+1` … `Alt+4` (Chrome/Edge) · `Alt+Shift+1` … (Firefox) | Conteúdo, menu, busca, rodapé |

## 6. Limitações conhecidas

- Nomes de Pokémon e habilidades vêm da PokéAPI em inglês.
- As imagens são tratadas como decorativas nos cartões (o nome já está escrito); não há descrição detalhada da aparência.
- A reordenação da equipe vale só na tela (o banco não tem coluna de ordem). Isso está avisado na interface.
- A confirmação de exclusão usa `window.confirm`, que é acessível, mas não segue o tema escolhido.
