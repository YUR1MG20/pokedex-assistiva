import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { focarPorId } from '../utils/acessibilidade';
import { ATALHOS } from './atalhos';
import PainelPreferencias from './PainelPreferencias';
import { usePreferencias } from './Preferencias';

/*
 * Faixa de acessibilidade no topo da página, no padrão do eMAG (gov.br):
 * - links de salto com teclas de atalho (accesskey) 1 a 4;
 * - link para a página de acessibilidade;
 * - botão de alto contraste;
 * - botão que abre o painel de preferências (texto, espaçamento, animações...).
 */

function FaixaAcessibilidade() {
  const [painelAberto, setPainelAberto] = useState(false);
  const { preferencias, alternarAltoContraste } = usePreferencias();
  const navegar = useNavigate();
  const { pathname } = useLocation();

  function irPara(evento, alvo) {
    evento.preventDefault();

    // A busca só existe na Dex: se estiver em outra página, navega até ela primeiro
    if (alvo === 'busca' && pathname !== '/') {
      navegar('/', { state: { focarBusca: true } });
      return;
    }

    focarPorId(alvo);
  }

  function fecharPainel() {
    setPainelAberto(false);
    focarPorId('botao-preferencias', { rolar: false });
  }

  const altoContrasteAtivo = preferencias.tema === 'alto-contraste';

  return (
    <>
      <div className="faixa-acessibilidade">
        <div className="container espaco-entre">
          <nav aria-label="Atalhos de acessibilidade">
            <ul className="lista-sem-marcador linha" role="list" style={{ gap: '0.25rem' }}>
              {ATALHOS.map((atalho) => (
                <li key={atalho.alvo}>
                  <a
                    href={`#${atalho.alvo}`}
                    accessKey={atalho.tecla}
                    onClick={(evento) => irPara(evento, atalho.alvo)}
                  >
                    {atalho.texto}
                    <span className="atalho-tecla" aria-hidden="true">
                      {atalho.tecla}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="linha" style={{ gap: '0.25rem' }}>
            <Link to="/acessibilidade">Acessibilidade</Link>
            <button type="button" aria-pressed={altoContrasteAtivo} onClick={alternarAltoContraste}>
              Alto contraste
            </button>
            <button
              type="button"
              id="botao-preferencias"
              aria-expanded={painelAberto}
              aria-controls="painel-preferencias"
              onClick={() => setPainelAberto((aberto) => !aberto)}
            >
              Preferências de acessibilidade
            </button>
          </div>
        </div>
      </div>

      {painelAberto && <PainelPreferencias aoFechar={fecharPainel} />}
    </>
  );
}

export default FaixaAcessibilidade;
