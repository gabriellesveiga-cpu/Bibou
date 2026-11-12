
/* ==========================================
   BIBOU OS — SENSORES PREMIUM
   Simulação de sensores e energia
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = id => document.getElementById(id);

  const estado = {
    bateria: 78,
    simulacaoAtiva: true,
    recarga: "fora",
    velocidade: 0,
    inclinacao: 0,
    distancias: {
      frente: 85,
      esquerda: 120,
      direita: 65
    }
  };

  let timerLeituras = null;
  let timerChegada = null;
  let timerCarga = null;
  let timerToast = null;

  const sidebar = $("sidebar");
  const menuToggle = $("menuToggle");
  const overlay = $("overlay");
  const toast = $("toast");

  const ajusteBateria = $("ajusteBateria");
  const ajusteMotores = $("ajusteMotores");
  const ajusteInclinacao = $("ajusteInclinacao");
  const bibouRecarga = $("bibouRecarga");
  const historico = $("historicoSensores");

  const limitar = (valor, minimo, maximo) =>
    Math.min(maximo, Math.max(minimo, valor));

  // ESTADO COMPARTILHADO

  function sincronizarEstado() {
    if (typeof window.BibouEstado?.atualizar !== "function") {
      return;
    }

    try {
      window.BibouEstado.atualizar({
        bateria: Math.round(estado.bateria),
        velocidade: estado.velocidade,
        recarga: estado.recarga
      });
    } catch (erro) {
      console.warn("Falha na sincronização de estado:", erro);
    }
  }

  // MENU RESPONSIVO

  function fecharMenu() {
    sidebar?.classList.remove("aberto");

    if (overlay) overlay.hidden = true;

    menuToggle?.setAttribute("aria-expanded", "false");
  }

  menuToggle?.addEventListener("click", () => {
    const aberto = sidebar.classList.toggle("aberto");

    if (overlay) overlay.hidden = !aberto;

    menuToggle.setAttribute(
      "aria-expanded",
      String(aberto)
    );
  });

  overlay?.addEventListener("click", fecharMenu);

  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") fecharMenu();
  });

  // NOTIFICAÇÕES

  function notificar(mensagem) {
    if (!toast) return;

    clearTimeout(timerToast);
    toast.textContent = mensagem;
    toast.classList.add("visivel");

    timerToast = setTimeout(() => {
      toast.classList.remove("visivel");
    }, 2800);
  }

  // HISTÓRICO DE EVENTOS

  function registrar(titulo, icone = "✦") {
    historico.querySelector(
      ".sensors-history-empty"
    )?.remove();

    const item = document.createElement("div");
    item.className = "sensors-history-item";

    const simbolo = document.createElement("span");
    simbolo.className = "sensors-history-icon";
    simbolo.textContent = icone;

    const info = document.createElement("div");
    info.className = "sensors-history-info";

    const nome = document.createElement("strong");
    nome.textContent = titulo;

    const descricao = document.createElement("small");
    descricao.textContent = "Evento demonstrativo";

    info.append(nome, descricao);

    const hora = document.createElement("span");
    hora.className = "sensors-history-time";
    hora.textContent = new Date().toLocaleTimeString(
      "pt-BR",
      { hour: "2-digit", minute: "2-digit" }
    );

    item.append(simbolo, info, hora);
    historico.prepend(item);

    while (historico.children.length > 7) {
      historico.lastElementChild.remove();
    }
  }

  $("limparHistorico").addEventListener("click", () => {
    historico.replaceChildren();

    const vazio = document.createElement("div");
    vazio.className = "sensors-history-empty";
    vazio.textContent =
      "Nenhum evento registrado nesta sessão.";

    historico.appendChild(vazio);
    notificar("Histórico demonstrativo limpo.");
  });

  // BATERIA

  function atualizarBateria() {
    const nivel = Math.round(estado.bateria);
    const carregando = estado.recarga === "carregando";

    $("bateriaValor").textContent = `${nivel}%`;
    ajusteBateria.value = nivel;

    const cor = nivel <= 20
      ? "#e7a1a1"
      : nivel <= 40
        ? "#e7bf83"
        : "#aa8bdc";

    const anel = $("anelBateria");
    anel.style.setProperty("--battery", `${nivel}%`);
    anel.style.setProperty("--battery-color", cor);

    const status = $("bateriaStatus");

    if (carregando) {
      status.textContent = "ϟ Carregando";
      status.style.color = "#80d8b0";
    } else if (nivel <= 20) {
      status.textContent = "● Bateria baixa";
      status.style.color = "#e7a1a1";
    } else if (estado.recarga === "completa") {
      status.textContent = "● Carga completa";
      status.style.color = "#80d8b0";
    } else {
      status.textContent = "● Em uso";
      status.style.color = "#aa8bdc";
    }

    // Estimativa apenas ilustrativa:
    // cinco minutos por ponto percentual.
    const minutos = nivel * 5;
    const horas = Math.floor(minutos / 60);
    const restantes = minutos % 60;

    $("autonomiaValor").textContent = carregando
      ? "Em recarga"
      : `${horas}h ${String(restantes).padStart(2, "0")}min`;

    $("tensaoValor").textContent =
      (6.5 + nivel * 0.017)
        .toFixed(2)
        .replace(".", ",") + " V";

    $("consumoValor").textContent = carregando
      ? "0,0 W"
      : (1.4 + estado.velocidade * 0.025)
          .toFixed(1)
          .replace(".", ",") + " W";
  }

  ajusteBateria.addEventListener("input", () => {
    estado.bateria = limitar(
      Number(ajusteBateria.value), 0, 100
    );

    atualizarBateria();
    sincronizarEstado();

    if (
      estado.bateria >= 100 &&
      estado.recarga === "carregando"
    ) {
      concluirRecarga();
    }
  });

  ajusteBateria.addEventListener("change", () => {
    registrar(
      `Bateria ajustada para ${estado.bateria}%`,
      "ϟ"
    );
  });

  // DISTÂNCIAS E RADAR

  const direcoes = [
    ["frente", "distFrente", "barraFrente", "pontoFrente"],
    ["esquerda", "distEsquerda", "barraEsquerda", "pontoEsquerda"],
    ["direita", "distDireita", "barraDireita", "pontoDireita"]
  ];

  function atualizarDistancias() {
    direcoes.forEach(([chave, textoId, barraId, pontoId]) => {
      const distancia = estado.distancias[chave];

      $(textoId).textContent = `${distancia} cm`;

      const barra = $(barraId);
      barra.style.width =
        `${limitar(distancia / 200 * 100, 0, 100)}%`;

      const cor = distancia < 30
        ? "#e7a1a1"
        : distancia < 60
          ? "#e7bf83"
          : "#aa8bdc";

      barra.style.background = cor;

      const ponto = $(pontoId);
      if (ponto) {
        ponto.style.background = cor;
        ponto.style.boxShadow = `0 0 12px ${cor}80`;
      }
    });

    const menor = Math.min(
      ...Object.values(estado.distancias)
    );

    const alerta = $("alertaObstaculo");

    if (menor < 30) {
      alerta.textContent =
        "Atenção: obstáculo próximo na simulação.";
      alerta.classList.add("atencao");
    } else {
      alerta.textContent =
        "Nenhum obstáculo próximo.";
      alerta.classList.remove("atencao");
    }
  }

  function gerarDistancias() {
    const anterior = Math.min(
      ...Object.values(estado.distancias)
    );

    Object.keys(estado.distancias).forEach(direcao => {
      estado.distancias[direcao] =
        Math.floor(15 + Math.random() * 186);
    });

    atualizarDistancias();

    const atual = Math.min(
      ...Object.values(estado.distancias)
    );

    if (atual < 30 && anterior >= 30) {
      registrar("Obstáculo virtual detectado", "!");
    }
  }

  // INCLINAÇÃO

  function atualizarInclinacao() {
    const angulo = estado.inclinacao;

    $("inclinacaoLateral").textContent = `${angulo}°`;
    $("inclinacaoFrontal").textContent = "0°";

    $("roboInclinacao").style.transform =
      `rotate(${angulo}deg)`;
  }

  ajusteInclinacao.addEventListener("input", () => {
    estado.inclinacao = limitar(
      Number(ajusteInclinacao.value), -30, 30
    );

    atualizarInclinacao();
  });

  ajusteInclinacao.addEventListener("change", () => {
    registrar(
      `Inclinação virtual: ${estado.inclinacao}°`,
      "◇"
    );
  });

  // MOTORES

  function atualizarMotores() {
    const velocidade = estado.velocidade;
    const rpm = Math.round(velocidade * 1.8);

    $("motorPercentual").textContent = `${velocidade}%`;
    $("rpmEsquerda").textContent = `${rpm} RPM`;
    $("rpmDireita").textContent = `${rpm} RPM`;

    $("motorEstado").textContent =
      velocidade === 0
        ? "Em repouso"
        : "Movimento simulado";

    const roda = $("motorIcone");
    roda.classList.toggle("girando", velocidade > 0);
    roda.style.animationDuration =
      `${Math.max(.25, 1.8 - velocidade * .014)}s`;

    ajusteMotores.value = velocidade;

    atualizarBateria();
  }

  ajusteMotores.addEventListener("input", () => {
    if (estado.recarga !== "fora") {
      ajusteMotores.value = 0;
      notificar(
        "Saia da base antes de simular os motores."
      );
      return;
    }

    estado.velocidade = limitar(
      Number(ajusteMotores.value), 0, 100
    );

    atualizarMotores();
    sincronizarEstado();
  });

  ajusteMotores.addEventListener("change", () => {
    registrar(
      `Motores ajustados para ${estado.velocidade}%`,
      "⚙"
    );
  });

  // RECARGA

  function atualizarEstadoRecarga(titulo, descricao) {
    $("estadoRecarga").textContent = titulo;
    $("descricaoRecarga").textContent = descricao;
  }

  function atualizarBotoesRecarga() {
    $("iniciarRecarga").disabled =
      estado.recarga !== "fora";

    $("sairBase").disabled =
      estado.recarga === "fora";

    ajusteMotores.disabled =
      estado.recarga !== "fora";
  }

  function concluirRecarga() {
    clearInterval(timerCarga);
    timerCarga = null;

    estado.bateria = 100;
    estado.recarga = "completa";

    atualizarEstadoRecarga(
      "Carga completa!",
      "BIBOU está com 100% de bateria virtual."
    );

    atualizarBateria();
    atualizarBotoesRecarga();
    sincronizarEstado();

    registrar("Recarga demonstrativa concluída", "✓");
  }

  function iniciarCarregamento() {
    if (estado.recarga !== "procurando") return;

    estado.recarga = "carregando";

    atualizarEstadoRecarga(
      "Carregando...",
      "BIBOU chegou à base e iniciou a recarga virtual."
    );

    atualizarBateria();
    atualizarBotoesRecarga();
    sincronizarEstado();

    registrar("Recarga virtual iniciada", "ϟ");

    if (estado.bateria >= 100) {
      concluirRecarga();
      return;
    }

    clearInterval(timerCarga);

    // Carregamento acelerado para demonstração.
    timerCarga = setInterval(() => {
      if (estado.recarga !== "carregando") return;

      estado.bateria = Math.min(
        100, estado.bateria + 1
      );

      atualizarBateria();
      sincronizarEstado();

      if (estado.bateria >= 100) {
        concluirRecarga();
      }
    }, 700);
  }

  $("iniciarRecarga").addEventListener("click", () => {
    if (estado.recarga !== "fora") return;

    estado.recarga = "procurando";
    estado.velocidade = 0;

    atualizarMotores();
    atualizarBotoesRecarga();

    atualizarEstadoRecarga(
      "Procurando a base...",
      "BIBOU está se aproximando da base virtual."
    );

    bibouRecarga.classList.add("na-base");
    sincronizarEstado();

    registrar("Busca da base iniciada", "⌕");

    clearTimeout(timerChegada);
    timerChegada = setTimeout(() => {
      timerChegada = null;
      iniciarCarregamento();
    }, 3000);
  });

  $("sairBase").addEventListener("click", () => {
    clearTimeout(timerChegada);
    clearInterval(timerCarga);

    timerChegada = null;
    timerCarga = null;

    estado.recarga = "fora";

    bibouRecarga.classList.remove("na-base");

    atualizarEstadoRecarga(
      "Fora da base",
      "BIBOU está aguardando um comando."
    );

    atualizarBateria();
    atualizarBotoesRecarga();
    sincronizarEstado();

    registrar("BIBOU saiu da base virtual", "↩");
  });

  // LEITURAS AUTOMÁTICAS

  function executarLeituras() {
    gerarDistancias();
    atualizarBateria();
    atualizarInclinacao();
    atualizarMotores();
  }

  function iniciarLeituras() {
    clearInterval(timerLeituras);

    timerLeituras = setInterval(() => {
      if (!estado.simulacaoAtiva || document.hidden) {
        return;
      }

      executarLeituras();
    }, 3000);
  }

  $("alternarSimulacao").addEventListener("click", () => {
    estado.simulacaoAtiva = !estado.simulacaoAtiva;

    const ativa = estado.simulacaoAtiva;

    $("estadoSimulacao").textContent =
      ativa ? "Simulação ativa" : "Leituras pausadas";

    $("alternarSimulacao").textContent =
      ativa ? "Pausar leituras" : "Retomar leituras";

    $("indicadorSimulacao").classList.toggle(
      "pausado", !ativa
    );

    document.body.classList.toggle(
      "leituras-pausadas", !ativa
    );

    registrar(
      ativa ? "Leituras retomadas" : "Leituras pausadas",
      ativa ? "▶" : "Ⅱ"
    );
  });

  $("novasLeituras").addEventListener("click", () => {
    executarLeituras();
    registrar("Sensores virtuais atualizados", "↻");
    notificar("Novas leituras demonstrativas!");
  });

  // LIMPEZA DOS TEMPORIZADORES

  window.addEventListener("pagehide", () => {
    clearInterval(timerLeituras);
    clearInterval(timerCarga);
    clearTimeout(timerChegada);
    clearTimeout(timerToast);
  });

  // INICIALIZAÇÃO

  atualizarBateria();
  atualizarDistancias();
  atualizarInclinacao();
  atualizarMotores();
  atualizarBotoesRecarga();
  sincronizarEstado();
  iniciarLeituras();

  console.log(
    "BIBOU OS — Sensores Premium carregados!"
  );
});
