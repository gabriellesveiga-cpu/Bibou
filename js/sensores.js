
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  // ELEMENTOS
  const sidebar = $("sidebar");
  const menuToggle = $("menuToggle");
  const overlay = $("overlay");
  const toast = $("toast");

  const bateriaValor = $("bateriaValor");
  const bateriaStatus = $("bateriaStatus");
  const anelBateria = $("anelBateria");
  const ajusteBateria = $("ajusteBateria");

  const ajusteMotores = $("ajusteMotores");
  const ajusteInclinacao = $("ajusteInclinacao");
  const bibouRecarga = $("bibouRecarga");

  const historico = $("historicoSensores");

  // ESTADO DA SIMULAÇÃO
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

  // MENU RESPONSIVO
  function fecharMenu() {
    sidebar.classList.remove("aberto");
    overlay.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", () => {
    const abrir = !sidebar.classList.contains("aberto");

    sidebar.classList.toggle("aberto", abrir);
    overlay.hidden = !abrir;
    menuToggle.setAttribute("aria-expanded", String(abrir));
  });

  overlay.addEventListener("click", fecharMenu);

  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") fecharMenu();
  });

  // NOTIFICAÇÕES
  function notificar(mensagem) {
    clearTimeout(timerToast);

    toast.textContent = mensagem;
    toast.classList.add("visivel");

    timerToast = setTimeout(() => {
      toast.classList.remove("visivel");
    }, 3000);
  }

  // HISTÓRICO
  function registrar(titulo, icone = "✦") {
    const vazio = historico.querySelector(".sen-empty");
    if (vazio) vazio.remove();

    const item = document.createElement("div");
    item.className = "sen-history-item";

    const simbolo = document.createElement("span");
    simbolo.textContent = icone;

    const info = document.createElement("div");

    const nome = document.createElement("strong");
    nome.textContent = titulo;

    const descricao = document.createElement("small");
    descricao.textContent = "Evento demonstrativo";

    info.append(nome, descricao);

    const hora = document.createElement("span");
    hora.className = "sen-history-time";
    hora.textContent = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    item.append(simbolo, info, hora);
    historico.prepend(item);

    while (historico.children.length > 7) {
      historico.lastElementChild.remove();
    }
  }

  $("limparHistorico").addEventListener("click", () => {
    historico.replaceChildren();

    const vazio = document.createElement("div");
    vazio.className = "sen-empty";
    vazio.textContent = "✨ Os eventos aparecerão aqui!";

    historico.appendChild(vazio);
    notificar("Histórico demonstrativo limpo.");
  });

  // BATERIA
  function atualizarBateria() {
    const nivel = Math.round(estado.bateria);

    bateriaValor.textContent = nivel + "%";
    ajusteBateria.value = nivel;

    anelBateria.style.setProperty("--battery", nivel + "%");

    let cor = "#b78aff";

    if (nivel <= 20) cor = "#ff9b9b";
    else if (nivel <= 40) cor = "#ffcc83";

    anelBateria.style.setProperty("--battery-color", cor);

    const carregando = estado.recarga === "carregando";

    if (carregando) {
      bateriaStatus.textContent = "⚡ Carregando";
    } else if (nivel <= 20) {
      bateriaStatus.textContent = "● Bateria baixa";
    } else {
      bateriaStatus.textContent = "● Em uso";
    }

    bateriaStatus.style.color = carregando
      ? "#78e7b1"
      : nivel <= 20 ? "#ff9b9b" : "#b78aff";

    // Estimativa fictícia: 5 minutos por ponto percentual
    const minutos = nivel * 5;
    const horas = Math.floor(minutos / 60);
    const restantes = minutos % 60;

    $("autonomiaValor").textContent = carregando
      ? "Em recarga"
      : `${horas}h ${String(restantes).padStart(2, "0")}min`;

    // Números exclusivamente ilustrativos
    $("tensaoValor").textContent =
      (6.5 + nivel * 0.017).toFixed(2).replace(".", ",") + " V";

    $("consumoValor").textContent = carregando
      ? "0,0 W"
      : (1.4 + estado.velocidade * 0.025)
          .toFixed(1).replace(".", ",") + " W";
  }

  ajusteBateria.addEventListener("input", () => {
    estado.bateria = Number(ajusteBateria.value);
    atualizarBateria();

    if (estado.bateria >= 100 &&
        estado.recarga === "carregando") {
      concluirRecarga();
    }
  });

  ajusteBateria.addEventListener("change", () => {
    registrar(
      `Bateria ajustada para ${estado.bateria}%`,
      "🔋"
    );
  });

  // SENSORES DE DISTÂNCIA
  function atualizarDistancias() {
    const distancias = estado.distancias;

    const direcoes = [
      ["frente", "distFrente", "barraFrente"],
      ["esquerda", "distEsquerda", "barraEsquerda"],
      ["direita", "distDireita", "barraDireita"]
    ];

    direcoes.forEach(([chave, textoId, barraId]) => {
      const valor = distancias[chave];

      $(textoId).textContent = valor + " cm";
      $(barraId).style.width =
        Math.min(100, valor / 200 * 100) + "%";

      $(barraId).style.background =
        valor < 30 ? "#ff9b9b"
        : valor < 60 ? "#ffcc83"
        : "linear-gradient(90deg, #a978ff, #ff9fe3)";
    });

    const menor = Math.min(...Object.values(distancias));
    const alerta = $("alertaObstaculo");

    if (menor < 30) {
      alerta.textContent =
        "⚠️ Obstáculo próximo na simulação!";
      alerta.classList.add("atencao");
    } else {
      alerta.textContent =
        "✨ Nenhum obstáculo próximo.";
      alerta.classList.remove("atencao");
    }
  }

  function gerarDistancias() {
    const anterior = Math.min(
      ...Object.values(estado.distancias)
    );

    for (const direcao of Object.keys(estado.distancias)) {
      estado.distancias[direcao] =
        Math.floor(15 + Math.random() * 186);
    }

    atualizarDistancias();

    const atual = Math.min(
      ...Object.values(estado.distancias)
    );

    if (atual < 30 && anterior >= 30) {
      registrar("Obstáculo virtual detectado", "⚠️");
    }
  }

  // INCLINAÇÃO
  function atualizarInclinacao() {
    const angulo = estado.inclinacao;

    $("inclinacaoLateral").textContent = angulo + "°";
    $("inclinacaoFrontal").textContent = "0°";

    $("roboInclinacao").style.transform =
      `rotate(${angulo}deg)`;
  }

  ajusteInclinacao.addEventListener("input", () => {
    estado.inclinacao = Number(ajusteInclinacao.value);
    atualizarInclinacao();
  });

  ajusteInclinacao.addEventListener("change", () => {
    registrar(
      `Inclinação virtual: ${estado.inclinacao}°`,
      "🧭"
    );
  });

  // MOTORES
  function atualizarMotores() {
    const velocidade = estado.velocidade;
    const rpm = Math.round(velocidade * 1.8);

    $("motorPercentual").textContent = velocidade + "%";
    $("rpmEsquerda").textContent = rpm + " RPM";
    $("rpmDireita").textContent = rpm + " RPM";

    $("motorEstado").textContent = velocidade === 0
      ? "Em repouso"
      : "Movimento simulado";

    $("motorIcone").textContent =
      velocidade === 0 ? "🛞" : "⚙️";

    atualizarBateria();
  }

  ajusteMotores.addEventListener("input", () => {
    if (estado.recarga !== "fora") {
      ajusteMotores.value = 0;
      notificar("Saia da base antes de simular os motores.");
      return;
    }

    estado.velocidade = Number(ajusteMotores.value);
    atualizarMotores();
  });

  ajusteMotores.addEventListener("change", () => {
    registrar(
      `Motores ajustados para ${estado.velocidade}%`,
      "⚙️"
    );
  });

  // RECARGA AUTOMÁTICA DEMONSTRATIVA
  function atualizarEstadoRecarga(titulo, descricao) {
    $("estadoRecarga").textContent = titulo;
    $("descricaoRecarga").textContent = descricao;
  }

  function atualizarBotoesRecarga() {
    $("iniciarRecarga").disabled =
      estado.recarga !== "fora";

    $("sairBase").disabled =
      estado.recarga === "fora";
  }

  function concluirRecarga() {
    clearInterval(timerCarga);
    timerCarga = null;

    estado.bateria = 100;
    estado.recarga = "completa";

    atualizarBateria();
    atualizarBotoesRecarga();

    atualizarEstadoRecarga(
      "Carga completa!",
      "BIBOU está com 100% de bateria virtual."
    );

    registrar("Recarga demonstrativa concluída", "💜");
  }

  function iniciarCarregamento() {
    estado.recarga = "carregando";

    atualizarEstadoRecarga(
      "Carregando...",
      "BIBOU chegou à base e iniciou a recarga virtual."
    );

    atualizarBotoesRecarga();
    atualizarBateria();
    registrar("Recarga virtual iniciada", "⚡");

    if (estado.bateria >= 100) {
      concluirRecarga();
      return;
    }

    // Simulação acelerada: 1% a cada 0,7 segundo
    timerCarga = setInterval(() => {
      if (estado.recarga !== "carregando") return;

      estado.bateria = Math.min(100, estado.bateria + 1);
      atualizarBateria();

      if (estado.bateria >= 100) {
        concluirRecarga();
      }
    }, 700);
  }

  $("iniciarRecarga").addEventListener("click", () => {
    if (estado.recarga !== "fora") return;

    estado.recarga = "procurando";
    estado.velocidade = 0;
    ajusteMotores.value = 0;

    atualizarMotores();
    atualizarBotoesRecarga();

    atualizarEstadoRecarga(
      "Procurando a base...",
      "BIBOU está se aproximando da base virtual."
    );

    registrar("Busca da base iniciada", "🔎");

    bibouRecarga.classList.add("na-base");

    timerChegada = setTimeout(() => {
      timerChegada = null;

      if (estado.recarga === "procurando") {
        iniciarCarregamento();
      }
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

    registrar("BIBOU saiu da base virtual", "🤖");
  });

  // ATUALIZAÇÃO AUTOMÁTICA
  function executarLeituras() {
    gerarDistancias();
    atualizarBateria();
    atualizarInclinacao();
    atualizarMotores();
  }

  function iniciarLeituras() {
    clearInterval(timerLeituras);

    timerLeituras = setInterval(() => {
      if (!estado.simulacaoAtiva) return;
      executarLeituras();
    }, 3000);
  }

  $("alternarSimulacao").addEventListener("click", () => {
    estado.simulacaoAtiva = !estado.simulacaoAtiva;

    const ativa = estado.simulacaoAtiva;

    $("estadoSimulacao").textContent = ativa
      ? "Simulação ativa"
      : "Leituras pausadas";

    $("alternarSimulacao").textContent = ativa
      ? "⏸ Pausar leituras"
      : "▶ Retomar leituras";

    document.querySelector(".sen-live")
      .classList.toggle("pausado", !ativa);

    registrar(
      ativa ? "Leituras retomadas" : "Leituras pausadas",
      ativa ? "▶️" : "⏸️"
    );
  });

  $("novasLeituras").addEventListener("click", () => {
    executarLeituras();
    registrar("Sensores virtuais atualizados", "📡");
    notificar("✨ Novas leituras demonstrativas!");
  });

  // TELAS FUTURAS
  document.querySelectorAll("[data-page]").forEach(botao => {
    botao.addEventListener("click", () => {

      if (botao.dataset.page === "Configurações") {
        window.location.href = "configuracoes.html";
        return;
      }

      fecharMenu();
      notificar(
        `✨ A tela "${botao.dataset.page}" será criada em breve!`
      );
    });
  });

  // INICIALIZAÇÃO
  atualizarBateria();
  atualizarDistancias();
  atualizarInclinacao();
  atualizarMotores();
  atualizarBotoesRecarga();
  iniciarLeituras();

  console.log(
    "BIBOU OS - Sensores e Energia demonstrativos ativos!"
  );
});
