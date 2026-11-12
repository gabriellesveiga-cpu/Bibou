
/* ==========================================
   BIBOU OS — CONFIGURAÇÕES PREMIUM
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

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

  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));

      if (!salvo || typeof salvo !== "object" ||
          Array.isArray(salvo)) {
        return padrao();
      }

      return {
        ...padrao(),
        ...salvo,
        nome: typeof salvo.nome === "string"
          ? salvo.nome : "BIBOU",
        modo: ["wifi", "bluetooth", "automatico"].includes(salvo.modo)
          ? salvo.modo : "wifi",
        sons: typeof salvo.sons === "boolean"
          ? salvo.sons : true,
        notificacoes: typeof salvo.notificacoes === "boolean"
          ? salvo.notificacoes : true,
        animacoes: typeof salvo.animacoes === "boolean"
          ? salvo.animacoes : true,
        intensidade: Number.isFinite(Number(salvo.intensidade))
          ? Math.max(0, Math.min(100, Number(salvo.intensidade)))
          : 70
      };
    } catch {
      return padrao();
    }
  }

  let dados = carregar();

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(dados));

      window.dispatchEvent(
        new CustomEvent("bibou:preferencias", {
          detail: { origem: "configuracoes" }
        })
      );

      window.BibouPreferencias?.atualizarElementos?.();

      return true;
    } catch {
      mostrarToast("Não foi possível salvar neste navegador.", true);
      return false;
    }
  }

  // MENU

  function fecharMenu() {
    sidebar?.classList.remove("aberto");

    if (overlay) overlay.hidden = true;

    menuToggle?.setAttribute("aria-expanded", "false");
  }

  menuToggle?.addEventListener("click", () => {
    const aberto = sidebar.classList.toggle("aberto");

    if (overlay) overlay.hidden = !aberto;

    menuToggle.setAttribute("aria-expanded", String(aberto));
  });

  overlay?.addEventListener("click", fecharMenu);

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
      // O aplicativo continua sem áudio.
    }
  }

  // APLICAR PREFERÊNCIAS

  function aplicarConfiguracoes() {
    $("nomeRobo").value = dados.nome;
    $("modoConexao").value = dados.modo;
    $("sonsAtivos").checked = dados.sons;
    $("notificacoesAtivas").checked = dados.notificacoes;
    $("animacoesAtivas").checked = dados.animacoes;
    $("intensidadeEfeitos").value = dados.intensidade;

    $("intensidadeValor").textContent =
      `${dados.intensidade}%`;

    $("nomeDispositivo").textContent = dados.nome;
    $("nomeEncontrado").textContent = dados.nome;

    document.querySelectorAll("[data-bibou-nome]")
      .forEach(elemento => {
        elemento.textContent = dados.nome;
      });

    document.body.classList.toggle(
      "cfg-no-animation",
      !dados.animacoes
    );

    const intensidade = dados.intensidade / 100;
    const robo = document.querySelector(".cfg-robot");

    if (robo) {
      robo.style.filter =
        `drop-shadow(0 0 ${intensidade * 25}px rgba(169,120,255,${intensidade * 0.7}))`;
    }
  }

  $("intensidadeEfeitos").addEventListener("input", () => {
    $("intensidadeValor").textContent =
      `${$("intensidadeEfeitos").value}%`;
  });

  $("formConfiguracoes").addEventListener("submit", evento => {
    evento.preventDefault();

    const nome = $("nomeRobo").value.trim();

    if (!nome) {
      mostrarToast("Digite um nome para o BIBOU.", true);
      return;
    }

    const anteriores = { ...dados };

    dados.nome = nome;
    dados.modo = $("modoConexao").value;
    dados.sons = $("sonsAtivos").checked;
    dados.notificacoes = $("notificacoesAtivas").checked;
    dados.animacoes = $("animacoesAtivas").checked;
    dados.intensidade = Number(
      $("intensidadeEfeitos").value
    );

    if (salvar()) {
      aplicarConfiguracoes();
      tocarSom();
      mostrarToast("Configurações salvas!", true);
    } else {
      dados = anteriores;
      aplicarConfiguracoes();
    }
  });

  // CONEXÃO DEMONSTRATIVA

  function sincronizarConexao() {
    try {
      window.BibouEstado?.atualizar?.({
        conexao: conexao === "conectado"
          ? "conectado"
          : "desconectado"
      });
    } catch (erro) {
      console.warn("Erro ao sincronizar conexão:", erro);
    }
  }

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
      status === "conectando" ||
      status === "encontrado"
    ) {
      elemento.classList.add("searching");
    } else {
      elemento.classList.add("disconnected");
    }

    $("descricaoConexao").textContent = descricao;

    buscar.disabled = status !== "desconectado";
    conectar.disabled = status !== "encontrado";
    desconectar.disabled = status === "desconectado";

    if (status === "conectado") {
      resultadoBusca.hidden = true;
    }

    sincronizarConexao();
  }

  buscar.addEventListener("click", () => {
    if (conexao !== "desconectado") return;

    resultadoBusca.hidden = true;

    definirConexao(
      "buscando",
      "Buscando um dispositivo virtual..."
    );

    buscar.textContent = "⌛ Buscando...";

    clearTimeout(timerBusca);

    timerBusca = setTimeout(() => {
      timerBusca = null;

      definirConexao(
        "encontrado",
        "Um BIBOU virtual está disponível."
      );

      resultadoBusca.hidden = false;
      buscar.textContent = "⌕ Buscar dispositivo";

      tocarSom();
      mostrarToast("BIBOU virtual encontrado!");
    }, 1800);
  });

  conectar.addEventListener("click", () => {
    if (conexao !== "encontrado") return;

    definirConexao(
      "conectando",
      "Estabelecendo conexão demonstrativa..."
    );

    clearTimeout(timerConexao);

    timerConexao = setTimeout(() => {
      timerConexao = null;

      definirConexao(
        "conectado",
        "Pareamento demonstrativo concluído. Nenhum robô físico está conectado."
      );

      tocarSom();
      mostrarToast("Conexão demonstrativa concluída!");
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
      "Esta é uma notificação de teste do BIBOU OS!",
      true
    );
  });

  // RESTAURAR CONFIGURAÇÕES

  $("restaurarConfiguracoes").addEventListener("click", () => {
    const confirmar = window.confirm(
      "Restaurar as configurações iniciais desta tela?"
    );

    if (!confirmar) return;

    const anteriores = { ...dados };

    dados = padrao();

    if (!salvar()) {
      dados = anteriores;
      return;
    }

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

    mostrarToast("Configurações restauradas!", true);
  });

  // ATUALIZAÇÕES ENTRE ABAS

  window.addEventListener("storage", evento => {
    if (evento.key !== CHAVE) return;

    dados = carregar();
    aplicarConfiguracoes();
  });

  // LIMPEZA

  window.addEventListener("pagehide", () => {
    clearTimeout(timerBusca);
    clearTimeout(timerConexao);
    clearTimeout(timerToast);
  });

  // INICIALIZAÇÃO

  aplicarConfiguracoes();

  // O pareamento virtual é temporário.
  // Não é restaurado automaticamente ao abrir a página.
  definirConexao(
    "desconectado",
    "Nenhuma conexão demonstrativa ativa."
  );

  console.log(
    "BIBOU OS — Configurações Premium carregadas!"
  );
});
