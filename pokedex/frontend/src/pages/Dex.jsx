import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAnunciador } from '../acessibilidade/Anunciador';
import EtiquetaTipo from '../components/EtiquetaTipo';
import Modal from '../components/Modal';
import {
  API,
  REGIOES,
  TIPOS,
  obterRegiaoPorId,
  obterImagemPokemon,
  carregarCatalogoCompleto,
  buscarDetalhesPokemon,
} from '../constants';
import { focarPorId, formatarNome, juntarLista } from '../utils/acessibilidade';

// Nomes por extenso: abreviações como "Atq. Esp." atrapalham o leitor de tela
const NOMES_STATUS = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defesa especial',
  speed: 'Velocidade',
};

function textoQuantidade(quantidade) {
  if (quantidade === 0) return 'Nenhum Pokémon encontrado com esses filtros.';
  return `${quantidade} Pokémon encontrado${quantidade === 1 ? '' : 's'}.`;
}

function nomesDosTipos(tipos) {
  return juntarLista(tipos.map((t) => TIPOS[t]?.nome || formatarNome(t)));
}

/* Cartão de um Pokémon na grade: é um <button> de verdade (Tab + Enter/Espaço). */
function CartaoPokemon({ pokemon, aoAbrir }) {
  const nome = formatarNome(pokemon.nome);

  return (
    <button
      type="button"
      className="card-pokemon"
      aria-haspopup="dialog"
      onClick={() => aoAbrir(pokemon)}
    >
      {/* imagem decorativa: o nome já está escrito no botão */}
      <img src={obterImagemPokemon(pokemon.id)} alt="" width="110" height="110" loading="lazy" />
      <span className="nome-pokemon">{nome}</span>
      <span className="sr-only">, </span>
      <span className="texto-suave texto-pequeno">
        <span className="sr-only">número </span>
        <span aria-hidden="true">#</span>
        {pokemon.id}
      </span>
      {pokemon.tipos.length > 0 && (
        <>
          <span className="sr-only">, tipo: {nomesDosTipos(pokemon.tipos)}</span>
          <span className="etiquetas" aria-hidden="true">
            {pokemon.tipos.map((chaveTipo) => (
              <EtiquetaTipo key={chaveTipo} tipo={chaveTipo} />
            ))}
          </span>
        </>
      )}
    </button>
  );
}

