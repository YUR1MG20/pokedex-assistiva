import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

/*
 * Anunciador para leitores de tela (regiões "aria-live").
 *
 * Mudanças que acontecem sem o foco sair do lugar (filtro aplicado, time salvo,
 * Pokémon removido...) não seriam percebidas por quem usa NVDA/TalkBack.
 * Com `anunciar('mensagem')` o texto é colocado numa região viva e lido em voz alta.
 *
 * - educado (polite): espera o leitor terminar o que está falando
 * - assertivo: interrompe (usado só para erros)
 */

const AnunciadorContexto = createContext(null);

export function ProvedorAnunciador({ children }) {
  const [mensagemEducada, setMensagemEducada] = useState('');
  const [mensagemAssertiva, setMensagemAssertiva] = useState('');
  const temporizadores = useRef({});

  const anunciar = useCallback((texto, { assertivo = false } = {}) => {
    const tipo = assertivo ? 'assertivo' : 'educado';
    const definir = assertivo ? setMensagemAssertiva : setMensagemEducada;
    // Limpa e preenche de novo: assim a mesma frase repetida também é lida
    definir('');
    clearTimeout(temporizadores.current[tipo]);
    temporizadores.current[tipo] = setTimeout(() => definir(texto), 100);
  }, []);

  const valor = useMemo(() => ({ anunciar }), [anunciar]);

  return (
    <AnunciadorContexto.Provider value={valor}>
      {children}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {mensagemEducada}
      </div>
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {mensagemAssertiva}
      </div>
    </AnunciadorContexto.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnunciador() {
  const contexto = useContext(AnunciadorContexto);
  if (!contexto) throw new Error('useAnunciador precisa estar dentro de <ProvedorAnunciador>');
  return contexto;
}
