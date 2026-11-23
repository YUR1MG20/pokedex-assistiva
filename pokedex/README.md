# Pokédex Acessível

Aplicação web para explorar a Pokédex (via PokéAPI) e montar **times de Pokémon**
(cadastro, listagem, edição e exclusão), com API REST própria.

Esta versão foi **adaptada para acessibilidade** (trabalho *Desenvolvimento ou Adaptação de Software
Acessível*), seguindo as **WCAG 2.2 nível AA** e o **eMAG**:

- funciona com **leitores de tela** (NVDA, TalkBack): HTML semântico, rótulos, ARIA e anúncios de status;
- **navegação completa pelo teclado**, com links de salto e teclas de atalho (Alt+1 a Alt+4);
- **contraste configurável** (automático, claro, escuro, alto contraste), texto até 200%, espaçamento
  ampliado, links destacados e redução de animações.

- 📄 Detalhes técnicos e mapa de conformidade: [`ACESSIBILIDADE.md`](ACESSIBILIDADE.md)

## Tecnologias
- **Frontend:** React 19, Vite, React Router
- **API externa:** [PokéAPI](https://pokeapi.co) (catálogo, imagens e detalhes)

## Como rodar

### 1. Frontend
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

> Não há dependências novas: a adaptação de acessibilidade usa só React, React Router e CSS.

## Acessibilidade — resumo

| Recurso | Onde |
|---|---|
| Faixa de acessibilidade (links de salto, alto contraste, preferências) | topo de todas as páginas |
| Página com recursos e atalhos | `/acessibilidade` |
| Modal acessível (`<dialog>` nativo, Esc, foco devolvido) | `frontend/src/components/Modal.jsx` |
| Anúncios para leitor de tela (`aria-live`) | `frontend/src/acessibilidade/Anunciador.jsx` |
| Temas e preferências salvos no navegador | `frontend/src/acessibilidade/Preferencias.jsx` |

| Atalho | Ação |
|---|---|
| `Alt+1` (Chrome/Edge) · `Alt+Shift+1` (Firefox) | Ir para o conteúdo |
| `Alt+2` | Ir para o menu |
| `Alt+3` | Ir para a busca |
| `Alt+4` | Ir para o rodapé |
| `Esc` | Fecha o modal / painel / edição |

### Abrindo no VS Code
Abra a pasta raiz do repositório. O VS Code vai sugerir as extensões recomendadas
(`.vscode/extensions.json`), entre elas o **axe Accessibility Linter**, que aponta problemas de
acessibilidade direto no código JSX enquanto você edita.