function Dex() {
  const { anunciar } = useAnunciador();
  const location = useLocation();

  // Catálogo e filtros
  const [pokemons, setPokemons] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [regiaoFiltro, setRegiaoFiltro] = useState('todas');
  const [tipo1Filtro, setTipo1Filtro] = useState('todos');
  const [tipo2Filtro, setTipo2Filtro] = useState('todos');
  const [regioesMinimizadas, setRegioesMinimizadas] = useState({});

  // Modal de detalhes
  const [pokemonSelecionado, setPokemonSelecionado] = useState(null);
  const [detalhes, setDetalhes] = useState(null);
  const [erroDetalhes, setErroDetalhes] = useState('');
  const [modoShiny, setModoShiny] = useState(false);

  // Formulário "Adicionar a um time"
  const [times, setTimes] = useState([]);
  const [carregandoTimes, setCarregandoTimes] = useState(false);
  const [erroTimes, setErroTimes] = useState('');
  const [timeEscolhidoId, setTimeEscolhidoId] = useState('');
  const [apelido, setApelido] = useState('');
  const [habilidadeEscolhida, setHabilidadeEscolhida] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarCatalogoCompleto()
      .then((lista) => {
        setPokemons(lista);
        anunciar(`Pokédex carregada com ${lista.length} Pokémon.`);
      })
      .catch(() => {
        const texto = 'Não foi possível carregar os Pokémon. Verifique sua conexão com a internet.';
        setErro(texto);
        anunciar(texto, { assertivo: true });
      })
      .finally(() => setCarregando(false));
  }, [anunciar]);

  // Atalho "Ir para a busca" (tecla 3) usado a partir de outra página
  useEffect(() => {
    if (location.state?.focarBusca) focarPorId('busca');
  }, [location.state]);

  // ---------- Filtros ----------

  const termo = busca.trim().toLowerCase().replace(/^#/, '');

  const pokemonsFiltrados = useMemo(
    () =>
      pokemons.filter((pokemon) => {
        const bateBusca =
          termo === '' ||
          pokemon.nome.includes(termo) ||
          formatarNome(pokemon.nome).toLowerCase().includes(termo) ||
          String(pokemon.id).includes(termo);

        const bateRegiao = regiaoFiltro === 'todas' || pokemon.regiaoId === regiaoFiltro;
        const bateTipo1 = tipo1Filtro === 'todos' || pokemon.tipos.includes(tipo1Filtro);
        const bateTipo2 = tipo2Filtro === 'todos' || pokemon.tipos.includes(tipo2Filtro);

        return bateBusca && bateRegiao && bateTipo1 && bateTipo2;
      }),
    [pokemons, termo, regiaoFiltro, tipo1Filtro, tipo2Filtro]
  );

  const secoesPorRegiao = REGIOES.map((regiao) => ({
    ...regiao,
    pokemonsDaRegiao: pokemonsFiltrados.filter((p) => p.regiaoId === regiao.id),
  })).filter((secao) => secao.pokemonsDaRegiao.length > 0);

  const temFiltroAtivo =
    termo !== '' || regiaoFiltro !== 'todas' || tipo1Filtro !== 'todos' || tipo2Filtro !== 'todos';

  const resumoResultados = textoQuantidade(pokemonsFiltrados.length);

  // Anuncia a quantidade de resultados quando o usuário para de mexer nos filtros
  const chaveFiltros = `${termo}|${regiaoFiltro}|${tipo1Filtro}|${tipo2Filtro}`;
  const filtrosAnunciados = useRef(chaveFiltros);
  useEffect(() => {
    if (filtrosAnunciados.current === chaveFiltros) return undefined;
    const temporizador = setTimeout(() => {
      filtrosAnunciados.current = chaveFiltros;
      anunciar(resumoResultados);
    }, 800);
    return () => clearTimeout(temporizador);
  }, [chaveFiltros, resumoResultados, anunciar]);

  function limparFiltros() {
    setBusca('');
    setRegiaoFiltro('todas');
    setTipo1Filtro('todos');
    setTipo2Filtro('todos');
    // o botão "Limpar" some; o foco vai para a busca para não se perder
    focarPorId('busca');
  }

  function alternarRegiao(regiaoId) {
    setRegioesMinimizadas((anterior) => ({ ...anterior, [regiaoId]: !anterior[regiaoId] }));
  }

  function definirTodasRegioes(minimizar) {
    const novoEstado = {};
    for (const regiao of REGIOES) novoEstado[regiao.id] = minimizar;
    setRegioesMinimizadas(novoEstado);
    anunciar(minimizar ? 'Todas as regiões recolhidas.' : 'Todas as regiões expandidas.');
  }

  // ---------- Modal de detalhes ----------

  async function abrirModalDetalhes(pokemon) {
    setPokemonSelecionado(pokemon);
    setDetalhes(null);
    setErroDetalhes('');
    setModoShiny(false);
    setApelido('');
    setMensagemSucesso('');
    setMensagemErro('');
    setErroTimes('');
    setCarregandoTimes(true);

    try {
      const respostaTimes = await fetch(`${API}/times`);
      if (!respostaTimes.ok) throw new Error();
      const listaTimes = await respostaTimes.json();
      setTimes(listaTimes);
      const timeAindaExiste = listaTimes.some((t) => String(t.id) === timeEscolhidoId);
      if (listaTimes.length > 0 && !timeAindaExiste) {
        setTimeEscolhidoId(String(listaTimes[0].id));
      }
    } catch {
      setErroTimes(
        'Não foi possível carregar seus times. Verifique se o servidor (back-end) está rodando.'
      );
    } finally {
      setCarregandoTimes(false);
    }

    try {
      const dados = await buscarDetalhesPokemon(pokemon.id);
      setDetalhes(dados);
      setHabilidadeEscolhida(dados.abilities[0]?.ability.name || '');
    } catch {
      setErroDetalhes('Erro ao carregar os detalhes na PokéAPI. Tente novamente.');
    }
  }

  function fecharModal() {
    setPokemonSelecionado(null);
  }

  async function adicionarAoTime(evento) {
    evento.preventDefault();
    if (enviando) return;
    setMensagemSucesso('');
    setMensagemErro('');

    if (!timeEscolhidoId) {
      setMensagemErro('Selecione um time primeiro.');
      focarPorId('campo-time');
      return;
    }

    setEnviando(true);
    try {
      const resposta = await fetch(`${API}/times/${timeEscolhidoId}/pokemon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemon_id: pokemonSelecionado.id,
          apelido: apelido.trim() || null,
          shiny: modoShiny,
          habilidade: habilidadeEscolhida || null,
        }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || 'Erro ao adicionar o Pokémon.');

      const nomeTime = times.find((t) => String(t.id) === timeEscolhidoId)?.nome || 'o time';
      // A mensagem fica dentro do modal: regiões vivas fora dele estão inertes agora
      setMensagemSucesso(
        `${apelido.trim() || formatarNome(pokemonSelecionado.nome)} foi adicionado ao time ${nomeTime}.`
      );
      setApelido('');
    } catch (err) {
      setMensagemErro(err.message || 'Erro ao adicionar o Pokémon.');
    } finally {
      setEnviando(false);
    }
  }

  // ---------- Renderização ----------

  const nomeSelecionado = pokemonSelecionado ? formatarNome(pokemonSelecionado.nome) : '';
  const totalStatus = detalhes?.stats.reduce((soma, item) => soma + item.base_stat, 0) ?? 0;

  return (
    <div className="container">
      <h1 id="titulo-pagina" tabIndex={-1}>
        Pokédex
      </h1>
      <p className="texto-suave">
        Explore os {pokemons.length || 1025} Pokémon. Ative um cartão para ver os detalhes e
        adicionar o Pokémon a um dos seus times.
      </p>

      <section className="card filtros" aria-labelledby="titulo-filtros">
        <h2 id="titulo-filtros">Buscar e filtrar</h2>
        <form role="search" aria-labelledby="titulo-filtros" onSubmit={(e) => e.preventDefault()}>
          <div className="grade-formulario">
            <div className="campo">
              <label htmlFor="busca">Nome ou número</label>
              <input
                id="busca"
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-describedby="dica-busca"
                autoComplete="off"
              />
              <p id="dica-busca" className="dica">
                Exemplo: pikachu ou 25
              </p>
            </div>

            <div className="campo">
              <label htmlFor="filtro-regiao">Região</label>
              <select
                id="filtro-regiao"
                value={regiaoFiltro}
                onChange={(e) => setRegiaoFiltro(e.target.value)}
              >
                <option value="todas">Todas as regiões</option>
                {REGIOES.map((regiao) => (
                  <option key={regiao.id} value={regiao.id}>
                    {regiao.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label htmlFor="filtro-tipo1">Tipo</label>
              <select
                id="filtro-tipo1"
                value={tipo1Filtro}
                onChange={(e) => setTipo1Filtro(e.target.value)}
              >
                <option value="todos">Todos os tipos</option>
                {Object.entries(TIPOS).map(([chave, info]) => (
                  <option key={chave} value={chave}>
                    {info.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label htmlFor="filtro-tipo2">Segundo tipo</label>
              <select
                id="filtro-tipo2"
                value={tipo2Filtro}
                onChange={(e) => setTipo2Filtro(e.target.value)}
              >
                <option value="todos">Todos os tipos</option>
                {Object.entries(TIPOS).map(([chave, info]) => (
                  <option key={chave} value={chave} disabled={chave === tipo1Filtro}>
                    {info.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="espaco-entre" style={{ marginTop: '0.5rem' }}>
            <p className="resumo-resultados">{carregando ? 'Carregando…' : resumoResultados}</p>
            {temFiltroAtivo && (
              <button type="button" onClick={limparFiltros}>
                Limpar filtros
              </button>
            )}
          </div>
        </form>
      </section>

      <section aria-labelledby="titulo-resultados" aria-busy={carregando}>
        <div className="espaco-entre" style={{ marginBottom: '0.875rem' }}>
          <h2 id="titulo-resultados" style={{ margin: 0 }}>
            Pokémon por região
          </h2>
          {secoesPorRegiao.length > 1 && (
            <div className="acoes">
              <button type="button" className="botao-pequeno" onClick={() => definirTodasRegioes(false)}>
                Expandir todas
              </button>
              <button type="button" className="botao-pequeno" onClick={() => definirTodasRegioes(true)}>
                Recolher todas
              </button>
            </div>
          )}
        </div>

        {carregando && <p>Carregando Pokédex…</p>}
        {erro && (
          <p className="msg-erro" role="alert">
            {erro}
          </p>
        )}
        {!carregando && !erro && secoesPorRegiao.length === 0 && <p>{resumoResultados}</p>}

        {secoesPorRegiao.map((secao) => {
          const minimizada = Boolean(regioesMinimizadas[secao.id]);
          const idLista = `lista-regiao-${secao.id}`;
          const quantidade = secao.pokemonsDaRegiao.length;

          return (
            <section
              key={secao.id}
              className="secao-regiao"
              aria-labelledby={`titulo-regiao-${secao.id}`}
            >
              <h3 id={`titulo-regiao-${secao.id}`} className="titulo-regiao">
                <button
                  type="button"
                  className="botao-regiao"
                  aria-expanded={!minimizada}
                  aria-controls={idLista}
                  onClick={() => alternarRegiao(secao.id)}
                  style={{ '--cor-regiao': secao.cor }}
                >
                  <span>
                    <span className="seta" aria-hidden="true">
                      ▼
                    </span>
                    {secao.nome}
                    <span className="sr-only">, números {secao.inicio} a {secao.fim}</span>
                    <span className="texto-suave texto-pequeno" aria-hidden="true">
                      {' '}
                      (#{secao.inicio}–#{secao.fim})
                    </span>
                  </span>
                  <span className="sr-only">, </span>
                  <span className="contagem">
                    {quantidade} Pokémon
                  </span>
                </button>
              </h3>

              <ul id={idLista} className="grade-dex lista-sem-marcador" role="list" hidden={minimizada}>
                {!minimizada &&
                  secao.pokemonsDaRegiao.map((pokemon) => (
                    <li key={pokemon.id}>
                      <CartaoPokemon pokemon={pokemon} aoAbrir={abrirModalDetalhes} />
                    </li>
                  ))}
              </ul>
            </section>
          );
        })}
      </section>

      <Modal
        aberto={Boolean(pokemonSelecionado)}
        aoFechar={fecharModal}
        tituloId="titulo-modal"
        descricaoId="descricao-modal"
      >
        {pokemonSelecionado && (
          <>
            <div className="modal-cabecalho">
              <div>
                <h2 id="titulo-modal" style={{ margin: 0 }}>
                  {nomeSelecionado}
                </h2>
                <p id="descricao-modal" className="texto-suave" style={{ margin: 0 }}>
                  <span className="sr-only">Número </span>
                  <span aria-hidden="true">#</span>
                  {pokemonSelecionado.id}, região de {obterRegiaoPorId(pokemonSelecionado.id).nome}
                </p>
              </div>
              <button type="button" onClick={fecharModal}>
                Fechar<span className="sr-only"> detalhes de {nomeSelecionado}</span>
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            <div className="modal-figura">
              <img
                src={obterImagemPokemon(pokemonSelecionado.id, modoShiny)}
                onError={(e) => {
                  e.currentTarget.src = obterImagemPokemon(pokemonSelecionado.id, false);
                }}
                alt={`Arte oficial de ${nomeSelecionado}${modoShiny ? ', forma shiny' : ''}`}
                width="150"
                height="150"
              />
              <div>
                <label className="campo-checkbox">
                  <input
                    type="checkbox"
                    checked={modoShiny}
                    onChange={(e) => setModoShiny(e.target.checked)}
                  />
                  Mostrar forma shiny (cores alternativas)
                </label>
              </div>
            </div>

            {erroDetalhes && (
              <p className="msg-erro" role="alert">
                {erroDetalhes}
              </p>
            )}

            {!detalhes && !erroDetalhes && <p>Carregando detalhes…</p>}

            {detalhes && (
              <>
                <dl className="lista-dados">
                  <dt>Tipos</dt>
                  <dd>
                    <span className="etiquetas" style={{ justifyContent: 'flex-start' }}>
                      {detalhes.types.map((item) => (
                        <EtiquetaTipo key={item.type.name} tipo={item.type.name} />
                      ))}
                    </span>
                  </dd>
                  <dt>Altura</dt>
                  <dd>{(detalhes.height / 10).toLocaleString('pt-BR')} m</dd>
                  <dt>Peso</dt>
                  <dd>{(detalhes.weight / 10).toLocaleString('pt-BR')} kg</dd>
                  <dt>Habilidades</dt>
                  <dd>
                    <ul className="lista-sem-marcador" role="list">
                      {detalhes.abilities.map((item) => (
                        <li key={item.ability.name}>
                          {/* nomes de habilidade vêm em inglês: lang="en" ajusta a pronúncia */}
                          <span lang="en">{formatarNome(item.ability.name)}</span>
                          {item.is_hidden ? ' (oculta)' : ''}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </dl>

                <table className="tabela-status">
                  <caption>Status base</caption>
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">Status</th>
                      <th scope="col">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalhes.stats.map((item) => (
                      <tr key={item.stat.name}>
                        <th scope="row">{NOMES_STATUS[item.stat.name] || item.stat.name}</th>
                        <td>
                          <div className="celula-valor">
                            <strong>{item.base_stat}</strong>
                            {/* a barra é só visual; o número acima já informa o valor */}
                            <div className="barra-fundo" aria-hidden="true">
                              <div
                                className="barra-preenchimento"
                                style={{ width: `${Math.min(100, (item.base_stat / 200) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <th scope="row">Total</th>
                      <td>
                        <strong>{totalStatus}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <form
                  className="form-adicionar"
                  onSubmit={adicionarAoTime}
                  aria-labelledby="titulo-adicionar"
                  noValidate
                >
                  <h3 id="titulo-adicionar" style={{ margin: 0 }}>
                    Adicionar a um time
                  </h3>

                  {carregandoTimes && <p>Carregando seus times…</p>}

                  {!carregandoTimes && erroTimes && <p className="msg-erro">{erroTimes}</p>}

                  {!carregandoTimes && !erroTimes && times.length === 0 && (
                    <p>
                      Você ainda não tem times.{' '}
                      <Link to="/times">Crie um time na página Meus Times</Link> e depois volte
                      aqui.
                    </p>
                  )}

                  {!carregandoTimes && !erroTimes && times.length > 0 && (
                    <>
                      <div className="grade-formulario">
                        <div className="campo">
                          <label htmlFor="campo-time">Time</label>
                          <select
                            id="campo-time"
                            value={timeEscolhidoId}
                            onChange={(e) => setTimeEscolhidoId(e.target.value)}
                            required
                          >
                            {times.map((time) => (
                              <option key={time.id} value={time.id}>
                                {time.nome}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="campo">
                          <label htmlFor="campo-apelido">Apelido (opcional)</label>
                          <input
                            id="campo-apelido"
                            value={apelido}
                            maxLength={100}
                            autoComplete="off"
                            onChange={(e) => setApelido(e.target.value)}
                          />
                        </div>

                        <div className="campo">
                          <label htmlFor="campo-habilidade">Habilidade</label>
                          <select
                            id="campo-habilidade"
                            value={habilidadeEscolhida}
                            onChange={(e) => setHabilidadeEscolhida(e.target.value)}
                          >
                            {detalhes.abilities.map((item) => (
                              <option key={item.ability.name} value={item.ability.name} lang="en">
                                {formatarNome(item.ability.name)}
                                {item.is_hidden ? ' (oculta)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <p className="dica">
                        Forma que será adicionada: <strong>{modoShiny ? 'shiny' : 'normal'}</strong>.
                        Para trocar, use a opção “Mostrar forma shiny” acima.
                      </p>

                      <button type="submit" className="botao-primario" aria-disabled={enviando}>
                        {enviando ? 'Adicionando…' : `Adicionar ${nomeSelecionado} ao time`}
                      </button>
                    </>
                  )}

                  {/* Regiões vivas sempre presentes no DOM, para o leitor anunciar a mudança */}
                  <p className="msg-sucesso" role="status">
                    {mensagemSucesso}
                  </p>
                  <p className="msg-erro" role="alert">
                    {mensagemErro}
                  </p>
                </form>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

export default Dex;
