// Funções auxiliares de acessibilidade usadas em toda a aplicação.

/**
 * Transforma nomes vindos da PokéAPI ("mr-mime", "solar-power") em texto legível
 * ("Mr Mime", "Solar Power"). Isso melhora a leitura pelo sintetizador de voz,
 * que leria o hífen como "traço".
 */
export function formatarNome(nome = '') {
  return String(nome)
    .split('-')
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');
}

// --- Contraste (WCAG 2.2, critério 1.4.3) ---

function luminanciaRelativa(hex) {
  const limpo = hex.replace('#', '');
  const canais = [0, 2, 4].map((i) => parseInt(limpo.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canais.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores hexadecimais (1 a 21). */
export function razaoContraste(corA, corB) {
  const a = luminanciaRelativa(corA);
  const b = luminanciaRelativa(corB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Escolhe a cor de texto (preta ou branca) com maior contraste sobre o fundo.
 * Antes, todas as etiquetas de tipo usavam texto branco, e 12 dos 18 tipos
 * ficavam abaixo do mínimo de 4,5:1 (ex.: Elétrico tinha 1,5:1).
 */
export function corTextoLegivel(corFundo) {
  const PRETO = '#111111';
  const BRANCO = '#ffffff';
  return razaoContraste(corFundo, PRETO) >= razaoContraste(corFundo, BRANCO) ? PRETO : BRANCO;
}

/** Junta itens de uma lista em português: "A", "A e B", "A, B e C". */
export function juntarLista(itens) {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

/** Move o foco para um elemento pelo id (no próximo quadro, depois da renderização). */
export function focarPorId(id, { rolar = true } = {}) {
  requestAnimationFrame(() => {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    elemento.focus({ preventScroll: !rolar });
    if (rolar) elemento.scrollIntoView({ block: 'nearest' });
  });
}
