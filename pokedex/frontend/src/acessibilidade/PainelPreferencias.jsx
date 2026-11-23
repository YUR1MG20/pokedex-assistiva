import { useEffect, useRef } from 'react';
import { ESCALA_MAX, ESCALA_MIN, TEMAS, usePreferencias } from './Preferencias';

/*
 * Painel de preferências: contraste configurável, tamanho do texto (até 200%),
 * espaçamento de texto, destaque de links e redução de animações.
 * Abre logo abaixo da faixa de acessibilidade; Esc fecha e devolve o foco.
 */
function PainelPreferencias({ aoFechar }) {
  const { preferencias, atualizar, aumentarFonte, diminuirFonte, restaurarPadrao } =
    usePreferencias();
  const refTitulo = useRef(null);

  // Ao abrir, leva o foco para o título do painel
  useEffect(() => {
    refTitulo.current?.focus();
  }, []);

  function aoPressionarTecla(evento) {
    if (evento.key === 'Escape') {
      evento.stopPropagation();
      aoFechar();
    }
  }

  const noMinimo = preferencias.escalaFonte <= ESCALA_MIN;
  const noMaximo = preferencias.escalaFonte >= ESCALA_MAX;

  return (
    <section
      id="painel-preferencias"
      className="painel-preferencias"
      aria-labelledby="titulo-preferencias"
      onKeyDown={aoPressionarTecla}
    >
      <div className="container">
        <div className="espaco-entre">
          <h2 id="titulo-preferencias" ref={refTitulo} tabIndex={-1} style={{ margin: 0 }}>
            Preferências de acessibilidade
          </h2>
          <button type="button" onClick={aoFechar}>
            Fechar painel
          </button>
        </div>
        <p className="dica" style={{ marginTop: '0.25rem' }}>
          As escolhas são aplicadas na hora e ficam salvas neste navegador. Pressione Esc para
          fechar.
        </p>

        <div className="grade-preferencias">
          <fieldset>
            <legend>Contraste e cores</legend>
            <div className="opcoes-radio">
              {TEMAS.map((tema) => (
                <label key={tema.id}>
                  <input
                    type="radio"
                    name="tema"
                    value={tema.id}
                    checked={preferencias.tema === tema.id}
                    onChange={() => atualizar('tema', tema.id)}
                  />
                  {tema.nome}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Tamanho do texto</legend>
            <div className="linha controle-fonte">
              {/* aria-disabled em vez de disabled: o botão continua focado ao chegar no limite */}
              <button
                type="button"
                aria-disabled={noMinimo}
                onClick={() => !noMinimo && diminuirFonte()}
              >
                <span aria-hidden="true">A−</span> Diminuir
              </button>
              <output id="valor-fonte" aria-live="polite">
                {preferencias.escalaFonte}%
              </output>
              <button
                type="button"
                aria-disabled={noMaximo}
                onClick={() => !noMaximo && aumentarFonte()}
              >
                <span aria-hidden="true">A+</span> Aumentar
              </button>
            </div>
            <button
              type="button"
              className="botao-pequeno"
              style={{ marginTop: '0.5rem' }}
              onClick={() => atualizar('escalaFonte', 100)}
            >
              Tamanho padrão
            </button>
          </fieldset>

          <fieldset>
            <legend>Leitura e movimento</legend>
            <div className="opcoes-radio">
              <label className="campo-checkbox">
                <input
                  type="checkbox"
                  checked={preferencias.espacamentoAmplo}
                  onChange={(e) => atualizar('espacamentoAmplo', e.target.checked)}
                />
                Aumentar espaçamento do texto
              </label>
              <label className="campo-checkbox">
                <input
                  type="checkbox"
                  checked={preferencias.destacarLinks}
                  onChange={(e) => atualizar('destacarLinks', e.target.checked)}
                />
                Destacar links
              </label>
              <label className="campo-checkbox">
                <input
                  type="checkbox"
                  checked={preferencias.reduzirMovimento}
                  onChange={(e) => atualizar('reduzirMovimento', e.target.checked)}
                />
                Reduzir animações
              </label>
            </div>
          </fieldset>
        </div>

        <button type="button" onClick={restaurarPadrao} style={{ marginBottom: '1rem' }}>
          Restaurar preferências padrão
        </button>
      </div>
    </section>
  );
}

export default PainelPreferencias;
