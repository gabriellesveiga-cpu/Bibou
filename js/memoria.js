
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const sidebar = $("sidebar");
  const menuToggle = $("menuToggle");
  const overlay = $("overlay");
  const toast = $("toast");

  const CHAVE = "bibou_os_memoria_v1";
  let timerToast;

  const padrao = () => ({
    personalidade: "carinhoso",
    nome: "",
    cor: "Roxo",
    interesses: "",
    estilo: "fofo",
    memorias: []
  });

  // CARREGAR DADOS LOCAIS
  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));

      if (!salvo || typeof salvo !== "object" ||
          Array.isArray(salvo)) {
        return padrao();
      }

      const dados = { ...padrao(), ...salvo };

      if (!Array.isArray(dados.memorias)) {
        dados.memorias = [];
      }

      return dados;
    } catch {
      return padrao();
    }
  }

  let dados = carregar();

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(dados));
      return true;
    } catch {
      notificar("Não foi possível salvar neste navegador.");
      return false;
    }
  }

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
  function notificar(mensagem) {
    clearTimeout(timerToast);
    toast.textContent = mensagem;
    toast.classList.add("visivel");

    timerToast = setTimeout(() => {
      toast.classList.remove("visivel");
    }, 3200);
  }

  // PERSONALIDADES
  const personalidades = {
    carinhoso: {
      nome: "Carinhoso",
      frase: "Oii! 💜 Adoro estar por aqui!"
    },
    divertido: {
      nome: "Divertido",
      frase: "Ebaaa! 🎉 Vamos inventar uma brincadeira?"
    },
    curioso: {
      nome: "Curioso",
      frase: "Hmm... 🔎 O que vamos descobrir hoje?"
    },
    tranquilo: {
      nome: "Tranquilo",
      frase: "Olá! 🌙 Vamos aproveitar um momento calmo."
    }
  };

  function atualizarPersonalidade() {
    if (!personalidades[dados.personalidade]) {
      dados.personalidade = "carinhoso";
    }

    const atual = personalidades[dados.personalidade];

    $("personalidadeAtual").textContent = atual.nome;
    $("resumoPersonalidade").textContent = atual.nome;

    const nome = dados.nome.trim();
    const cumprimento = nome ? `${nome}, ` : "";

    $("falaBibou").textContent =
      cumprimento + atual.frase;

    document.querySelectorAll(
      "[data-personality]"
    ).forEach(botao => {
      const selecionado =
        botao.dataset.personality === dados.personalidade;

      botao.classList.toggle("selecionada", selecionado);
      botao.setAttribute(
        "aria-pressed",
        String(selecionado)
      );
    });
  }

  document.querySelectorAll(
    "[data-personality]"
  ).forEach(botao => {
    botao.addEventListener("click", () => {
      dados.personalidade = botao.dataset.personality;
      atualizarPersonalidade();

      if (salvar()) {
        notificar("💜 Personalidade demonstrativa salva!");
      }
    });
  });

  // PREFERÊNCIAS
  const estilos = {
    fofo: "Fofo e amigável",
    animado: "Animado e divertido",
    objetivo: "Simples e objetivo",
    calmo: "Calmo e gentil"
  };

  const cores = [
    "Roxo", "Rosa", "Azul",
    "Verde", "Amarelo", "Vermelho"
  ];

  function atualizarResumo() {
    $("resumoNome").textContent =
      dados.nome || "Não informado";

    $("resumoCor").textContent = dados.cor;

    $("resumoInteresses").textContent =
      dados.interesses || "Não informado";

    $("resumoEstilo").textContent =
      estilos[dados.estilo] || estilos.fofo;

    $("resumoMemorias").textContent =
      dados.memorias.length;

    atualizarPersonalidade();
  }

  function preencherFormulario() {
    $("nomeUsuario").value = dados.nome;
    $("corFavorita").value =
      cores.includes(dados.cor) ? dados.cor : "Roxo";
    $("interesses").value = dados.interesses;
    $("estiloComunicacao").value =
      estilos[dados.estilo] ? dados.estilo : "fofo";
  }

  $("formPreferencias").addEventListener(
    "submit", evento => {
      evento.preventDefault();

      dados.nome = $("nomeUsuario").value.trim();
      dados.cor = $("corFavorita").value;
      dados.interesses = $("interesses").value.trim();
      dados.estilo = $("estiloComunicacao").value;

      atualizarResumo();

      if (salvar()) {
        notificar("✨ Preferências salvas com sucesso!");
      }
    }
  );

  // MEMÓRIAS
  function criarId() {
    if (window.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return Date.now().toString(36) +
      Math.random().toString(36).slice(2);
  }

  function renderizarMemorias() {
    const lista = $("listaMemorias");
    lista.replaceChildren();

    const quantidade = dados.memorias.length;

    $("contadorMemorias").textContent =
      quantidade === 1
        ? "1 lembrança"
        : `${quantidade} lembranças`;

    $("resumoMemorias").textContent = quantidade;

    if (quantidade === 0) {
      const vazio = document.createElement("div");
      vazio.className = "mem-vazio";
      vazio.textContent =
        "✨ Ainda não existem lembranças.";
      lista.appendChild(vazio);
      return;
    }

    dados.memorias.forEach(memoria => {
      const item = document.createElement("div");
      item.className = "mem-lembranca";

      const icone = document.createElement("span");
      icone.className = "mem-lembranca-icone";
      icone.textContent = "💜";

      const info = document.createElement("div");
      info.className = "mem-lembranca-info";

      const titulo = document.createElement("strong");
      titulo.textContent = memoria.titulo;

      const texto = document.createElement("p");
      texto.textContent = memoria.texto;

      const data = document.createElement("small");
      data.textContent = memoria.data;

      info.append(titulo, texto, data);

      const excluir = document.createElement("button");
      excluir.type = "button";
      excluir.className = "mem-excluir";
      excluir.textContent = "×";
      excluir.title = "Excluir lembrança";
      excluir.setAttribute(
        "aria-label",
        `Excluir lembrança ${memoria.titulo}`
      );

      excluir.addEventListener("click", () => {
        const confirmar = confirm(
          `Excluir a lembrança "${memoria.titulo}"?`
        );

        if (!confirmar) return;

        dados.memorias = dados.memorias.filter(
          item => item.id !== memoria.id
        );

        salvar();
        renderizarMemorias();
        notificar("Lembrança excluída.");
      });

      item.append(icone, info, excluir);
      lista.appendChild(item);
    });
  }

  $("formMemoria").addEventListener("submit", evento => {
    evento.preventDefault();

    const titulo = $("tituloMemoria").value.trim();
    const texto = $("textoMemoria").value.trim();

    if (!titulo || !texto) return;

    if (dados.memorias.length >= 30) {
      notificar("Limite demonstrativo de 30 lembranças.");
      return;
    }

    const memoria = {
      id: criarId(),
      titulo,
      texto,
      data: new Date().toLocaleDateString("pt-BR")
    };

    dados.memorias.unshift(memoria);

    if (salvar()) {
      $("formMemoria").reset();
      renderizarMemorias();
      notificar("💜 Nova lembrança guardada!");
    } else {
      dados.memorias.shift();
    }
  });

  // RESTAURAR DADOS
  $("restaurarDados").addEventListener("click", () => {
    const confirmar = confirm(
      "Restaurar as configurações iniciais? " +
      "Todas as lembranças locais serão excluídas."
    );

    if (!confirmar) return;

    try {
      localStorage.removeItem(CHAVE);
      dados = padrao();

      preencherFormulario();
      atualizarResumo();
      renderizarMemorias();

      notificar("✨ Dados demonstrativos restaurados!");
    } catch {
      notificar("Não foi possível restaurar os dados.");
    }
  });

  // TELAS FUTURAS
  document.querySelectorAll("[data-page]").forEach(
    botao => {
      botao.addEventListener("click", () => {


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
    }
  );

  // INICIALIZAÇÃO
  preencherFormulario();
  atualizarResumo();
  renderizarMemorias();

  console.log(
    "BIBOU OS - Memória demonstrativa iniciada!"
  );
});

