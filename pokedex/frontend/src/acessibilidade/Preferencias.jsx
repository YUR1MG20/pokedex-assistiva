import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/*
 * Preferências de acessibilidade do usuário (contraste, tamanho do texto,
 * espaçamento, animações e links). São aplicadas como atributos no <html>
 * (ex.: data-tema="alto-contraste") e o CSS reage a eles.
 * Ficam salvas no navegador para a próxima visita.
 */

const CHAVE_ARMAZENAMENTO = 'pokedex-acessivel:preferencias';

export const TEMAS = [
  { id: 'auto', nome: 'Automático (segue o sistema)' },
  { id: 'claro', nome: 'Claro' },
  { id: 'escuro', nome: 'Escuro' },
  { id: 'alto-contraste', nome: 'Alto contraste' },
];

export const ESCALA_MIN = 100;
export const ESCALA_MAX = 200;
export const ESCALA_PASSO = 25;

export const PREFERENCIAS_PADRAO = {
  tema: 'auto',
  escalaFonte: 100, // em %
  espacamentoAmplo: false,
  reduzirMovimento: false,
  destacarLinks: false,
};

function lerPreferenciasSalvas() {
  try {
    const salvo = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (!salvo) return PREFERENCIAS_PADRAO;
    return { ...PREFERENCIAS_PADRAO, ...JSON.parse(salvo) };
  } catch {
    return PREFERENCIAS_PADRAO;
  }
}

const PreferenciasContexto = createContext(null);

export function ProvedorPreferencias({ children }) {
  const [preferencias, setPreferencias] = useState(lerPreferenciasSalvas);

  // Aplica as preferências no <html> sempre que mudarem
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.dataset.tema = preferencias.tema;
    raiz.dataset.espacamento = preferencias.espacamentoAmplo ? 'amplo' : 'normal';
    raiz.dataset.movimento = preferencias.reduzirMovimento ? 'reduzido' : 'normal';
    raiz.dataset.links = preferencias.destacarLinks ? 'destacados' : 'normal';
    raiz.style.fontSize = `${preferencias.escalaFonte}%`;

    try {
      window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(preferencias));
    } catch {
      // Navegação privada ou armazenamento bloqueado: segue sem salvar
    }
  }, [preferencias]);

  const valor = useMemo(() => {
    function atualizar(campo, novoValor) {
      setPreferencias((anterior) => ({ ...anterior, [campo]: novoValor }));
    }

    return {
      preferencias,
      atualizar,
      aumentarFonte: () =>
        setPreferencias((p) => ({
          ...p,
          escalaFonte: Math.min(ESCALA_MAX, p.escalaFonte + ESCALA_PASSO),
        })),
      diminuirFonte: () =>
        setPreferencias((p) => ({
          ...p,
          escalaFonte: Math.max(ESCALA_MIN, p.escalaFonte - ESCALA_PASSO),
        })),
      alternarAltoContraste: () =>
        setPreferencias((p) => ({
          ...p,
          tema: p.tema === 'alto-contraste' ? 'auto' : 'alto-contraste',
        })),
      restaurarPadrao: () => setPreferencias(PREFERENCIAS_PADRAO),
    };
  }, [preferencias]);

  return <PreferenciasContexto.Provider value={valor}>{children}</PreferenciasContexto.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferencias() {
  const contexto = useContext(PreferenciasContexto);
  if (!contexto) throw new Error('usePreferencias precisa estar dentro de <ProvedorPreferencias>');
  return contexto;
}
