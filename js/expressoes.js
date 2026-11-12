
/* ==========================================
   BIBOU OS — OLHOS DIGITAIS
   Prévia SVG para futura integração ESP32
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = id => document.getElementById(id);
  const CHAVE = "bibou_os_olhos_v1";

  const svg = $("bibouEyes");
  const grupo = $("eyesGroup");
  const esquerdo = $("leftEye");
  const direito = $("rightEye");

  const nome = $("expressaoNome");
  const descricao = $("expressaoDescricao");
  const resumo = $("expressaoResumo");
  const animacoesInput = $("animacoesExpressao");

  const sidebar = $("sidebar");
  const menuToggle = $("menuToggle");
  const overlay = $("overlay");

  // Cada expressão possui dois caminhos vetoriais.
  // Coordenadas projetadas para 320 x 240.

  const expressoes = {
    feliz: {
      nome: "Feliz",
      descricao: "Olhinhos alegres e acolhedores.",
      olhos: [
        "M57 139 Q92 78 127 139 Q117 157 107 137 Q92 112 77 137 Q67 157 57 139 Z",
        "M193 139 Q228 78 263 139 Q253 157 243 137 Q228 112 213 137 Q203 157 193 139 Z"
      ]
    },

    triste: {
      nome: "Triste",
      descricao: "Um olhar delicado e um pouco caído.",
      olhos: [
        "M57 112 Q88 130 127 116 Q125 157 96 160 Q65 158 57 112 Z",
        "M193 116 Q232 130 263 112 Q255 158 224 160 Q195 157 193 116 Z"
      ]
    },

    surpreso: {
      nome: "Surpreso",
      descricao: "Olhos grandes e atentos ao inesperado.",
      olhos: [
        "M92 69 C66 69 62 100 62 122 C62 155 75 177 92 177 C109 177 122 155 122 122 C122 100 118 69 92 69 Z",
        "M228 69 C202 69 198 100 198 122 C198 155 211 177 228 177 C245 177 258 155 258 122 C258 100 254 69 228 69 Z"
      ]
    },

    calmo: {
      nome: "Calmo",
      descricao: "Olhos relaxados e tranquilos.",
      olhos: [
        "M56 126 Q92 145 128 126 Q120 151 92 152 Q64 151 56 126 Z",
        "M192 126 Q228 145 264 126 Q256 151 228 152 Q200 151 192 126 Z"
      ]
    },

    carinho: {
      nome: "Carinho",
      descricao: "Um olhar doce, suave e acolhedor.",
      olhos: [
        "M55 143 Q92 72 129 143 Q121 160 111 143 Q92 115 73 143 Q63 160 55 143 Z",
        "M191 143 Q228 72 265 143 Q257 160 247 143 Q228 115 209 143 Q199 160 191 143 Z"
      ]
    },

    sono: {
      nome: "Sono",
      descricao: "Olhos quase fechados, em descanso.",
      olhos: [
        "M56 132 Q92 141 128 132 Q124 147 92 149 Q60 147 56 132 Z",
        "M192 132 Q228 141 264 132 Q260 147 228 149 Q196 147 192 132 Z"
      ]
    },

    curioso: {
      nome: "Curioso",
      descricao: "Olhos atentos, procurando novidades.",
      olhos: [
        "M100 78 C79 78 72 99 72 122 C72 147 80 161 100 161 C120 161 128 147 128 122 C128 99 121 78 100 78 Z",
        "M232 91 C214 91 208 108 208 127 C208 146 214 158 232 158 C250 158 256 146 256 127 C256 108 250 91 232 91 Z"
      ]
    },

    animado: {
      nome: "Animado",
      descricao: "Olhos vibrantes e cheios de energia.",
      olhos: [
        "M92 70 L105 105 L138 119 L108 134 L92 173 L76 134 L46 119 L79 105 Z",
        "M228 70 L241 105 L274 119 L244 134 L228 173 L212 134 L182 119 L215 105 Z"
      ]
    }
  };

  let atual = "feliz";
  let olhar = "centro";
  let animacoes = true;
  let piscando = false;
  let timerPiscar = null;
  let timerFimPiscar = null;

  const movimentoReduzido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // MENU

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

  // ARMAZENAMENTO

  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));

      if (salvo && expressoes[salvo.expressao]) {
        atual = salvo.expressao;
      }

      if (["centro", "esquerda", "direita"].includes(salvo?.olhar)) {
        olhar = salvo.olhar;
      }

      if (typeof salvo?.animacoes === "boolean") {
        animacoes = salvo.animacoes;
      }
    } catch {
      // Usa os padrões.
    }

    const configuracoes =
      window.BibouPreferencias?.obterConfiguracoes?.();

    if (configuracoes?.animacoes === false || movimentoReduzido.matches) {
      animacoes = false;
    }
  }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({
        expressao: atual,
        olhar,
        animacoes
      }));
    } catch (erro) {
      console.warn("Não foi possível salvar os olhos:", erro);
    }
  }

  // DESENHO

  function atualizarTransformacao() {
    const deslocamento = {
      esquerda: -13,
      centro: 0,
      direita: 13
    }[olhar];

    // A piscada comprime verticalmente os olhos,
    // mantendo o centro da animação em Y = 120.
    const escala = piscando ? 0.08 : 1;

    grupo.setAttribute(
      "transform",
      `translate(${deslocamento} 120) scale(1 ${escala}) translate(0 -120)`
    );
  }

  function renderizar() {
    const dados = expressoes[atual];

    esquerdo.setAttribute("d", dados.olhos[0]);
    direito.setAttribute("d", dados.olhos[1]);

    nome.textContent = dados.nome;
    descricao.textContent = dados.descricao;
    resumo.textContent = dados.nome;

    svg.setAttribute(
      "aria-label",
      `Olhos do BIBOU: ${dados.nome}`
    );

    animacoesInput.checked = animacoes;

    document.querySelectorAll("[data-expressao]").forEach(botao => {
      const selecionado = botao.dataset.expressao === atual;
      botao.classList.toggle("ativo", selecionado);
      botao.setAttribute("aria-pressed", String(selecionado));
    });

    document.querySelectorAll("[data-olhar]").forEach(botao => {
      const selecionado = botao.dataset.olhar === olhar;
      botao.classList.toggle("ativo", selecionado);
      botao.setAttribute("aria-pressed", String(selecionado));
    });

    atualizarTransformacao();
  }

  // PISCADAS

  function cancelarPiscadas() {
    clearTimeout(timerPiscar);
    clearTimeout(timerFimPiscar);
    timerPiscar = null;
    timerFimPiscar = null;
    piscando = false;
    atualizarTransformacao();
  }

  function piscar() {
    if (piscando || document.hidden) return;

    piscando = true;
    atualizarTransformacao();

    clearTimeout(timerFimPiscar);

    timerFimPiscar = setTimeout(() => {
      piscando = false;
      atualizarTransformacao();
      timerFimPiscar = null;
    }, 160);
  }

  function agendarPiscada() {
    clearTimeout(timerPiscar);
    timerPiscar = null;

    if (!animacoes || movimentoReduzido.matches || document.hidden) {
      return;
    }

    const intervalo = 2600 + Math.random() * 2400;

    timerPiscar = setTimeout(() => {
      piscar();
      agendarPiscada();
    }, intervalo);
  }

  // ESCOLHER EXPRESSÃO

  document.querySelectorAll("[data-expressao]").forEach(botao => {
    botao.addEventListener("click", () => {
      atual = botao.dataset.expressao;
      renderizar();
      salvar();
    });
  });

  // DIREÇÃO DO OLHAR

  document.querySelectorAll("[data-olhar]").forEach(botao => {
    botao.addEventListener("click", () => {
      olhar = botao.dataset.olhar;
      renderizar();
      salvar();
    });
  });

  // PISCAR MANUALMENTE

  $("piscarAgora").addEventListener("click", piscar);

  // ANIMAÇÕES AUTOMÁTICAS

  animacoesInput.addEventListener("change", () => {
    animacoes = animacoesInput.checked && !movimentoReduzido.matches;
    renderizar();
    salvar();

    if (animacoes) {
      agendarPiscada();
    } else {
      cancelarPiscadas();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelarPiscadas();
    } else {
      agendarPiscada();
    }
  });

  // SINCRONIZAÇÃO COM PREFERÊNCIAS GERAIS

  window.addEventListener("bibou:preferencias", () => {
    const configuracoes =
      window.BibouPreferencias?.obterConfiguracoes?.();

    if (configuracoes?.animacoes === false) {
      animacoes = false;
      cancelarPiscadas();
      renderizar();
      salvar();
    }
  });

  // INTERFACE FUTURA PARA O ESP32
  // Retorna dados estruturados, sem enviar comandos.

  window.BibouOlhos = {
    obterEstado() {
      return {
        expressao: atual,
        olhar,
        animacoes
      };
    },

    selecionar(expressao) {
      if (!expressoes[expressao]) return false;

      atual = expressao;
      renderizar();
      salvar();
      return true;
    },

    olharPara(direcao) {
      if (!["esquerda", "centro", "direita"].includes(direcao)) {
        return false;
      }

      olhar = direcao;
      renderizar();
      salvar();
      return true;
    }
  };

  // INICIALIZAÇÃO

  carregar();
  renderizar();
  agendarPiscada();

  console.log("BIBOU OS — Olhos digitais iniciados!");
});
