
/* ==========================================
   BIBOU OS — CONVERSAR PREMIUM
   Chat demonstrativo
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const CHAVE = "bibou_os_chat_premium_v1";
  const LIMITE = 60;

  const $ = id => document.getElementById(id);

  const mensagens = $("mensagens");
  const formulario = $("formConversa");
  const entrada = $("entradaMensagem");
  const enviar = $("enviarMensagem");
  const limpar = $("limparConversa");
  const sidebar = $("sidebar");
  const menuToggle = $("menuToggle");
  const overlay = $("overlay");

  let historico = [];
  let respondendo = false;
  let timerResposta = null;

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

  // PREFERÊNCIAS

  function preferencias() {
    if (!window.BibouPreferencias) {
      return {
        usuario: { nome: "", personalidade: "carinhoso" },
        robo: { nome: "BIBOU" }
      };
    }

    return window.BibouPreferencias.obterTudo();
  }

  function personalidadeAtual() {
    return preferencias().usuario.personalidade;
  }

  function nomeRobo() {
    return preferencias().robo.nome || "BIBOU";
  }

  // HISTÓRICO

  function carregarHistorico() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE));

      if (!Array.isArray(dados)) return [];

      return dados.filter(item =>
        item &&
        (item.autor === "user" || item.autor === "bot") &&
        typeof item.texto === "string" &&
        typeof item.hora === "string"
      ).slice(-LIMITE);
    } catch {
      return [];
    }
  }

  function salvarHistorico() {
    try {
      localStorage.setItem(
        CHAVE,
        JSON.stringify(historico.slice(-LIMITE))
      );
    } catch (erro) {
      console.warn("Não foi possível salvar o chat:", erro);
    }
  }

  function formatarHora(data = new Date()) {
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  // INTERFACE

  function rolarParaFim() {
    mensagens.scrollTop = mensagens.scrollHeight;
  }

  function criarMensagem(autor, texto, hora) {
    const linha = document.createElement("div");
    linha.className = `chat-message ${autor}`;

    if (autor === "bot") {
      const avatar = document.createElement("div");
      avatar.className = "message-avatar";
      avatar.textContent = "b.";
      linha.appendChild(avatar);
    }

    const conteudo = document.createElement("div");
    conteudo.className = "message-content";

    const balao = document.createElement("div");
    balao.className = "message-bubble";
    balao.textContent = texto;

    const horario = document.createElement("time");
    horario.className = "message-time";
    horario.textContent = hora;

    conteudo.appendChild(balao);
    conteudo.appendChild(horario);
    linha.appendChild(conteudo);

    mensagens.appendChild(linha);
    rolarParaFim();
  }

  function mostrarBoasVindas() {
    const usuario = preferencias().usuario.nome;
    const nome = nomeRobo();

    const bloco = document.createElement("div");
    bloco.className = "chat-welcome";

    const icone = document.createElement("div");
    icone.className = "chat-welcome-icon";
    icone.textContent = "b.";

    const titulo = document.createElement("h3");
    titulo.textContent = `Converse com ${nome}`;

    const descricao = document.createElement("p");
    descricao.textContent = usuario
      ? `Olá, ${usuario}! Estou aqui para conversar com você.`
      : "Estou aqui para conversar com você.";

    bloco.append(icone, titulo, descricao);
    mensagens.appendChild(bloco);
  }

  function renderizarHistorico() {
    mensagens.replaceChildren();

    if (historico.length === 0) {
      mostrarBoasVindas();
    } else {
      historico.forEach(item => {
        criarMensagem(item.autor, item.texto, item.hora);
      });
    }

    rolarParaFim();
  }

  function adicionarMensagem(autor, texto) {
    const item = {
      autor,
      texto,
      hora: formatarHora()
    };

    if (historico.length === 0) {
      mensagens.replaceChildren();
    }

    historico.push(item);
    historico = historico.slice(-LIMITE);

    salvarHistorico();
    criarMensagem(autor, texto, item.hora);
  }

  function mostrarDigitando() {
    const linha = document.createElement("div");
    linha.className = "chat-message bot";
    linha.id = "digitando";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "b.";

    const conteudo = document.createElement("div");
    conteudo.className = "message-bubble";

    const pontos = document.createElement("div");
    pontos.className = "typing-dots";

    for (let i = 0; i < 3; i++) {
      pontos.appendChild(document.createElement("span"));
    }

    conteudo.appendChild(pontos);
    linha.append(avatar, conteudo);
    mensagens.appendChild(linha);

    rolarParaFim();
  }

  function esconderDigitando() {
    $("digitando")?.remove();
  }

  // RESPOSTAS DEMONSTRATIVAS

  function normalizarTexto(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[!?.,]/g, "")
      .trim();
  }

  function escolherResposta(opcoes) {
    return opcoes[Math.floor(Math.random() * opcoes.length)];
  }

  const falas = {
    carinhoso: {
      oi: [
        "Oi! Que bom conversar com você. 💜",
        "Olá! Estava pronto para uma boa conversa!"
      ],
      humor: [
        "Estou muito bem! E você, como está se sentindo hoje?",
        "Estou feliz por estar aqui conversando com você!"
      ],
      geral: [
        "Adorei saber disso! Me conta um pouquinho mais.",
        "Estou acompanhando! O que mais você gostaria de conversar?",
        "Que interessante! Quero ouvir mais."
      ]
    },

    divertido: {
      oi: [
        "Opa! Cheguei para animar o dia! ✨",
        "Eba! Uma nova conversa começou!"
      ],
      humor: [
        "Funcionando com 100% de vontade de conversar!",
        "Muito bem! E preparado para uma boa diversão!"
      ],
      geral: [
        "Essa conversa está ficando interessante!",
        "Gostei! Qual vai ser o próximo assunto?",
        "Opa, essa eu não esperava! Me conta mais."
      ]
    },

    curioso: {
      oi: [
        "Olá! O que vamos descobrir hoje?",
        "Oi! Estou cheio de curiosidade!"
      ],
      humor: [
        "Estou ótimo! Qual é a novidade de hoje?",
        "Tudo bem! Tem alguma coisa nova para me contar?"
      ],
      geral: [
        "Interessante! Como você chegou a essa ideia?",
        "Gostaria de saber mais sobre isso!",
        "O que você acha que acontece depois?"
      ]
    },

    tranquilo: {
      oi: [
        "Olá. É bom ter um momento para conversar.",
        "Oi! Podemos conversar com calma."
      ],
      humor: [
        "Estou bem, obrigado por perguntar. E você?",
        "Tudo tranquilo por aqui."
      ],
      geral: [
        "Entendi. Pode continuar, estou acompanhando.",
        "Faz sentido. Gostaria de falar mais sobre isso?",
        "Vamos conversar sobre isso com calma."
      ]
    }
  };

  function gerarResposta(mensagem) {
    const texto = normalizarTexto(mensagem);
    const personalidade = personalidadeAtual();
    const estilo = falas[personalidade] || falas.carinhoso;
    const nome = nomeRobo();

    if (/^(oi|ola|e ai|opa|bom dia|boa tarde|boa noite)\b/.test(texto)) {
      return escolherResposta(estilo.oi);
    }

    if (
      texto.includes("como voce esta") ||
      texto.includes("tudo bem")
    ) {
      return escolherResposta(estilo.humor);
    }

    if (
      texto.includes("seu nome") ||
      texto.includes("quem e voce")
    ) {
      return `Meu nome é ${nome}! Sou seu companheiro virtual no BIBOU OS.`;
    }

    if (
      texto.includes("o que voce faz") ||
      texto.includes("o que voce sabe fazer") ||
      texto.includes("suas funcoes")
    ) {
      return "Nesta demonstração, posso conversar com respostas prontas. O BIBOU também tem telas para movimentos, expressões, memória, sensores e energia. A integração real virá depois!";
    }

    if (
      texto.includes("dancar") ||
      texto.includes("danca")
    ) {
      return "Eu adoro a ideia de dançar! Você pode experimentar meus movimentos na tela Controle. Por enquanto, tudo é virtual.";
    }

    if (
      texto.includes("bateria") ||
      texto.includes("carregar")
    ) {
      const estado = window.BibouEstado?.obter();

      return estado
        ? `Minha bateria demonstrativa está em ${estado.bateria}%. Você pode acompanhar a simulação em Sensores e Energia.`
        : "Você pode acompanhar minha bateria virtual na tela Sensores e Energia.";
    }

    if (
      texto.includes("personalidade")
    ) {
      const nomes = {
        carinhoso: "Carinhoso",
        divertido: "Divertido",
        curioso: "Curioso",
        tranquilo: "Tranquilo"
      };

      return `Minha personalidade atual é ${nomes[personalidade] || "Carinhoso"}. Você pode alterá-la na tela Memória.`;
    }

    if (
      texto.includes("obrigad") ||
      texto.includes("valeu")
    ) {
      return "Por nada! Foi bom ajudar. 💜";
    }

    if (
      texto.includes("tchau") ||
      texto.includes("ate logo")
    ) {
      return "Até logo! Tenha um ótimo dia!";
    }

    return escolherResposta(estilo.geral);
  }

  // ENVIO DE MENSAGENS

  function ajustarAltura() {
    entrada.style.height = "auto";
    entrada.style.height =
      Math.min(entrada.scrollHeight, 130) + "px";
  }

  function enviarTexto(texto) {
    const mensagem = texto.trim();

    if (!mensagem || respondendo) return;

    adicionarMensagem("user", mensagem);

    entrada.value = "";
    ajustarAltura();

    respondendo = true;
    enviar.disabled = true;
    mostrarDigitando();

    timerResposta = setTimeout(() => {
      timerResposta = null;
      esconderDigitando();

      const resposta = gerarResposta(mensagem);

      adicionarMensagem("bot", resposta);

      respondendo = false;
      enviar.disabled = false;
      entrada.focus();
    }, 700);
  }

  formulario.addEventListener("submit", evento => {
    evento.preventDefault();
    enviarTexto(entrada.value);
  });

  entrada.addEventListener("keydown", evento => {
    if (
      evento.key === "Enter" &&
      !evento.shiftKey &&
      !evento.isComposing
    ) {
      evento.preventDefault();
      enviarTexto(entrada.value);
    }
  });

  entrada.addEventListener("input", ajustarAltura);

  document.querySelectorAll(
    "[data-mensagem]"
  ).forEach(botao => {
    botao.addEventListener("click", () => {
      enviarTexto(botao.dataset.mensagem);
    });
  });

  // LIMPAR CONVERSA

  limpar.addEventListener("click", () => {
    const confirmar = window.confirm(
      "Deseja apagar o histórico demonstrativo desta conversa?"
    );

    if (!confirmar) return;

    if (timerResposta !== null) {
      clearTimeout(timerResposta);
      timerResposta = null;
    }

    respondendo = false;
    enviar.disabled = false;

    historico = [];
    salvarHistorico();
    renderizarHistorico();
    entrada.focus();
  });

  // ATUALIZAR PREFERÊNCIAS

  window.addEventListener("bibou:preferencias", () => {
    if (historico.length === 0) {
      renderizarHistorico();
    }
  });

  // INICIAR

  historico = carregarHistorico();
  renderizarHistorico();
  ajustarAltura();

  console.log("BIBOU OS — Conversar Premium carregado!");
});
