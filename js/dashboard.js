
document.addEventListener("DOMContentLoaded", () => {

  // ELEMENTOS DA INTERFACE
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  const overlay = document.getElementById("overlay");
  const toast = document.getElementById("toast");
  const robo = document.querySelector(".robo");

  const estadoRobo = document.getElementById("estadoRobo");
  const descricaoEstado = document.getElementById("descricaoEstado");
  const humorRobo = document.getElementById("humorRobo");
  const descricaoHumor = document.getElementById("descricaoHumor");
  const listaAtividades = document.getElementById("listaAtividades");

  let temporizadorToast;
  let temporizadorDanca;

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

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      fecharMenu();
    }
  });

  // NOTIFICAÇÕES
  function notificar(mensagem) {
    clearTimeout(temporizadorToast);

    toast.textContent = mensagem;
    toast.classList.add("visivel");

    temporizadorToast = setTimeout(() => {
      toast.classList.remove("visivel");
    }, 3500);
  }

  // HISTÓRICO DEMONSTRATIVO
  function registrarAtividade(titulo, descricao, icone) {
    const item = document.createElement("div");
    item.className = "atividade-item";

    const simbolo = document.createElement("span");
    simbolo.className = "atividade-icone";
    simbolo.textContent = icone;

    const informacoes = document.createElement("div");

    const nome = document.createElement("strong");
    nome.textContent = titulo;

    const detalhe = document.createElement("small");
    detalhe.textContent = descricao;

    informacoes.append(nome, detalhe);

    const hora = document.createElement("span");
    hora.className = "hora";
    hora.textContent = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    item.append(simbolo, informacoes, hora);
    listaAtividades.prepend(item);

    // Mantém no máximo 5 atividades
    while (listaAtividades.children.length > 5) {
      listaAtividades.lastElementChild.remove();
    }
  }

  // CUMPRIMENTAR BIBOU
  function cumprimentar() {
    clearTimeout(temporizadorDanca);
    robo.classList.remove("dancando");

    estadoRobo.textContent = "Animado!";
    descricaoEstado.textContent = "Acabou de receber um oi!";
    humorRobo.textContent = "Muito feliz";
    descricaoHumor.textContent = "Adorou o cumprimento!";

    notificar("💜 BIBOU: Oii! Que bom ver você!");
    registrarAtividade(
      "BIBOU recebeu um oi",
      "Cumprimento demonstrativo",
      "💜"
    );
  }

  // DANÇA SIMULADA
  function dancar() {
    clearTimeout(temporizadorDanca);

    robo.classList.add("dancando");

    estadoRobo.textContent = "Dançando!";
    descricaoEstado.textContent = "Dança virtual em andamento";
    humorRobo.textContent = "Animado";
    descricaoHumor.textContent = "Curtindo uma música imaginária!";

    notificar("🎵 BIBOU está fazendo uma dancinha virtual!");

    registrarAtividade(
      "Dança demonstrativa",
      "Animação realizada na interface",
      "🎵"
    );

    temporizadorDanca = setTimeout(() => {
      robo.classList.remove("dancando");
      estadoRobo.textContent = "Descansando";
      descricaoEstado.textContent = "Pronto para explorar!";
    }, 3500);
  }

  // BOTÕES DE AÇÃO
  document.querySelectorAll("[data-action]").forEach(botao => {
    botao.addEventListener("click", () => {
      const acao = botao.dataset.action;

      if (acao === "cumprimentar") {
        cumprimentar();
      }

      if (acao === "dancar") {
        dancar();
      }
    });
  });

  // TELAS QUE AINDA SERÃO DESENVOLVIDAS

  // NAVEGAÇÃO ENTRE TELAS
  document.querySelectorAll("[data-page]").forEach(botao => {
    botao.addEventListener("click", () => {
      const pagina = botao.dataset.page;

      if (botao.dataset.page === "Expressões") {
        window.location.href = "expressoes.html";
        return;
      }

      if (pagina === "Conversar") {
        window.location.href = "conversar.html";
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
        `✨ A tela "${pagina}" será desenvolvida em breve!`
      );

      registrarAtividade(
        `Acesso à área ${pagina}`,
        "Tela ainda em desenvolvimento",
        "✦"
      );
    });
  });

  console.log("BIBOU OS Dashboard - Modo demonstração ativo");
});
