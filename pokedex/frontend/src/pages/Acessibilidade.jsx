import { ATALHOS } from '../acessibilidade/atalhos';

/*
 * Página de acessibilidade (recomendação do eMAG): explica os recursos,
 * as teclas de atalho e como navegar com teclado e leitor de tela.
 */
function Acessibilidade() {
  return (
    <div className="container conteudo-texto">
      <h1 id="titulo-pagina" tabIndex={-1}>
        Acessibilidade
      </h1>
      <p>
        A Pokédex Acessível foi adaptada para seguir as{' '}
        <a href="https://www.w3.org/TR/WCAG22/" lang="en">
          WCAG 2.2
        </a>{' '}
        (nível AA) e as recomendações do{' '}
        <a href="https://emag.governoeletronico.gov.br/">eMAG — Modelo de Acessibilidade em Governo Eletrônico</a>.
        Ela pode ser usada só com o teclado, com leitores de tela como NVDA e TalkBack, com zoom de
        até 200% e com alto contraste.
      </p>

      <section aria-labelledby="titulo-recursos">
        <h2 id="titulo-recursos">Recursos disponíveis</h2>
        <ul>
          <li>
            <strong>Faixa de acessibilidade</strong> no topo, com links para pular direto ao conteúdo,
            ao menu, à busca e ao rodapé.
          </li>
          <li>
            <strong>Contraste configurável:</strong> temas automático, claro, escuro e alto contraste
            (botão “Alto contraste” ou painel “Preferências de acessibilidade”).
          </li>
          <li>
            <strong>Tamanho do texto</strong> de 100% a 200%, <strong>espaçamento de texto</strong>{' '}
            ampliado, <strong>links destacados</strong> e opção para <strong>reduzir animações</strong>.
            As escolhas ficam salvas no navegador.
          </li>
          <li>
            <strong>Foco sempre visível</strong> com contorno grosso ao navegar com Tab.
          </li>
          <li>
            <strong>Anúncios para leitores de tela</strong> quando algo muda sem recarregar a página
            (resultado da busca, time criado, Pokémon removido etc.).
          </li>
          <li>
            <strong>Formulários com rótulos</strong>, campos obrigatórios indicados e mensagens de erro
            ligadas ao campo, com o foco levado até o problema.
          </li>
          <li>
            <strong>Janela de detalhes</strong> que prende o foco enquanto está aberta, fecha com Esc e
            devolve o foco ao cartão que a abriu.
          </li>
          <li>
            <strong>Cores com contraste mínimo de 4,5:1</strong> e informações que nunca dependem só da
            cor (tipos sempre escritos, erros com ícone e texto).
          </li>
        </ul>
      </section>

      <section aria-labelledby="titulo-atalhos">
        <h2 id="titulo-atalhos">Teclas de atalho</h2>
        <p>
          Os atalhos seguem o padrão do eMAG. A combinação depende do navegador: no Chrome e no Edge
          (Windows), use <kbd>Alt</kbd> + número; no Firefox, <kbd>Alt</kbd> + <kbd>Shift</kbd> +
          número; no macOS, <kbd>Control</kbd> + <kbd>Option</kbd> + número.
        </p>
        <table className="tabela-simples">
          <caption className="sr-only">Teclas de atalho da página</caption>
          <thead>
            <tr>
              <th scope="col">Tecla</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {ATALHOS.map((atalho) => (
              <tr key={atalho.tecla}>
                <td>
                  <kbd>{atalho.tecla}</kbd>
                </td>
                <td>{atalho.texto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="titulo-teclado">
        <h2 id="titulo-teclado">Navegação pelo teclado</h2>
        <table className="tabela-simples">
          <caption className="sr-only">Teclas usadas na navegação</caption>
          <thead>
            <tr>
              <th scope="col">Tecla</th>
              <th scope="col">O que faz</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd>
              </td>
              <td>Avança / volta entre links, botões e campos.</td>
            </tr>
            <tr>
              <td>
                <kbd>Enter</kbd> ou <kbd>Espaço</kbd>
              </td>
              <td>Ativa o botão focado (abre um Pokémon, expande uma região, salva um formulário).</td>
            </tr>
            <tr>
              <td>Setas</td>
              <td>Trocam a opção em grupos de escolha (ícone do time, tema de contraste) e em listas de seleção.</td>
            </tr>
            <tr>
              <td>
                <kbd>Esc</kbd>
              </td>
              <td>
                Fecha a janela de detalhes, o painel de preferências e cancela a edição de um Pokémon.
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          Dica: a Dex tem mais de mil Pokémon. Use “Recolher todas” para fechar as regiões e abra só a
          que quiser, ou use a busca para chegar direto ao Pokémon.
        </p>
      </section>

      <section aria-labelledby="titulo-leitor">
        <h2 id="titulo-leitor">Com leitor de tela</h2>
        <ul>
          <li>
            Cada página tem um título principal e as seções têm títulos. No NVDA, use <kbd>H</kbd> para
            ir de título em título e <kbd>D</kbd> para pular entre as regiões (cabeçalho, menu,
            conteúdo, rodapé).
          </li>
          <li>As regiões da Dex são títulos de nível 3 e informam quantos Pokémon têm.</li>
          <li>
            Ao trocar de página pelo menu, o foco vai para o título da nova página e o nome da aba do
            navegador muda.
          </li>
          <li>
            No TalkBack (Android), deslize para a direita ou esquerda para percorrer os itens e toque
            duas vezes para ativar.
          </li>
        </ul>
      </section>

      <section aria-labelledby="titulo-limitacoes">
        <h2 id="titulo-limitacoes">Limitações conhecidas</h2>
        <ul>
          <li>
            Os nomes de Pokémon e de habilidades vêm da PokéAPI em inglês. As habilidades estão
            marcadas com o idioma inglês para o leitor de tela pronunciar melhor.
          </li>
          <li>
            As imagens dos Pokémon são tratadas como decorativas nos cartões, porque o nome já aparece
            escrito. Não há descrição detalhada da aparência de cada Pokémon.
          </li>
          <li>A ordem dos Pokémon dentro de um time vale só na tela e não é salva no servidor.</li>
        </ul>
      </section>

    </div>
  );
}

export default Acessibilidade;
