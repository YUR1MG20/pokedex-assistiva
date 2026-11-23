import { Link } from 'react-router-dom';

function Rodape() {
  return (
    <footer id="rodape" className="rodape" tabIndex={-1}>
      <div className="container">
        <p>Pokédex Acessível — Trabalho de Desenvolvimento Web, UEPG.</p>
        <p>
          Dados e imagens fornecidos pela <a href="https://pokeapi.co">PokéAPI</a>.{' '}
          <Link to="/acessibilidade">Declaração de acessibilidade e atalhos de teclado</Link>.
        </p>
      </div>
    </footer>
  );
}

export default Rodape;
