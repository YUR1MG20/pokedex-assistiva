import { Link, NavLink } from 'react-router-dom';

/*
 * Cabeçalho com o menu principal.
 * - <header> e <nav aria-label> criam "marcos" (landmarks) que o leitor de tela lista;
 * - o NavLink marca a página atual com aria-current="page" (lido como "página atual");
 * - a página atual também é indicada por borda + negrito, não só por cor.
 */
function Navbar() {
  return (
    <header className="cabecalho">
      <div className="container">
        <Link to="/" className="marca">
          {/* imagem decorativa: o nome ao lado já identifica o link */}
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
            alt=""
            width="32"
            height="32"
          />
          Pokédex Acessível
        </Link>

        <nav id="menu-principal" className="menu-principal" aria-label="Menu principal" tabIndex={-1}>
          <ul className="lista-sem-marcador" role="list">
            <li>
              <NavLink to="/" end>
                Dex
              </NavLink>
            </li>
            <li>
              <NavLink to="/times">Meus Times</NavLink>
            </li>
            <li>
              <NavLink to="/acessibilidade">Acessibilidade</NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
