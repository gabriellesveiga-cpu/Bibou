
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const robo = $("roboExpressao");
  const nomeAtual = $("nomeAtual");
  const emojiAtual = $("emojiAtual");
  const descricaoAtual = $("descricaoAtual");
  const historico = $("historicoExpressoes");

  const piscarAuto = $("piscarAuto");
  const movimentoSuave = $("movimentoSuave");
  const velocidade = $("velocidadeAnimacao");
  const velocidadeTexto = $("velocidadeTexto");

  const demonstrarTodas = $("demonstrarTodas");
  const pararDemonstracao = $("pararDemonstracao");

  const sidebar = $("sidebar");
  const menuToggle = $("menuToggle");
  const overlay = $("overlay");
  const toast = $("toast");

  let timerDemo = null;
  let timerToast = null;
  let expressaoAtual = "feliz";

  // BIBLIOTECA DE EXPRESSÕES
  const expressoes = {
    feliz: {
      nome: "Feliz",
      emoji: "🥰",
      descricao: "BIBOU está muito contente!"
    },
    triste: {
      nome: "Triste",
      emoji: "🥺",
      descricao: "BIBOU está um pouquinho desanimado."
    },
    surpreso: {
      nome: "Surpreso",
      emoji: "😮",
      descricao: "Uau! BIBOU ficou impressionado!"
    },
    bravo: {
      nome: "Bravo",
      emoji: "😠",
      descricao: "BIBOU está fazendo uma carinha brava!"
    },
    sonolento: {
      nome: "Sonolento",
      emoji: "😴",
      descricao: "BIBOU está quase dormindo..."
    },
    apaixonado: {
      nome: "Encantado",
      emoji: "😍",
      descricao: "Os olhinhos viraram corações!"
    },
    curioso: {
      nome: "Curioso",
      emoji: "🤔",
      descricao: "BIBOU quer descobrir algo novo!"
    },
    neutro: {
      nome: "Neutro",
      emoji: "😐",
      descricao: "BIBOU está tranquilo e relaxado."
    }
  };

  const ordem = Object.keys(expressoes);

  // MENU MOBILE
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
  function notificar(texto) {
    clearTimeout(timerToast);
    toast.textContent = texto;
    toast.classList.add("visivel");

    timerToast = setTimeout(() => {
      toast.classList.remove("visivel");
    }, 3000);
  }

  // HISTÓRICO
  function registrarExpressao(expressao) {
    const dados = expressoes[expressao];
    const vazio = historico.querySelector(".exp-empty");
    if (vazio) vazio.remove();

    const item = document.createElement("div");
    item.className = "exp-history-item";

    const emoji = document.createElement("span");
    emoji.textContent = dados.emoji;

    const info = document.createElement("div");

    const nome = document.createElement("strong");
    nome.textContent = dados.nome;

    const detalhe = document.createElement("small");
    detalhe.textContent = "Expressão demonstrativa";

    info.append(nome, detalhe);

    const hora = document.createElement("span");
    hora.className = "exp-time";
    hora.textContent = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    item.append(emoji, info, hora);
    historico.prepend(item);

    while (historico.children.length > 6) {
      historico.lastElementChild.remove();
    }
  }

  // SELECIONAR EXPRESSÃO
  function selecionarExpressao(chave, registrar = true) {
    const dados = expressoes[chave];
    if (!dados) return;

    expressaoAtual = chave;

    robo.dataset.emotion = chave;
    robo.setAttribute(
      "aria-label",
      `BIBOU com expressão ${dados.nome}`
    );

    nomeAtual.textContent = dados.nome;
    emojiAtual.textContent = dados.emoji;
    descricaoAtual.textContent = dados.descricao;

    document.querySelectorAll(".exp-option").forEach(botao => {
      const ativo = botao.dataset.emotion === chave;
      botao.classList.toggle("selecionada", ativo);
      botao.setAttribute("aria-pressed", String(ativo));
    });

    if (registrar) registrarExpressao(chave);
  }

  // PARAR DEMONSTRAÇÃO AUTOMÁTICA
  function pararSequencia() {
    clearInterval(timerDemo);
    timerDemo = null;
    demonstrarTodas.disabled = false;
    pararDemonstracao.disabled = true;
  }

  // BOTÕES DE EMOÇÕES
  document.querySelectorAll(".exp-option").forEach(botao => {
    botao.addEventListener("click", () => {
      pararSequencia();
      selecionarExpressao(botao.dataset.emotion);
    });
  });

  // PRÓXIMA EXPRESSÃO
  $("proximaExpressao").addEventListener("click", () => {
    pararSequencia();

    const indice = ordem.indexOf(expressaoAtual);
    const proximo = ordem[(indice + 1) % ordem.length];

    selecionarExpressao(proximo);
  });

  // REINICIAR
  $("reiniciarExpressao").addEventListener("click", () => {
    pararSequencia();
    selecionarExpressao("feliz");
    notificar("💜 BIBOU voltou à expressão feliz!");
  });

  // CONFIGURAÇÕES
  piscarAuto.addEventListener("change", () => {
    robo.classList.toggle("sem-piscar", !piscarAuto.checked);
  });

  movimentoSuave.addEventListener("change", () => {
    robo.classList.toggle("sem-flutuar", !movimentoSuave.checked);
  });

  const velocidades = {
    1: { nome: "Lenta", fator: 0.65 },
    2: { nome: "Normal", fator: 1 },
    3: { nome: "Rápida", fator: 1.7 }
  };

  velocidade.addEventListener("input", () => {
    const selecionada = velocidades[velocidade.value];

    velocidadeTexto.textContent = selecionada.nome;
    robo.style.setProperty("--anim-speed", selecionada.fator);
  });

  // DEMONSTRAR TODAS AS EXPRESSÕES
  demonstrarTodas.addEventListener("click", () => {
    pararSequencia();

    let indice = 0;

    demonstrarTodas.disabled = true;
    pararDemonstracao.disabled = false;

    selecionarExpressao(ordem[indice]);
    notificar("✨ Apresentando as expressões do BIBOU!");

    timerDemo = setInterval(() => {
      indice++;

      if (indice >= ordem.length) {
        pararSequencia();
        notificar("💜 Demonstração concluída!");
        return;
      }

      selecionarExpressao(ordem[indice]);
    }, 1800);
  });

  pararDemonstracao.addEventListener("click", () => {
    pararSequencia();
    notificar("■ Demonstração interrompida.");
  });

  // TELAS AINDA NÃO CRIADAS
  document.querySelectorAll("[data-page]").forEach(botao => {
    botao.addEventListener("click", () => {


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


      fecharMenu();
      notificar(
        `✨ A tela "${botao.dataset.page}" será criada em breve!`
      );
    });
  });

  // PARA ANIMAÇÃO AUTOMÁTICA AO SAIR DA PÁGINA
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pararSequencia();
  });

  console.log("BIBOU OS - Expressões demonstrativas iniciadas!");
});
