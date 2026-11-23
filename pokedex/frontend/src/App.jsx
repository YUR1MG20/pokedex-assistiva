import { useEffect, useRef } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import FaixaAcessibilidade from './acessibilidade/FaixaAcessibilidade';
import Navbar from './components/Navbar';
import Rodape from './components/Rodape';
import Acessibilidade from './pages/Acessibilidade';
import Dex from './pages/Dex';
import Times from './pages/Times';
import { focarPorId } from './utils/acessibilidade';

const TITULOS = {
  '/': 'Dex',
  '/times': 'Meus Times',
  '/acessibilidade': 'Acessibilidade',
};

/*
 * Em uma SPA a página não recarrega ao trocar de rota, então o leitor de tela
 * não percebe a mudança. Aqui:
 * - o <title> da aba é atualizado (WCAG 2.4.2);
 * - o foco vai para o <h1> da nova página, que é lido em voz alta.
 */
function useGerenciarTrocaDeRota() {
  const { pathname, state } = useLocation();
  const rotaAnterior = useRef(pathname);

  useEffect(() => {
    document.title = `${TITULOS[pathname] ?? 'Página não encontrada'} — Pokédex Acessível`;

    if (rotaAnterior.current === pathname) return;
    rotaAnterior.current = pathname;
    // o atalho "Ir para a busca" pede para focar a busca em vez do título
    if (state?.focarBusca) return;
    focarPorId('titulo-pagina');
  }, [pathname, state]);
}

function PaginaNaoEncontrada() {
  return (
    <div className="container">
      <h1 id="titulo-pagina" tabIndex={-1}>
        Página não encontrada
      </h1>
      <p>
        O endereço acessado não existe. <Link to="/">Voltar para a Dex</Link>.
      </p>
    </div>
  );
}

function App() {
  useGerenciarTrocaDeRota();

  return (
    <>
      <FaixaAcessibilidade />
      <Navbar />
      <main id="conteudo" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Dex />} />
          <Route path="/times" element={<Times />} />
          <Route path="/acessibilidade" element={<Acessibilidade />} />
          <Route path="*" element={<PaginaNaoEncontrada />} />
        </Routes>
      </main>
      <Rodape />
    </>
  );
}

export default App;
