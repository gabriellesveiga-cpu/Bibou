
/* ==========================================
   BIBOU OS — CONTROLE PREMIUM
   Simulação de movimentos e gestos
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = id => document.getElementById(id);

  const sidebar = $("sidebar");
  const menuToggle = $("menuToggle");
  const overlay = $("overlay");

  const joystick = $("joystick");
  const handle = $("joystickHandle");
  const velocidadeInput = $("velocidade");
  const velocidadeValor = $("velocidadeValor");
  const movimentoAtual = $("movimentoAtual");
  const ultimoComando = $("ultimoComando");
  const horarioComando = $("horarioComando");
  const robo = document.querySelector(".control-robot");

  const nomes = {
    frente: "Avançando",
    tras: "Recuando",
    esquerda: "Virando à esquerda",
    direita: "Virando à direita",
    acenar: "Acenando",
    dancar: "Dançando",
    feliz: "Expressão feliz",
    descansar: "Descansando",
    parar: "Em repouso"
  };

  const teclas = {
    w: "frente",
    arrowup: "frente",
    s: "tras",
    arrowdown: "tras",
    a: "esquerda",
    arrowleft: "esquerda",
    d: "direita",
    arrowright: "direita"
  };

  let velocidade = 50;
  let movimento = "parar";
  let fonteAtiva = null;
  let pointerAtivo = null;
  let teclaAtiva = null;
  let timerAcao = null;

  // MENU RESPONSIVO

  function fecharMenu() {
    sidebar.classList.remove("aberto");
    overlay.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", () => {
    const aberto = sidebar.classList.toggle("aberto");
    overlay.hidden = !aberto;
    menuToggle.setAttribute("aria-expanded", String(aberto));
  });

  overlay.addEventListener("click", fecharMenu);

  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") fecharMenu();
  });

  // ESTADO COMPARTILHADO

  function compartilharVelocidade(valor) {
    if (!window.BibouEstado) return;

    window.BibouEstado.atualizar({
      velocidade: valor
    });
  }

  function registrarComando(nome) {
    ultimoComando.textContent = nome;
    horarioComando.textContent =
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
  }

  function limparTimer() {
    if (timerAcao !== null) {
      clearTimeout(timerAcao);
      timerAcao = null;
    }
  }

  function atualizarVisual() {
    movimentoAtual.textContent = nomes[movimento];

    robo.classList.remove(
      "moving", "dancing", "waving", "happy"
    );

    document.querySelectorAll(
      ".direction-button[data-direcao]"
    ).forEach(botao => {
      botao.classList.toggle(
        "pressed",
        botao.dataset.direcao === movimento
      );
    });

    if (["frente", "tras", "esquerda", "direita"]
        .includes(movimento)) {
      robo.classList.add("moving");
    }

    if (movimento === "dancar") {
      robo.classList.add("dancing");
    }

    if (movimento === "acenar") {
      robo.classList.add("waving");
    }

    if (movimento === "feliz") {
      robo.classList.add("happy");
    }
  }

  function definirMovimento(novo, fonte = null) {
    if (!nomes[novo]) return;

    limparTimer();

    movimento = novo;
    fonteAtiva = fonte;

    atualizarVisual();
    registrarComando(nomes[novo]);

    const emMovimento = [
      "frente", "tras", "esquerda", "direita"
    ].includes(novo);

    compartilharVelocidade(
      emMovimento ? velocidade : 0
    );
  }

  function centralizarJoystick() {
    handle.style.left = "50%";
    handle.style.top = "50%";
  }

  function pararTudo() {
    pointerAtivo = null;
    teclaAtiva = null;
    centralizarJoystick();
    definirMovimento("parar");
  }

  // VELOCIDADE

  velocidadeInput.addEventListener("input", () => {
    velocidade = Number(velocidadeInput.value);
    velocidadeValor.textContent = velocidade + "%";

    if (["frente", "tras", "esquerda", "direita"]
        .includes(movimento)) {
      compartilharVelocidade(velocidade);
    }
  });

  // JOYSTICK COM MOUSE E TOQUE

  function moverJoystick(evento) {
    if (pointerAtivo !== evento.pointerId) return;

    const rect = joystick.getBoundingClientRect();
    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;

    let dx = evento.clientX - centroX;
    let dy = evento.clientY - centroY;

    const limite = rect.width * 0.29;
    const distancia = Math.hypot(dx, dy);

    if (distancia > limite) {
      dx = dx / distancia * limite;
      dy = dy / distancia * limite;
    }

    handle.style.left = `calc(50% + ${dx}px)`;
    handle.style.top = `calc(50% + ${dy}px)`;

    const zonaMorta = limite * 0.22;

    if (Math.hypot(dx, dy) < zonaMorta) {
      if (fonteAtiva === "joystick") {
        definirMovimento("parar");
      }
      return;
    }

    const direcao =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0 ? "direita" : "esquerda"
        : dy > 0 ? "tras" : "frente";

    if (movimento !== direcao || fonteAtiva !== "joystick") {
      definirMovimento(direcao, "joystick");
    }
  }

  joystick.addEventListener("pointerdown", evento => {
    if (pointerAtivo !== null) return;

    pointerAtivo = evento.pointerId;
    joystick.setPointerCapture(evento.pointerId);
    moverJoystick(evento);
  });

  joystick.addEventListener("pointermove", moverJoystick);

  function soltarJoystick(evento) {
    if (pointerAtivo !== evento.pointerId) return;

    pointerAtivo = null;
    centralizarJoystick();

    if (fonteAtiva === "joystick") {
      definirMovimento("parar");
    }
  }

  joystick.addEventListener("pointerup", soltarJoystick);
  joystick.addEventListener("pointercancel", soltarJoystick);
  joystick.addEventListener("lostpointercapture", soltarJoystick);

  // BOTÕES DIRECIONAIS

  document.querySelectorAll(
    "[data-direcao]"
  ).forEach(botao => {
    let idPointer = null;

    botao.addEventListener("pointerdown", evento => {
      if (idPointer !== null) return;

      idPointer = evento.pointerId;
      botao.setPointerCapture(evento.pointerId);

      definirMovimento(
        botao.dataset.direcao,
        "botao"
      );
    });

    function soltar(evento) {
      if (idPointer !== evento.pointerId) return;

      idPointer = null;

      if (fonteAtiva === "botao") {
        definirMovimento("parar");
      }
    }

    botao.addEventListener("pointerup", soltar);
    botao.addEventListener("pointercancel", soltar);
    botao.addEventListener("lostpointercapture", soltar);
  });

  // TECLADO W/A/S/D E SETAS

  document.addEventListener("keydown", evento => {
    const elemento = document.activeElement;

    if (
      elemento &&
      ["INPUT", "TEXTAREA", "SELECT"].includes(elemento.tagName)
    ) {
      return;
    }

    const tecla = evento.key.toLowerCase();
    const direcao = teclas[tecla];

    if (!direcao) return;

    evento.preventDefault();

    if (teclaAtiva === tecla && evento.repeat) return;

    teclaAtiva = tecla;
    definirMovimento(direcao, "teclado");
  });

  document.addEventListener("keyup", evento => {
    const tecla = evento.key.toLowerCase();

    if (tecla !== teclaAtiva) return;

    teclaAtiva = null;

    if (fonteAtiva === "teclado") {
      definirMovimento("parar");
    }
  });

  // AÇÕES ESPECIAIS

  document.querySelectorAll(
    "[data-acao]"
  ).forEach(botao => {
    botao.addEventListener("click", () => {
      pararTudo();

      const acao = botao.dataset.acao;

      definirMovimento(acao, "acao");

      botao.classList.add("active");

      timerAcao = setTimeout(() => {
        botao.classList.remove("active");
        timerAcao = null;

        if (fonteAtiva === "acao") {
          definirMovimento("parar");
        }
      }, 2200);
    });
  });

  // PARADA

  $("pararMovimento").addEventListener(
    "click",
    pararTudo
  );

  $("paradaGeral").addEventListener(
    "click",
    pararTudo
  );

  // SEGURANÇA DA SIMULAÇÃO:
  // PARAR AO SAIR DA PÁGINA OU PERDER O FOCO

  window.addEventListener("blur", pararTudo);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pararTudo();
  });

  window.addEventListener("pagehide", pararTudo);

  // INICIALIZAÇÃO

  velocidadeValor.textContent = velocidade + "%";
  centralizarJoystick();
  atualizarVisual();

  // Não deixar movimento antigo ativo ao abrir a tela.
  compartilharVelocidade(0);

  console.log(
    "BIBOU OS — Controle Premium carregado!"
  );
});
