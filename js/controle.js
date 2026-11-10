
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const sidebar = $("sidebar");
  const menuToggle = $("menuToggle");
  const overlay = $("overlay");
  const toast = $("toast");

  const robo = $("roboAnimado");
  const movimentoAtual = $("movimentoAtual");
  const historico = $("historicoComandos");
  const velocidade = $("velocidade");
  const velocidadeValor = $("velocidadeValor");

  const joystick = $("joystick");
  const knob = $("joystickKnob");

  let movimento = null;
  let arrastando = false;
  let pointerAtivo = null;
  let teclaAtiva = null;
  let botaoAtivo = null;
  let timerGesto = null;
  let timerToast = null;

  const classesMovimento = [
    "mov-frente", "mov-tras",
    "mov-esquerda", "mov-direita"
  ];

  const classesGesto = [
    "dancando", "comemorando",
    "descansando", "acenando",
    "bracos-cima", "braco-esquerdo",
    "braco-direito"
  ];

  const classesCabeca = [
    "cabeca-cima", "cabeca-baixo",
    "cabeca-esquerda", "cabeca-direita"
  ];

  const nomes = {
    frente: "Indo para frente",
    tras: "Indo para trás",
    esquerda: "Virando à esquerda",
    direita: "Virando à direita"
  };

  // MENU LATERAL
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

  // NOTIFICAÇÕES
  function notificar(texto) {
    clearTimeout(timerToast);
    toast.textContent = texto;
    toast.classList.add("visivel");

    timerToast = setTimeout(() => {
      toast.classList.remove("visivel");
    }, 2800);
  }

  // HISTÓRICO
  function registrar(nome, icone = "✦") {
    const vazio = historico.querySelector(".historico-vazio");
    if (vazio) vazio.remove();

    const item = document.createElement("div");
    item.className = "historico-item";

    const simbolo = document.createElement("span");
    simbolo.className = "icone";
    simbolo.textContent = icone;

    const descricao = document.createElement("div");
    descricao.className = "descricao";

    const titulo = document.createElement("strong");
    titulo.textContent = nome;

    const detalhe = document.createElement("small");
    detalhe.textContent = "Comando demonstrativo";

    descricao.append(titulo, detalhe);

    const hora = document.createElement("span");
    hora.className = "hora";
    hora.textContent = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    item.append(simbolo, descricao, hora);
    historico.prepend(item);

    while (historico.children.length > 6) {
      historico.lastElementChild.remove();
    }
  }

  // ESTADO VISUAL
  function definirEstado(texto) {
    movimentoAtual.textContent = texto;
  }

  function limparAnimacoes() {
    robo.classList.remove(
      ...classesMovimento,
      ...classesGesto,
      ...classesCabeca
    );
  }

  function centralizarJoystick() {
    knob.style.left = "50%";
    knob.style.top = "50%";
  }

  function pararMovimento() {
    const anterior = movimento;
    movimento = null;

    robo.classList.remove(...classesMovimento);
    centralizarJoystick();

    if (anterior) {
      definirEstado("Parado");
      registrar("Movimento interrompido", "■");
    }
  }

  function pararTudo() {
    clearTimeout(timerGesto);
    timerGesto = null;

    movimento = null;
    teclaAtiva = null;
    botaoAtivo = null;
    arrastando = false;
    pointerAtivo = null;

    limparAnimacoes();
    centralizarJoystick();
    definirEstado("Parado");
    registrar("Todas as animações paradas", "🛑");
    notificar("💜 BIBOU está parado (simulação).");
  }

  $("pararTudo").addEventListener("click", pararTudo);
  $("pararMini").addEventListener("click", pararTudo);

  // MOVIMENTAÇÃO
  function mover(direcao) {
    if (Number(velocidade.value) === 0) {
      pararMovimento();
      definirEstado("Velocidade em 0%");
      return;
    }

    if (movimento === direcao) return;

    clearTimeout(timerGesto);
    timerGesto = null;

    limparAnimacoes();

    movimento = direcao;
    robo.classList.add("mov-" + direcao);
    definirEstado(nomes[direcao]);
    registrar(nomes[direcao], "🎮");
  }

  // JOYSTICK POR ARRASTE
  function atualizarJoystick(evento) {
    const rect = joystick.getBoundingClientRect();
    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;

    const dx = evento.clientX - centroX;
    const dy = evento.clientY - centroY;

    const limite = rect.width * 0.29;
    const distancia = Math.hypot(dx, dy);
    const escala = distancia > limite ? limite / distancia : 1;

    const x = dx * escala;
    const y = dy * escala;

    knob.style.left = `calc(50% + ${x}px)`;
    knob.style.top = `calc(50% + ${y}px)`;

    if (Math.hypot(x, y) < limite * .25) {
      pararMovimento();
      return;
    }

    let direcao;

    if (Math.abs(x) > Math.abs(y)) {
      direcao = x > 0 ? "direita" : "esquerda";
    } else {
      direcao = y > 0 ? "tras" : "frente";
    }

    mover(direcao);
  }

  joystick.addEventListener("pointerdown", evento => {
    if (arrastando) return;

    arrastando = true;
    pointerAtivo = evento.pointerId;

    joystick.setPointerCapture(evento.pointerId);
    atualizarJoystick(evento);
  });

  joystick.addEventListener("pointermove", evento => {
    if (!arrastando || evento.pointerId !== pointerAtivo) return;
    atualizarJoystick(evento);
  });

  function soltarJoystick(evento) {
    if (evento.pointerId !== pointerAtivo) return;

    arrastando = false;
    pointerAtivo = null;
    pararMovimento();
  }

  joystick.addEventListener("pointerup", soltarJoystick);
  joystick.addEventListener("pointercancel", soltarJoystick);
  joystick.addEventListener("lostpointercapture", evento => {
    if (evento.pointerId === pointerAtivo) {
      arrastando = false;
      pointerAtivo = null;
      pararMovimento();
    }
  });

  // BOTÕES DIRECIONAIS
  document.querySelectorAll("[data-move]").forEach(botao => {
    botao.addEventListener("pointerdown", evento => {
      if (botaoAtivo) return;

      botaoAtivo = botao;
      botao.setPointerCapture(evento.pointerId);
      botao.classList.add("pressionado");
      mover(botao.dataset.move);
    });

    function soltar() {
      if (botaoAtivo !== botao) return;

      botao.classList.remove("pressionado");
      botaoAtivo = null;
      pararMovimento();
    }

    botao.addEventListener("pointerup", soltar);
    botao.addEventListener("pointercancel", soltar);
    botao.addEventListener("lostpointercapture", soltar);
  });

  // CONTROLE POR TECLADO
  const teclas = {
    ArrowUp: "frente",
    ArrowDown: "tras",
    ArrowLeft: "esquerda",
    ArrowRight: "direita",
    w: "frente",
    s: "tras",
    a: "esquerda",
    d: "direita"
  };

  function campoEmFoco(elemento) {
    return elemento &&
      ["INPUT", "TEXTAREA", "SELECT"].includes(elemento.tagName);
  }

  document.addEventListener("keydown", evento => {
    if (campoEmFoco(document.activeElement)) return;

    if (evento.key === "Escape" || evento.code === "Space") {
      if (evento.code === "Space") evento.preventDefault();
      pararTudo();
      fecharMenu();
      return;
    }

    const direcao = teclas[evento.key];
    if (!direcao) return;

    evento.preventDefault();

    if (teclaAtiva === null) {
      teclaAtiva = evento.key;
      mover(direcao);
    }
  });

  document.addEventListener("keyup", evento => {
    if (evento.key !== teclaAtiva) return;

    teclaAtiva = null;
    pararMovimento();
  });

  window.addEventListener("blur", pararTudo);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pararTudo();
  });

  // VELOCIDADE SIMULADA
  velocidade.addEventListener("input", () => {
    velocidadeValor.textContent = velocidade.value + "%";

    if (Number(velocidade.value) === 0) {
      pararMovimento();
      definirEstado("Velocidade em 0%");
    }
  });

  // CABEÇA
  document.querySelectorAll("[data-head]").forEach(botao => {
    botao.addEventListener("click", () => {
      pararMovimento();
      clearTimeout(timerGesto);
      robo.classList.remove(...classesCabeca);

      const direcao = botao.dataset.head;

      if (direcao !== "centro") {
        robo.classList.add("cabeca-" + direcao);
      }

      const nome = direcao === "centro"
        ? "Cabeça centralizada"
        : "Olhando para " + direcao;

      definirEstado(nome);
      registrar(nome, "🤖");
    });
  });

  // BRAÇOS
  document.querySelectorAll("[data-arm]").forEach(botao => {
    botao.addEventListener("click", () => {
      pararMovimento();
      clearTimeout(timerGesto);
      robo.classList.remove(...classesGesto);

      const acao = botao.dataset.arm;

      const animacoes = {
        levantar: "bracos-cima",
        esquerdo: "braco-esquerdo",
        direito: "braco-direito",
        acenar: "acenando"
      };

      if (animacoes[acao]) {
        robo.classList.add(animacoes[acao]);
      }

      const nomesBracos = {
        levantar: "Braços levantados",
        abaixar: "Braços abaixados",
        esquerdo: "Braço esquerdo levantado",
        direito: "Braço direito levantado",
        acenar: "Acenando"
      };

      definirEstado(nomesBracos[acao]);
      registrar(nomesBracos[acao], "🙌");
    });
  });

  // GESTOS
  document.querySelectorAll("[data-gesture]").forEach(botao => {
    botao.addEventListener("click", () => {
      pararMovimento();
      clearTimeout(timerGesto);
      limparAnimacoes();

      const gesto = botao.dataset.gesture;

      const gestos = {
        dancar: {
          classe: "dancando",
          texto: "Dançando",
          icone: "🎵"
        },
        oi: {
          classe: "acenando",
          texto: "Dizendo oi",
          icone: "👋"
        },
        feliz: {
          classe: "comemorando",
          texto: "Comemorando",
          icone: "🥳"
        },
        descansar: {
          classe: "descansando",
          texto: "Descansando",
          icone: "💤"
        }
      };

      const escolhido = gestos[gesto];

      robo.classList.add(escolhido.classe);
      definirEstado(escolhido.texto);
      registrar(escolhido.texto, escolhido.icone);

      if (gesto !== "descansar") {
        timerGesto = setTimeout(() => {
          limparAnimacoes();
          definirEstado("Parado");
          timerGesto = null;
        }, 3000);
      }
    });
  });

  // TELAS FUTURAS
  document.querySelectorAll("[data-page]").forEach(botao => {
    botao.addEventListener("click", () => {

      if (botao.dataset.page === "Expressões") {
        window.location.href = "expressoes.html";
        return;
      }

      fecharMenu();


      if (botao.dataset.page === "Memória") {
        window.location.href = "memoria.html";
        return;
      }


      if (botao.dataset.page === "Sensores") {
        window.location.href = "sensores.html";
        return;
      }

      if (botao.dataset.page === "Energia") {
        window.location.href = "sensores.html#energia";
        return;
      }


      if (botao.dataset.page === "Configurações") {
        window.location.href = "configuracoes.html";
        return;
      }


      notificar(
        `✨ A tela "${botao.dataset.page}" será criada em breve!`
      );
    });
  });

  console.log("BIBOU OS - Controle demonstrativo ativo");
});
