import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnunciador } from '../acessibilidade/Anunciador';
import EtiquetaTipo from '../components/EtiquetaTipo';
import {
  API,
  TIPOS,
  CAMPOS_EV,
  ICONES_TIME,
  LIMITE_EV_POR_STATUS,
  LIMITE_EV_TOTAL,
  LIMITE_POKEMON_POR_TIME,
  obterRegiaoPorId,
  obterImagemPokemon,
  obterImagemIconeTime,
  carregarCatalogoCompleto,
  buscarDetalhesPokemon,
} from '../constants';
import { focarPorId, formatarNome, juntarLista } from '../utils/acessibilidade';

const STAT_PARA_EV = {
  hp: 'ev_hp',
  attack: 'ev_atk',
  defense: 'ev_def',
  'special-attack': 'ev_spa',
  'special-defense': 'ev_spd',
  speed: 'ev_spe',
};

const EVS_ZERADOS = { ev_hp: 0, ev_atk: 0, ev_def: 0, ev_spa: 0, ev_spd: 0, ev_spe: 0 };

function nomeDoIcone(iconeId) {
  return ICONES_TIME.find((item) => item.id === iconeId)?.nome || 'Poké Ball';
}

function somarEvs(dados) {
  return CAMPOS_EV.reduce((soma, campo) => soma + (Number(dados[campo.chave]) || 0), 0);
}

