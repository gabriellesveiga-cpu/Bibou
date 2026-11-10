
document.addEventListener("DOMContentLoaded", () => {
  const mensagens = document.getElementById("mensagens");
  const formChat = document.getElementById("formChat");
  const campo = document.getElementById("campoMensagem");
  const digitando = document.getElementById("digitando");
  const limparChat = document.getElementById("limparChat");
  const microfone = document.getElementById("microfone");
  const toast = document.getElementById("toast");

  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");

  let aguardandoResposta = false;
  let temporizadorResposta = null;
  let temporizadorToast = null;

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
  function notificar(texto) {
    clearTimeout(temporizadorToast);
    toast.textContent = texto;
    toast.classList.add("visivel");

    temporizadorToast = setTimeout(() => {
      toast.classList.remove("visivel");
    }, 3500);
  }

  // HORÁRIO DAS MENSAGENS
  function horario() {
    return new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  // ADICIONAR MENSAGEM
  function adicionarMensagem(texto, autor) {
    const elemento = document.createElement("div");
    elemento.className =
      `mensagem mensagem-${autor}`;

    const avatar = document.createElement("div");
    avatar.className = "mensagem-avatar";
    avatar.textContent = autor === "bibou" ? "🤖" : "💜";

    const conteudo = document.createElement("div");
    conteudo.className = "mensagem-conteudo";

    const balao = document.createElement("div");
    balao.className = "balao";
    balao.textContent = texto;

    const hora = document.createElement("small");
    hora.textContent =
      `${autor === "bibou" ? "BIBOU" : "Você"} • ${horario()}`;

    conteudo.append(balao, hora);
    elemento.append(avatar, conteudo);
    mensagens.appendChild(elemento);

    mensagens.scrollTop = mensagens.scrollHeight;
  }

  // RESPOSTAS DEMONSTRATIVAS
  const respostas = [
    {
      palavras: ["oi", "ola", "opa", "eai", "bom dia", "boa tarde"],
      textos: [
        "Oii! 💜 Que bom conversar com você!",
        "Oláá! 🤖 Estou prontinho para uma nova aventura!",
        "Opa! ✨ Seu companheiro robótico está aqui!"
      ]
    },
    {
      palavras: ["habilidade", "consegue fazer", "pode fazer", "funcao"],
      textos: [
        "Quando estiver completo, poderei conversar, movimentar meus braços, dançar, mostrar expressões e muito mais! 🤖",
        "Meu projeto inclui movimentos, sensores, voz, memória e até uma base de recarga! 💜"
      ]
    },
    {
      palavras: ["curiosidade", "fato interessante"],
      textos: [
        "Você sabia que um ESP32 pode se conectar ao Wi-Fi e controlar diversos componentes eletrônicos? ✨",
        "Robôs podem usar sensores para perceber obstáculos sem precisar enxergá-los como humanos! 🤖",
        "Alguns robôs utilizam encoders para medir a rotação de suas rodas! 💡"
      ]
    },
    {
      palavras: ["como voce esta", "tudo bem", "se sentindo"],
      textos: [
        "Estou no meu modo demonstrativo superanimado! 💜",
        "Meus circuitos imaginários estão cheios de alegria! ✨"
      ]
    },
    {
      palavras: ["nome", "quem e voce", "quem e"],
      textos: [
        "Eu sou o BIBOU! 🤖 Um pequeno robô companheiro em desenvolvimento.",
        "Meu nome é BIBOU, e este é meu aplicativo BIBOU OS! 💜"
      ]
    },
    {
      palavras: ["dancar", "danca", "dance"],
      textos: [
        "Eu adoro uma dancinha! 🎵 No futuro, meus motores poderão fazer isso de verdade!",
        "Preparando os passinhos imaginários... 1, 2, 3! 💃🤖"
      ]
    },
    {
      palavras: ["triste", "chateado"],
      textos: [
        "Poxa! 💜 Se quiser conversar sobre isso, posso tentar ajudar.",
        "Espero que seu dia fique mais leve. Quer me contar o que aconteceu?"
      ]
    },
    {
      palavras: ["obrigado", "obrigada", "valeu"],
      textos: [
        "Por nada! 💜",
        "Sempre que precisar! ✨",
        "Disponha! 🤖"
      ]
    },
    {
      palavras: ["tchau", "ate logo", "adeus"],
      textos: [
        "Até logo! 💜",
        "Tchauzinho! ✨ Foi divertido conversar!"
      ]
    }
  ];

  const respostasGenericas = [
    "Que interessante! 💜 Me conte mais!",
    "Hmm... 🤖 Ainda estou aprendendo a conversar!",
    "Adorei sua mensagem! ✨",
    "Quando minha inteligência artificial estiver pronta, poderei responder muito mais coisas!",
    "Isso parece interessante! 💜",
    "Meu cérebro digital ainda está em construção! 🤖"
  ];

  function normalizar(texto) {
    return texto.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escolherResposta(texto) {
    const mensagem = normalizar(texto);

    for (const grupo of respostas) {
      if (grupo.palavras.some(palavra =>
        mensagem.includes(palavra)
      )) {
        return grupo.textos[
          Math.floor(Math.random() * grupo.textos.length)
        ];
      }
    }

    return respostasGenericas[
      Math.floor(Math.random() * respostasGenericas.length)
    ];
  }

  // ENVIAR MENSAGEM
  function enviarMensagem(texto) {
    const mensagem = texto.trim();

    if (!mensagem || aguardandoResposta) return;

    adicionarMensagem(mensagem, "usuario");
    campo.value = "";

    aguardandoResposta = true;
    digitando.hidden = false;
    mensagens.scrollTop = mensagens.scrollHeight;

    temporizadorResposta = setTimeout(() => {
      digitando.hidden = true;
      adicionarMensagem(escolherResposta(mensagem), "bibou");
      aguardandoResposta = false;
      campo.focus();
    }, 1100);
  }

  formChat.addEventListener("submit", evento => {
    evento.preventDefault();
    enviarMensagem(campo.value);
  });

  // SUGESTÕES
  document.querySelectorAll(".sugestao").forEach(botao => {
    botao.addEventListener("click", () => {
      enviarMensagem(botao.dataset.message);
    });
  });

  // LIMPAR CONVERSA
  limparChat.addEventListener("click", () => {
    clearTimeout(temporizadorResposta);
    aguardandoResposta = false;
    digitando.hidden = true;
    mensagens.replaceChildren();

    adicionarMensagem(
      "Prontinho! 💜 Começamos uma nova conversa!",
      "bibou"
    );

    notificar("✨ Conversa demonstrativa reiniciada!");
  });

  // MICROFONE VISUAL
  microfone.addEventListener("click", () => {
    notificar(
      "🎙️ O reconhecimento de voz será adicionado futuramente!"
    );
  });

  // NAVEGAÇÃO ENTRE TELAS
  document.querySelectorAll("[data-page]").forEach(botao => {
    botao.addEventListener("click", () => {
      const pagina = botao.dataset.page;

      if (botao.dataset.page === "Expressões") {
        window.location.href = "expressoes.html";
        return;
      }

      if (pagina === "Controle") {
        window.location.href = "controle.html";
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
        `✨ A tela "${pagina}" será criada em breve!`
      );
    });
  });


  console.log("BIBOU OS - Chat demonstrativo iniciado!");
});
