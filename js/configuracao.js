
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const CHAVE = "bibou_os_configuracoes_v1";

  const sidebar = $("sidebar");
  const menuToggle = $("menuToggle");
  const overlay = $("overlay");
  const toast = $("toast");

  const buscar = $("buscarDispositivos");
  const conectar = $("conectar");
  const desconectar = $("desconectar");
  const resultadoBusca = $("resultadoBusca");

  let timerBusca = null;
  let timerConexao = null;
  let timerToast = null;

  let conexao = "desconectado";

  const padrao = () => ({
    nome: "BIBOU",
    modo: "wifi",
    sons: true,
    notificacoes: true,
    animacoes: true,
    intensidade: 70
  });

  // CARREGAMENTO
  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));

      if (!salvo || typeof salvo !== "object" ||
          Array.isArray(salvo)) {
        return padrao();
      }

      return { ...padrao(), ...salvo };
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
      mostrarToast(
        "Não foi possível salvar neste navegador.",
        true
      );
      return false;
    }
  }

  // MENU
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
  function mostrarToast(mensagem, forcar = false) {
    if (!dados.notificacoes && !forcar) return;

    clearTimeout(timerToast);

    toast.textContent = mensagem;
    toast.classList.add("visivel");

    timerToast = setTimeout(() => {
      toast.classList.remove("visivel");
    }, 3000);
  }

  // SOM LOCAL OPCIONAL
  function tocarSom() {
    if (!dados.sons) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      const contexto = new AudioContextClass();
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();

      oscilador.type = "sine";
      oscilador.frequency.setValueAtTime(
        620, contexto.currentTime
      );
      oscilador.frequency.exponentialRampToValueAtTime(
        840, contexto.currentTime + 0.12
      );

      ganho.gain.setValueAtTime(
        0.0001, contexto.currentTime
      );
      ganho.gain.exponentialRampToValueAtTime(
        0.035, contexto.currentTime + 0.02
      );
      ganho.gain.exponentialRampToValueAtTime(
        0.0001, contexto.currentTime + 0.16
      );

      oscilador.connect(ganho);
      ganho.connect(contexto.destination);

      oscilador.start();
      oscilador.stop(contexto.currentTime + 0.17);

      oscilador.onended = () => {
        contexto.close().catch(() => {});
      };
    } catch {
      // O aplicativo continua funcionando sem áudio.
    }
  }

  // CONFIGURAÇÕES
  function aplicarConfiguracoes() {
    $("nomeRobo").value = dados.nome;
    $("modoConexao").value = dados.modo;
    $("sonsAtivos").checked = dados.sons;
    $("notificacoesAtivas").checked = dados.notificacoes;
    $("animacoesAtivas").checked = dados.animacoes;
    $("intensidadeEfeitos").value = dados.intensidade;

    $("intensidadeValor").textContent =
      dados.intensidade + "%";

    $("nomeDispositivo").textContent = dados.nome;
    $("nomeEncontrado").textContent = dados.nome;

    document.body.classList.toggle(
      "cfg-no-animation",
      !dados.animacoes
    );

    const intensidade = Number(dados.intensidade) / 100;

    document.querySelector(".cfg-robot").style.filter =
      `drop-shadow(0 0 ${intensidade * 25}px
      rgba(169,120,255,${intensidade * 0.7}))`;
  }

  $("intensidadeEfeitos").addEventListener("input", () => {
    $("intensidadeValor").textContent =
      $("intensidadeEfeitos").value + "%";
  });

  $("formConfiguracoes").addEventListener("submit", evento => {
    evento.preventDefault();

    const nome = $("nomeRobo").value.trim();

    if (!nome) {
      mostrarToast("Digite um nome para o BIBOU.", true);
      return;
    }

    dados.nome = nome;
    dados.modo = $("modoConexao").value;
    dados.sons = $("sonsAtivos").checked;
    dados.notificacoes = $("notificacoesAtivas").checked;
    dados.animacoes = $("animacoesAtivas").checked;
    dados.intensidade = Number(
      $("intensidadeEfeitos").value
    );

    aplicarConfiguracoes();

    if (salvar()) {
      tocarSom();
      mostrarToast("💜 Configurações salvas!");
    }
  });

  // CONEXÃO DEMONSTRATIVA
  function definirConexao(status, descricao) {
    conexao = status;

    const elemento = $("statusConexao");
    elemento.className = "cfg-status";

    const textos = {
      desconectado: "● Desconectado",
      buscando: "◌ Procurando...",
      encontrado: "● Dispositivo encontrado",
      conectando: "◌ Conectando...",
      conectado: "● Conectado (simulação)"
    };

    elemento.textContent = textos[status];

    if (status === "conectado") {
      elemento.classList.add("connected");
    } else if (
      status === "buscando" ||
      status === "conectando"
    ) {
      elemento.classList.add("searching");
    } else {
      elemento.classList.add("disconnected");
    }

    $("descricaoConexao").textContent = descricao;

    buscar.disabled = status !== "desconectado";
    conectar.disabled = status !== "encontrado";
    desconectar.disabled =
      status === "desconectado";

    if (status === "conectado") {
      resultadoBusca.hidden = true;
    }
  }

  buscar.addEventListener("click", () => {
    if (conexao !== "desconectado") return;

    resultadoBusca.hidden = true;

    definirConexao(
      "buscando",
      "Buscando um dispositivo virtual..."
    );

    buscar.textContent = "⌛ Buscando...";

    timerBusca = setTimeout(() => {
      timerBusca = null;

      definirConexao(
        "encontrado",
        "Um BIBOU virtual está disponível."
      );

      resultadoBusca.hidden = false;
      buscar.textContent = "⌕ Buscar dispositivo";

      tocarSom();
      mostrarToast("🤖 BIBOU virtual encontrado!");
    }, 1800);
  });

  conectar.addEventListener("click", () => {
    if (conexao !== "encontrado") return;

    definirConexao(
      "conectando",
      "Estabelecendo conexão fictícia..."
    );

    timerConexao = setTimeout(() => {
      timerConexao = null;

      definirConexao(
        "conectado",
        "Pareamento demonstrativo concluído. " +
        "Nenhum robô físico está conectado."
      );

      tocarSom();
      mostrarToast("💜 Conexão demonstrativa concluída!");
    }, 1200);
  });

  desconectar.addEventListener("click", () => {
    clearTimeout(timerBusca);
    clearTimeout(timerConexao);

    timerBusca = null;
    timerConexao = null;

    resultadoBusca.hidden = true;
    buscar.textContent = "⌕ Buscar dispositivo";

    definirConexao(
      "desconectado",
      "Nenhuma conexão demonstrativa ativa."
    );

    tocarSom();
    mostrarToast("Dispositivo virtual desconectado.");
  });

  // TESTE DE NOTIFICAÇÃO
  $("testarNotificacao").addEventListener("click", () => {
    tocarSom();
    mostrarToast(
      "✨ Esta é uma notificação de teste do BIBOU OS!",
      true
    );
  });

  // RESTAURAR
  $("restaurarConfiguracoes").addEventListener("click", () => {
    const confirmar = confirm(
      "Restaurar as configurações iniciais desta tela?"
    );

    if (!confirmar) return;

    try {
      localStorage.removeItem(CHAVE);
      dados = padrao();
      aplicarConfiguracoes();

      clearTimeout(timerBusca);
      clearTimeout(timerConexao);

      timerBusca = null;
      timerConexao = null;

      resultadoBusca.hidden = true;
      buscar.textContent = "⌕ Buscar dispositivo";

      definirConexao(
        "desconectado",
        "Nenhuma conexão demonstrativa ativa."
      );

      mostrarToast(
        "💜 Configurações restauradas!",
        true
      );
    } catch {
      mostrarToast(
        "Não foi possível restaurar os dados.",
        true
      );
    }
  });

  // INICIALIZAÇÃO
  aplicarConfiguracoes();

  definirConexao(
    "desconectado",
    "Nenhuma conexão demonstrativa ativa."
  );

  console.log(
    "BIBOU OS - Configurações demonstrativas prontas!"
  );
});
