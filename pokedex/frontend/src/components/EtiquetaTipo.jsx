import { TIPOS } from '../constants';
import { corTextoLegivel, formatarNome } from '../utils/acessibilidade';

/*
 * Etiqueta colorida do tipo do Pokémon.
 * A cor do texto (preta ou branca) é calculada para ter contraste mínimo de 4,5:1
 * com o fundo. O nome do tipo é sempre escrito: a cor nunca é a única informação.
 */
function EtiquetaTipo({ tipo, children }) {
  const info = TIPOS[tipo];
  const fundo = info?.cor || '#555555';

  return (
    <span
      className="etiqueta-tipo"
      style={{ '--tipo-fundo': fundo, '--tipo-texto': corTextoLegivel(fundo) }}
    >
      {children ?? info?.nome ?? formatarNome(tipo)}
    </span>
  );
}

export default EtiquetaTipo;