function Times() {
  const { anunciar } = useAnunciador();

  // 1. Times e formulário de criar/editar
  const [times, setTimes] = useState([]);
  const [carregandoTimes, setCarregandoTimes] = useState(true);
  const [nomeTime, setNomeTime] = useState('');
  const [treinador, setTreinador] = useState('');
  const [iconeTime, setIconeTime] = useState('poke-ball');
  const [timeEmEdicaoId, setTimeEmEdicaoId] = useState(null);
  const [erroNome, setErroNome] = useState('');
  const [erroGeral, setErroGeral] = useState('');
  const [salvando, setSalvando] = useState(false);

  // 2. Catálogo (nomes e tipos) e cache de habilidades/stats por espécie
  const [catalogo, setCatalogo] = useState([]);
  const [detalhesPorPokemon, setDetalhesPorPokemon] = useState({});

  // 3. Time aberto (painel da equipe)
  const [timeAbertoId, setTimeAbertoId] = useState(null);
  const [membros, setMembros] = useState([]);
  const [carregandoMembros, setCarregandoMembros] = useState(false);
  const [erroMembro, setErroMembro] = useState('');

  // 4. Edição de um membro da equipe
  const [membroEmEdicaoId, setMembroEmEdicaoId] = useState(null);
  const [dadosEdicao, setDadosEdicao] = useState({});
  const [errosEdicao, setErrosEdicao] = useState({});

  async function carregarTimes() {
    try {
      const resposta = await fetch(`${API}/times`);
      if (!resposta.ok) throw new Error();
      const lista = await resposta.json();
      setTimes(lista);
      setErroGeral('');
      return lista;
    } catch {
      setErroGeral(
        'Não foi possível conectar com o servidor. Verifique se o back-end está rodando em localhost:3001.'
      );
      return [];
    } finally {
      setCarregandoTimes(false);
    }
  }

  async function carregarMembrosDoTime(timeId) {
    setCarregandoMembros(true);
    try {
      const resposta = await fetch(`${API}/times/${timeId}/pokemon`);
      if (!resposta.ok) throw new Error();
      const lista = await resposta.json();
      setMembros(lista);
      return lista;
    } catch {
      setErroMembro('Não foi possível carregar a equipe deste time.');
      return [];
    } finally {
      setCarregandoMembros(false);
    }
  }

  async function garantirDetalhesEspecie(pokemonId) {
    if (detalhesPorPokemon[pokemonId]) return detalhesPorPokemon[pokemonId];

    const dados = await buscarDetalhesPokemon(pokemonId);
    const info = {
      habilidades: dados.abilities.map((item) => ({
        nome: item.ability.name,
        oculta: item.is_hidden,
      })),
      stats: dados.stats.map((item) => ({
        chaveEv: STAT_PARA_EV[item.stat.name],
        valor: item.base_stat,
      })),
    };

    setDetalhesPorPokemon((anterior) => ({ ...anterior, [pokemonId]: info }));
    return info;
  }

  useEffect(() => {
    carregarTimes();
    carregarCatalogoCompleto()
      .then((lista) => setCatalogo(lista))
      .catch(() => {});
  }, []);

  function nomeDaEspecie(pokemonId) {
    const especie = catalogo.find((p) => p.id === pokemonId);
    return especie ? formatarNome(especie.nome) : `Pokémon ${pokemonId}`;
  }

  function nomeDoMembro(membro) {
    return membro.apelido || nomeDaEspecie(membro.pokemon_id);
  }

  // ================= CRUD de times =================

  function limparFormularioTime() {
    setTimeEmEdicaoId(null);
    setNomeTime('');
    setTreinador('');
    setIconeTime('poke-ball');
    setErroNome('');
  }

  function iniciarEdicaoTime(time) {
    setTimeEmEdicaoId(time.id);
    setNomeTime(time.nome);
    setTreinador(time.treinador || '');
    setIconeTime(time.icone || 'poke-ball');
    setErroNome('');
    // leva o foco (e a tela) até o formulário, já no campo de nome
    focarPorId('nome-time');
  }

  function cancelarEdicaoTime() {
    const idEditado = timeEmEdicaoId;
    limparFormularioTime();
    anunciar('Edição cancelada.');
    if (idEditado) focarPorId(`editar-time-${idEditado}`);
  }

  async function salvarTime(evento) {
    evento.preventDefault();
    if (salvando) return;

    const nome = nomeTime.trim();
    if (!nome) {
      setErroNome('Informe o nome do time.');
      focarPorId('nome-time');
      return;
    }

    setErroNome('');
    setErroGeral('');
    setSalvando(true);

    const idEditado = timeEmEdicaoId;
    const url = idEditado ? `${API}/times/${idEditado}` : `${API}/times`;

    try {
      const resposta = await fetch(url, {
        method: idEditado ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, treinador, icone: iconeTime }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(dados.erro || 'Erro ao salvar o time.');

      limparFormularioTime();
      await carregarTimes();

      if (idEditado) {
        anunciar(`Time “${nome}” atualizado.`);
        focarPorId(`editar-time-${idEditado}`);
      } else {
        anunciar(`Time “${nome}” criado. Ele já aparece na lista de times cadastrados.`);
      }
    } catch (err) {
      setErroGeral(err.message || 'Erro ao salvar o time.');
    } finally {
      setSalvando(false);
    }
  }

  async function duplicarTime(time) {
    try {
      const respMembros = await fetch(`${API}/times/${time.id}/pokemon`);
      const listaMembros = respMembros.ok ? await respMembros.json() : [];
      const nomeCopia = `${time.nome} (Cópia)`;

      const respNovoTime = await fetch(`${API}/times`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeCopia,
          treinador: time.treinador || '',
          icone: time.icone || 'poke-ball',
        }),
      });

      if (!respNovoTime.ok) throw new Error();
      const novoTime = await respNovoTime.json();

      for (const membro of listaMembros) {
        await fetch(`${API}/times/${novoTime.id}/pokemon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pokemon_id: membro.pokemon_id,
            apelido: membro.apelido,
            shiny: membro.shiny,
            habilidade: membro.habilidade,
            nivel: membro.nivel,
            natureza: membro.natureza,
            ev_hp: membro.ev_hp,
            ev_atk: membro.ev_atk,
            ev_def: membro.ev_def,
            ev_spa: membro.ev_spa,
            ev_spd: membro.ev_spd,
            ev_spe: membro.ev_spe,
          }),
        });
      }

      await carregarTimes();
      anunciar(`Time “${time.nome}” duplicado. A cópia se chama “${nomeCopia}”.`);
    } catch {
      setErroGeral('Erro ao duplicar o time.');
    }
  }

  async function excluirTime(time) {
    // window.confirm é uma caixa de diálogo nativa: o leitor de tela lê e o teclado opera
    if (!window.confirm(`Excluir o time ${time.nome} e todos os Pokémon dele?`)) return;

    try {
      const resposta = await fetch(`${API}/times/${time.id}`, { method: 'DELETE' });
      if (!resposta.ok) throw new Error();
      if (timeAbertoId === time.id) setTimeAbertoId(null);
      if (timeEmEdicaoId === time.id) limparFormularioTime();
      await carregarTimes();
      anunciar(`Time “${time.nome}” excluído.`);
      // o botão clicado deixou de existir: o foco vai para o título da lista
      focarPorId('titulo-lista-times');
    } catch {
      setErroGeral(`Não foi possível excluir o time ${time.nome}.`);
    }
  }

  async function alternarAberturaTime(time) {
    if (timeAbertoId === time.id) {
      setTimeAbertoId(null);
      return;
    }

    setTimeAbertoId(time.id);
    setMembros([]);
    setMembroEmEdicaoId(null);
    setErroMembro('');
    const lista = await carregarMembrosDoTime(time.id);
    anunciar(
      `Equipe de “${time.nome}”: ${lista.length} de ${LIMITE_POKEMON_POR_TIME} Pokémon.`
    );
  }

  // ================= Membros da equipe =================

  async function iniciarEdicaoMembro(membro) {
    setMembroEmEdicaoId(membro.id);
    setErrosEdicao({});
    setDadosEdicao({
      ...membro,
      apelido: membro.apelido || '',
      habilidade: membro.habilidade || '',
      nivel: String(membro.nivel ?? 50),
    });
    focarPorId(`apelido-membro-${membro.id}`);

    await garantirDetalhesEspecie(membro.pokemon_id).catch(() => {});
  }

  function cancelarEdicaoMembro() {
    const id = membroEmEdicaoId;
    setMembroEmEdicaoId(null);
    setErrosEdicao({});
    focarPorId(`editar-membro-${id}`);
  }

  function alterarCampoEdicao(campo, valor) {
    setDadosEdicao((anterior) => ({ ...anterior, [campo]: valor }));
    // o erro daquele campo some assim que o usuário mexe nele
    setErrosEdicao((anterior) => {
      if (!anterior[campo] && !anterior.evs) return anterior;
      const copia = { ...anterior };
      delete copia[campo];
      if (campo.startsWith('ev_')) delete copia.evs;
      return copia;
    });
  }

  function moverMembro(indiceAtual, direcao) {
    const novoIndice = indiceAtual + direcao;
    if (novoIndice < 0 || novoIndice >= membros.length) return;

    const copia = [...membros];
    const [removido] = copia.splice(indiceAtual, 1);
    copia.splice(novoIndice, 0, removido);
    setMembros(copia);

    anunciar(`${nomeDoMembro(removido)} agora está na posição ${novoIndice + 1} de ${copia.length}.`);
    // ao reordenar, o React move o elemento no DOM; devolvemos o foco ao mesmo botão
    focarPorId(`mover-${direcao < 0 ? 'antes' : 'depois'}-${removido.id}`, { rolar: true });
  }

  function zerarEvsEdicao() {
    setDadosEdicao((anterior) => ({ ...anterior, ...EVS_ZERADOS }));
    setErrosEdicao({});
    anunciar('Todos os EVs foram zerados.');
  }

  async function distribuirEvsAutomatico() {
    try {
      const info = await garantirDetalhesEspecie(dadosEdicao.pokemon_id);
      const ordenados = [...info.stats].sort((a, b) => b.valor - a.valor);
      const novosEvs = { ...EVS_ZERADOS };

      if (ordenados[0]) novosEvs[ordenados[0].chaveEv] = 252;
      if (ordenados[1]) novosEvs[ordenados[1].chaveEv] = 252;
      if (ordenados[2]) novosEvs[ordenados[2].chaveEv] = 4;

      setDadosEdicao((anterior) => ({ ...anterior, ...novosEvs }));
      setErrosEdicao({});

      const nomeDoStatus = (chave) => CAMPOS_EV.find((c) => c.chave === chave)?.nomeCompleto;
      anunciar(
        `EVs distribuídos: 252 em ${nomeDoStatus(ordenados[0]?.chaveEv)}, 252 em ${nomeDoStatus(
          ordenados[1]?.chaveEv
        )} e 4 em ${nomeDoStatus(ordenados[2]?.chaveEv)}.`
      );
    } catch {
      setErrosEdicao({ servidor: 'Não foi possível calcular os EVs automáticos.' });
    }
  }

  function validarEdicao() {
    const erros = {};
    const nivel = Number(dadosEdicao.nivel);
    if (!Number.isInteger(nivel) || nivel < 1 || nivel > 100) {
      erros.nivel = 'O nível deve ser um número inteiro de 1 a 100.';
    }

    for (const campo of CAMPOS_EV) {
      const valor = Number(dadosEdicao[campo.chave]);
      if (!Number.isInteger(valor) || valor < 0 || valor > LIMITE_EV_POR_STATUS) {
        erros[campo.chave] = `Use um número de 0 a ${LIMITE_EV_POR_STATUS}.`;
      }
    }

    const soma = somarEvs(dadosEdicao);
    if (soma > LIMITE_EV_TOTAL) {
      erros.evs = `A soma dos EVs é ${soma} e passou do limite de ${LIMITE_EV_TOTAL}. Retire ${
        soma - LIMITE_EV_TOTAL
      } pontos.`;
    }
    return erros;
  }

  async function salvarEdicaoMembro(evento) {
    evento.preventDefault();
    const id = membroEmEdicaoId;
    const erros = validarEdicao();

    if (Object.keys(erros).length > 0) {
      setErrosEdicao(erros);
      // foco no primeiro campo com problema (WCAG 3.3.1 — identificação do erro)
      if (erros.nivel) focarPorId(`nivel-membro-${id}`);
      else {
        const primeiroEv = CAMPOS_EV.find((c) => erros[c.chave]) || CAMPOS_EV[0];
        focarPorId(`${primeiroEv.chave}-membro-${id}`);
      }
      return;
    }

    try {
      const corpo = { ...dadosEdicao };
      for (const campo of CAMPOS_EV) corpo[campo.chave] = Number(dadosEdicao[campo.chave]);

      const resposta = await fetch(`${API}/time-pokemon/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...corpo,
          apelido: dadosEdicao.apelido.trim() || null,
          habilidade: dadosEdicao.habilidade || null,
          nivel: Number(dadosEdicao.nivel),
        }),
      });

      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(dados.erro || 'Erro ao salvar as alterações.');

      setMembroEmEdicaoId(null);
      setErrosEdicao({});
      await carregarMembrosDoTime(timeAbertoId);
      anunciar(`Alterações em ${dadosEdicao.apelido.trim() || nomeDaEspecie(dadosEdicao.pokemon_id)} salvas.`);
      focarPorId(`editar-membro-${id}`);
    } catch (err) {
      setErrosEdicao({ servidor: err.message });
    }
  }

  async function removerMembro(membro) {
    const nome = nomeDoMembro(membro);
    if (!window.confirm(`Remover ${nome} deste time?`)) return;

    try {
      const resposta = await fetch(`${API}/time-pokemon/${membro.id}`, { method: 'DELETE' });
      if (!resposta.ok) throw new Error();
      await carregarMembrosDoTime(timeAbertoId);
      anunciar(`${nome} foi removido do time.`);
      focarPorId(`titulo-equipe-${timeAbertoId}`);
    } catch {
      setErroMembro(`Não foi possível remover ${nome}.`);
    }
  }

  // Resumo das tipagens da equipe aberta
  const contagemTiposEquipe = {};
  for (const membro of membros) {
    const especie = catalogo.find((p) => p.id === membro.pokemon_id);
    for (const tipo of especie?.tipos || []) {
      contagemTiposEquipe[tipo] = (contagemTiposEquipe[tipo] || 0) + 1;
    }
  }

  const timeEmEdicao = times.find((t) => t.id === timeEmEdicaoId);
  const somaEvsEdicao = somarEvs(dadosEdicao);

  // ================= Renderização =================

  return (
    <div className="container">
      <h1 id="titulo-pagina" tabIndex={-1}>
        Meus Times
      </h1>
      <p className="texto-suave">
        Crie times com até {LIMITE_POKEMON_POR_TIME} Pokémon. Para adicionar Pokémon a um time, use a{' '}
        <Link to="/">Dex</Link>.
      </p>

      {/* ---------- Formulário: criar / editar time ---------- */}
      <section className="card" aria-labelledby="titulo-form-time" style={{ marginBottom: '1.25rem' }}>
        <h2 id="titulo-form-time">
          {timeEmEdicao ? `Editar o time “${timeEmEdicao.nome}”` : 'Criar novo time'}
        </h2>

        <form onSubmit={salvarTime} noValidate aria-labelledby="titulo-form-time">
          <p className="dica" style={{ marginBottom: '0.75rem' }}>
            Campos marcados com <span aria-hidden="true">*</span>
            <span className="sr-only">asterisco</span> são obrigatórios.
          </p>

          <div className="grade-formulario" style={{ alignItems: 'start' }}>
            <div className="campo">
              <label htmlFor="nome-time">
                Nome do time <span aria-hidden="true">*</span>
              </label>
              <input
                id="nome-time"
                value={nomeTime}
                onChange={(e) => {
                  setNomeTime(e.target.value);
                  if (erroNome) setErroNome('');
                }}
                required
                aria-required="true"
                aria-invalid={erroNome ? 'true' : 'false'}
                aria-describedby={erroNome ? 'erro-nome-time' : undefined}
                maxLength={100}
                autoComplete="off"
              />
              <p id="erro-nome-time" className="msg-erro">
                {erroNome}
              </p>
            </div>

            <div className="campo">
              <label htmlFor="treinador-time">Treinador (opcional)</label>
              <input
                id="treinador-time"
                value={treinador}
                onChange={(e) => setTreinador(e.target.value)}
                maxLength={100}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Grupo de rádios: setas do teclado trocam a opção; o nome do item é lido */}
          <fieldset className="seletor-icone" style={{ marginTop: '0.75rem' }}>
            <legend>Ícone do time</legend>
            <p className="dica">
              Selecionado: <strong>{nomeDoIcone(iconeTime)}</strong>. Use as setas do teclado para
              trocar.
            </p>
            <div className="opcoes-icone">
              {ICONES_TIME.map((item) => (
                <label key={item.id} className="opcao-icone">
                  <input
                    type="radio"
                    name="icone-time"
                    value={item.id}
                    checked={iconeTime === item.id}
                    onChange={() => setIconeTime(item.id)}
                  />
                  <img src={obterImagemIconeTime(item.id)} alt="" width="28" height="28" />
                  <span className="sr-only">{item.nome}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="acoes" style={{ marginTop: '0.75rem' }}>
            <button type="submit" className="botao-primario" aria-disabled={salvando}>
              {timeEmEdicaoId ? 'Salvar alterações' : 'Criar time'}
            </button>
            {timeEmEdicaoId && (
              <button type="button" onClick={cancelarEdicaoTime}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </section>

      <p className="msg-erro" role="alert" style={{ marginBottom: '1rem' }}>
        {erroGeral}
      </p>

      {/* ---------- Lista de times ---------- */}
      <section aria-labelledby="titulo-lista-times">
        <h2 id="titulo-lista-times" tabIndex={-1}>
          Times cadastrados{!carregandoTimes && ` (${times.length})`}
        </h2>

        {carregandoTimes && <p>Carregando times…</p>}

        {!carregandoTimes && !erroGeral && times.length === 0 && (
          <p>Nenhum time cadastrado ainda. Use o formulário acima para criar o primeiro.</p>
        )}

        <ul className="lista-times lista-sem-marcador" role="list">
          {times.map((time) => {
            const estaAberto = timeAbertoId === time.id;

            return (
              <li key={time.id}>
                <article className="card" aria-labelledby={`nome-time-${time.id}`}>
                  <div className="espaco-entre">
                    <div className="cabecalho-time">
                      <img src={obterImagemIconeTime(time.icone)} alt="" width="36" height="36" />
                      <div>
                        <h3 id={`nome-time-${time.id}`} style={{ margin: 0 }}>
                          {time.nome}
                        </h3>
                        <p className="texto-suave texto-pequeno" style={{ margin: 0 }}>
                          Treinador: {time.treinador || 'não informado'} · Ícone:{' '}
                          {nomeDoIcone(time.icone)}
                        </p>
                      </div>
                    </div>

                    {/* Textos escondidos completam o nome do botão: "Editar time Kalos" */}
                    <div className="acoes">
                      <button
                        type="button"
                        id={`gerenciar-time-${time.id}`}
                        aria-expanded={estaAberto}
                        aria-controls={`painel-time-${time.id}`}
                        onClick={() => alternarAberturaTime(time)}
                      >
                        <span aria-hidden="true">{estaAberto ? '▲' : '▼'}</span>
                        Gerenciar Pokémon<span className="sr-only"> do time {time.nome}</span>
                      </button>
                      <button
                        type="button"
                        id={`editar-time-${time.id}`}
                        onClick={() => iniciarEdicaoTime(time)}
                      >
                        Editar<span className="sr-only"> time {time.nome}</span>
                      </button>
                      <button type="button" onClick={() => duplicarTime(time)}>
                        Duplicar<span className="sr-only"> time {time.nome}</span>
                      </button>
                      <button type="button" className="botao-perigo" onClick={() => excluirTime(time)}>
                        Excluir<span className="sr-only"> time {time.nome}</span>
                      </button>
                    </div>
                  </div>

                  {/* ---------- Painel da equipe ---------- */}
                  <div id={`painel-time-${time.id}`} className="painel-equipe" hidden={!estaAberto}>
                    {estaAberto && (
                      <>
                        <div className="espaco-entre" style={{ marginBottom: '0.625rem' }}>
                          <h4 id={`titulo-equipe-${time.id}`} tabIndex={-1} style={{ margin: 0 }}>
                            Equipe de {time.nome} ({membros.length} de {LIMITE_POKEMON_POR_TIME})
                          </h4>
                          {membros.length < LIMITE_POKEMON_POR_TIME && (
                            <Link to="/">Adicionar Pokémon pela Dex</Link>
                          )}
                        </div>

                        {carregandoMembros && <p>Carregando equipe…</p>}

                        {Object.keys(contagemTiposEquipe).length > 0 && (
                          <div className="linha texto-pequeno" style={{ marginBottom: '0.875rem' }}>
                            <span id={`rotulo-tipos-${time.id}`} className="texto-suave">
                              Tipagens na equipe:
                            </span>
                            <ul
                              className="lista-sem-marcador linha"
                              role="list"
                              aria-labelledby={`rotulo-tipos-${time.id}`}
                              style={{ gap: '0.25rem' }}
                            >
                              {Object.entries(contagemTiposEquipe).map(([chaveTipo, qtd]) => (
                                <li key={chaveTipo}>
                                  <EtiquetaTipo tipo={chaveTipo}>
                                    {TIPOS[chaveTipo]?.nome || chaveTipo}
                                    <span aria-hidden="true"> ×{qtd}</span>
                                    <span className="sr-only">
                                      : {qtd} Pokémon
                                    </span>
                                  </EtiquetaTipo>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="msg-erro" role="alert">
                          {erroMembro}
                        </p>

                        {!carregandoMembros && membros.length === 0 && (
                          <p className="texto-suave">
                            Nenhum Pokémon neste time ainda. Use a <Link to="/">Dex</Link> para escolher
                            e adicionar.
                          </p>
                        )}

                        {membros.length > 1 && (
                          <p className="dica" style={{ marginBottom: '0.625rem' }}>
                            Use os botões “Antes” e “Depois” para mudar a ordem da equipe (a ordem vale
                            apenas nesta tela).
                          </p>
                        )}

                        <ul className="grade-equipe lista-sem-marcador" role="list">
                          {membros.map((membro, indice) => {
                            const nomeEspecie = nomeDaEspecie(membro.pokemon_id);
                            const nomeExibido = nomeDoMembro(membro);
                            const tiposEspecie =
                              catalogo.find((p) => p.id === membro.pokemon_id)?.tipos || [];
                            const estaEditando = membroEmEdicaoId === membro.id;
                            const exibirShiny = estaEditando ? dadosEdicao.shiny : membro.shiny;
                            const habilidadesDisponiveis =
                              detalhesPorPokemon[membro.pokemon_id]?.habilidades || [];
                            const ehPrimeiro = indice === 0;
                            const ehUltimo = indice === membros.length - 1;

                            return (
                              <li key={membro.id}>
                                <article
                                  className="card card-membro"
                                  aria-labelledby={`nome-membro-${membro.id}`}
                                >
                                  <div className="topo-membro">
                                    <img
                                      src={obterImagemPokemon(membro.pokemon_id, exibirShiny)}
                                      onError={(e) => {
                                        e.currentTarget.src = obterImagemPokemon(membro.pokemon_id, false);
                                      }}
                                      alt=""
                                      width="68"
                                      height="68"
                                    />
                                    <div style={{ minWidth: 0 }}>
                                      <h5 id={`nome-membro-${membro.id}`} style={{ margin: 0 }}>
                                        <span className="sr-only">Posição </span>
                                        {indice + 1}
                                        <span aria-hidden="true">.</span>
                                        <span className="sr-only">:</span> {nomeExibido}
                                        {membro.shiny && (
                                          <>
                                            <span aria-hidden="true"> ✨</span>
                                            <span className="sr-only">, shiny</span>
                                          </>
                                        )}
                                      </h5>

                                      <dl className="dados-membro">
                                        <dt>Espécie</dt>
                                        <dd>
                                          {nomeEspecie} (<span className="sr-only">número </span>
                                          <span aria-hidden="true">#</span>
                                          {membro.pokemon_id}, {obterRegiaoPorId(membro.pokemon_id).nome})
                                        </dd>

                                        <dt>Nível</dt>
                                        <dd>{membro.nivel}</dd>

                                        {tiposEspecie.length > 0 && (
                                          <>
                                            <dt>Tipos</dt>
                                            <dd>
                                              <span className="sr-only">
                                                {juntarLista(tiposEspecie.map((t) => TIPOS[t]?.nome || t))}
                                              </span>
                                              <span
                                                className="etiquetas"
                                                style={{ justifyContent: 'flex-start' }}
                                                aria-hidden="true"
                                              >
                                                {tiposEspecie.map((chaveTipo) => (
                                                  <EtiquetaTipo key={chaveTipo} tipo={chaveTipo} />
                                                ))}
                                              </span>
                                            </dd>
                                          </>
                                        )}

                                        {membro.habilidade && (
                                          <>
                                            <dt>Habilidade</dt>
                                            <dd lang="en">{formatarNome(membro.habilidade)}</dd>
                                          </>
                                        )}

                                        <dt>EVs</dt>
                                        <dd>
                                          <ul className="lista-evs lista-sem-marcador" role="list">
                                            {CAMPOS_EV.map((campo) => (
                                              <li key={campo.chave}>
                                                <span aria-hidden="true">{campo.label}</span>
                                                <span className="sr-only">{campo.nomeCompleto}</span>{' '}
                                                {membro[campo.chave]}
                                              </li>
                                            ))}
                                          </ul>
                                          Total: {somarEvs(membro)} de {LIMITE_EV_TOTAL}
                                        </dd>
                                      </dl>
                                    </div>
                                  </div>

                                  {!estaEditando ? (
                                    <div className="espaco-entre" style={{ marginTop: '0.625rem' }}>
                                      <div className="acoes">
                                        <button
                                          type="button"
                                          id={`editar-membro-${membro.id}`}
                                          onClick={() => iniciarEdicaoMembro(membro)}
                                        >
                                          Editar<span className="sr-only"> {nomeExibido}</span>
                                        </button>
                                        <button
                                          type="button"
                                          className="botao-perigo"
                                          onClick={() => removerMembro(membro)}
                                        >
                                          Remover<span className="sr-only"> {nomeExibido} do time</span>
                                        </button>
                                      </div>

                                      {/* aria-disabled mantém o botão focável quando chega na ponta */}
                                      <div className="acoes">
                                        <button
                                          type="button"
                                          id={`mover-antes-${membro.id}`}
                                          className="botao-pequeno"
                                          aria-disabled={ehPrimeiro}
                                          onClick={() => !ehPrimeiro && moverMembro(indice, -1)}
                                        >
                                          <span aria-hidden="true">←</span> Antes
                                          <span className="sr-only">
                                            {ehPrimeiro
                                              ? `: ${nomeExibido} já é o primeiro`
                                              : `: mover ${nomeExibido} para a posição ${indice}`}
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          id={`mover-depois-${membro.id}`}
                                          className="botao-pequeno"
                                          aria-disabled={ehUltimo}
                                          onClick={() => !ehUltimo && moverMembro(indice, 1)}
                                        >
                                          Depois <span aria-hidden="true">→</span>
                                          <span className="sr-only">
                                            {ehUltimo
                                              ? `: ${nomeExibido} já é o último`
                                              : `: mover ${nomeExibido} para a posição ${indice + 2}`}
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <form
                                      onSubmit={salvarEdicaoMembro}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Escape') cancelarEdicaoMembro();
                                      }}
                                      noValidate
                                      aria-labelledby={`titulo-edicao-${membro.id}`}
                                      style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}
                                    >
                                      <p id={`titulo-edicao-${membro.id}`} className="rotulo" style={{ margin: 0 }}>
                                        Editando {nomeExibido}
                                      </p>
                                      <p className="dica">Pressione Esc para cancelar.</p>

                                      <div className="campo">
                                        <label htmlFor={`apelido-membro-${membro.id}`}>Apelido</label>
                                        <input
                                          id={`apelido-membro-${membro.id}`}
                                          value={dadosEdicao.apelido}
                                          maxLength={100}
                                          autoComplete="off"
                                          onChange={(e) => alterarCampoEdicao('apelido', e.target.value)}
                                        />
                                      </div>

                                      <div className="campo">
                                        <label htmlFor={`habilidade-membro-${membro.id}`}>Habilidade</label>
                                        <select
                                          id={`habilidade-membro-${membro.id}`}
                                          value={dadosEdicao.habilidade}
                                          onChange={(e) => alterarCampoEdicao('habilidade', e.target.value)}
                                        >
                                          <option value="">Padrão da espécie</option>
                                          {habilidadesDisponiveis.map((hab) => (
                                            <option key={hab.nome} value={hab.nome} lang="en">
                                              {formatarNome(hab.nome)}
                                              {hab.oculta ? ' (oculta)' : ''}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div className="linha" style={{ alignItems: 'flex-start' }}>
                                        <div className="campo">
                                          <label htmlFor={`nivel-membro-${membro.id}`}>Nível (1 a 100)</label>
                                          <input
                                            id={`nivel-membro-${membro.id}`}
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
                                            max={100}
                                            value={dadosEdicao.nivel}
                                            onChange={(e) => alterarCampoEdicao('nivel', e.target.value)}
                                            aria-invalid={errosEdicao.nivel ? 'true' : 'false'}
                                            aria-describedby={
                                              errosEdicao.nivel ? `erro-nivel-${membro.id}` : undefined
                                            }
                                            style={{ width: '7rem' }}
                                          />
                                          <p id={`erro-nivel-${membro.id}`} className="msg-erro">
                                            {errosEdicao.nivel}
                                          </p>
                                        </div>

                                        <label className="campo-checkbox" style={{ marginTop: '1.5rem' }}>
                                          <input
                                            type="checkbox"
                                            checked={Boolean(dadosEdicao.shiny)}
                                            onChange={(e) => alterarCampoEdicao('shiny', e.target.checked)}
                                          />
                                          Forma shiny
                                        </label>
                                      </div>

                                      <fieldset
                                        aria-describedby={[
                                          `regras-ev-${membro.id}`,
                                          errosEdicao.evs ? `erro-evs-${membro.id}` : '',
                                        ]
                                          .filter(Boolean)
                                          .join(' ')}
                                      >
                                        <legend>
                                          EVs — total {somaEvsEdicao} de {LIMITE_EV_TOTAL}
                                        </legend>
                                        <p id={`regras-ev-${membro.id}`} className="dica">
                                          Cada status aceita de 0 a {LIMITE_EV_POR_STATUS}; a soma não pode
                                          passar de {LIMITE_EV_TOTAL}.
                                        </p>

                                        <div className="acoes" style={{ margin: '0.5rem 0' }}>
                                          <button
                                            type="button"
                                            className="botao-pequeno"
                                            onClick={distribuirEvsAutomatico}
                                            aria-describedby={`dica-auto-${membro.id}`}
                                          >
                                            Distribuir automaticamente
                                          </button>
                                          <button
                                            type="button"
                                            className="botao-pequeno"
                                            onClick={zerarEvsEdicao}
                                          >
                                            Zerar EVs
                                          </button>
                                        </div>
                                        <p id={`dica-auto-${membro.id}`} className="dica" style={{ marginBottom: '0.5rem' }}>
                                          Coloca 252, 252 e 4 nos três maiores status base da espécie.
                                        </p>

                                        <div className="grade-evs">
                                          {CAMPOS_EV.map((campo) => {
                                            const idCampo = `${campo.chave}-membro-${membro.id}`;
                                            const erroCampo = errosEdicao[campo.chave];
                                            return (
                                              <div className="campo" key={campo.chave}>
                                                <label htmlFor={idCampo}>{campo.nomeCompleto}</label>
                                                <input
                                                  id={idCampo}
                                                  type="number"
                                                  inputMode="numeric"
                                                  min={0}
                                                  max={LIMITE_EV_POR_STATUS}
                                                  value={dadosEdicao[campo.chave]}
                                                  onChange={(e) =>
                                                    alterarCampoEdicao(campo.chave, e.target.value)
                                                  }
                                                  aria-invalid={erroCampo ? 'true' : 'false'}
                                                  aria-describedby={erroCampo ? `erro-${idCampo}` : undefined}
                                                />
                                                <p id={`erro-${idCampo}`} className="msg-erro">
                                                  {erroCampo}
                                                </p>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        <p
                                          className="contador-evs"
                                          data-excedido={somaEvsEdicao > LIMITE_EV_TOTAL}
                                          style={{ margin: '0.5rem 0 0', fontWeight: 600 }}
                                        >
                                          Total: {somaEvsEdicao} de {LIMITE_EV_TOTAL}{' '}
                                          {somaEvsEdicao <= LIMITE_EV_TOTAL
                                            ? `(restam ${LIMITE_EV_TOTAL - somaEvsEdicao})`
                                            : `(passou ${somaEvsEdicao - LIMITE_EV_TOTAL})`}
                                        </p>
                                        <p id={`erro-evs-${membro.id}`} className="msg-erro" role="alert">
                                          {errosEdicao.evs}
                                        </p>
                                      </fieldset>

                                      <p className="msg-erro" role="alert">
                                        {errosEdicao.servidor}
                                      </p>

                                      <div className="acoes">
                                        <button type="submit" className="botao-primario">
                                          Salvar alterações
                                        </button>
                                        <button type="button" onClick={cancelarEdicaoMembro}>
                                          Cancelar
                                        </button>
                                      </div>
                                    </form>
                                  )}
                                </article>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default Times;
