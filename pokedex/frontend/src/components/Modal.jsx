import { useEffect, useRef } from 'react';

/*
 * Modal acessível usando o elemento nativo <dialog> com showModal():
 * - o navegador já deixa o resto da página inerte (o Tab não "vaza" para trás do modal)
 *   e o leitor de tela anuncia como "diálogo" com o título informado em aria-labelledby;
 * - Esc fecha;
 * - clicar no fundo escurecido fecha;
 * - ao fechar, o foco volta para o elemento que abriu o modal (WCAG 2.4.3).
 *
 * Atenção: regiões aria-live fora do modal ficam inertes enquanto ele está aberto,
 * por isso mensagens de status do modal devem ficar DENTRO dele.
 */
function Modal({ aberto, aoFechar, tituloId, descricaoId, children }) {
  const refDialogo = useRef(null);
  const refFocoAnterior = useRef(null);

  useEffect(() => {
    const dialogo = refDialogo.current;
    if (!dialogo) return undefined;

    if (aberto && !dialogo.open) {
      refFocoAnterior.current = document.activeElement;
      dialogo.showModal();
    }

    if (!aberto && dialogo.open) {
      dialogo.close();
    }

    return undefined;
  }, [aberto]);

  // Devolve o foco quando o modal fecha ou quando o componente sai da tela
  useEffect(() => {
    if (aberto) return undefined;
    const elemento = refFocoAnterior.current;
    if (elemento && typeof elemento.focus === 'function' && document.contains(elemento)) {
      elemento.focus();
    }
    refFocoAnterior.current = null;
    return undefined;
  }, [aberto]);

  function aoCancelar(evento) {
    // Esc: deixamos o React controlar o estado em vez do navegador fechar sozinho
    evento.preventDefault();
    aoFechar();
  }

  function aoClicar(evento) {
    // O <dialog> não tem padding; então um clique nele mesmo é um clique no fundo
    if (evento.target === refDialogo.current) aoFechar();
  }

  return (
    <dialog
      ref={refDialogo}
      className="modal"
      aria-labelledby={tituloId}
      aria-describedby={descricaoId}
      onCancel={aoCancelar}
      onClick={aoClicar}
    >
      {aberto && <div className="modal-corpo">{children}</div>}
    </dialog>
  );
}

export default Modal;
