
/* ==========================================
   BIBOU OS — DASHBOARD PREMIUM
   Versão visual 2.0
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = id => document.getElementById(id);

  const sidebar = $("sidebar");
  const menuToggle = $("menuToggle");
  const overlay = $("overlay");

  // MENU RESPONSIVO

  function fecharMenu() {
    sidebar.classList.remove("aberto");
    overlay.hidden = true;

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  menuToggle.addEventListener("click", () => {
    const abrir = !sidebar.classList.contains("aberto");

    sidebar.classList.toggle("aberto", abrir);
    overlay.hidden = !abrir;

    menuToggle.setAttribute(
      "aria-expanded",
      String(abrir)
    );
  });

  overlay.addEventListener("click", fecharMenu);

  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
      fecharMenu();
    }
  });

  document.querySelectorAll(
    ".sidebar .menu-item"
  ).forEach(link => {
    link.addEventListener("click", fecharMenu);
  });

  // DATA ATUAL

  function atualizarData() {
    const elemento = $("dataAtual");

    if (!elemento) return;

    const hoje = new Date();

    elemento.textContent =
      new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(hoje);
  }

  // ESTADO DEMONSTRATIVO

  function atualizarEstado() {
    if (!window.BibouEstado) return;

    const estado = window.BibouEstado.obter();

    // Atributos de dados usados no HTML
    const textosConexao = {
      desconectado: "Desconectado",
      buscando: "Buscando...",
      encontrado: "Dispositivo encontrado",
      conectando: "Conectando...",
      conectado: "Conectado (demo)"
    };

    const textosRecarga = {
      fora: "Fora da base",
      procurando: "Procurando base",
      carregando: "Carregando",
      completa: "Carga completa"
    };

    document.querySelectorAll(
      "[data-estado-conexao]"
    ).forEach(elemento => {
      elemento.textContent =
        textosConexao[estado.conexao] ||
        "Desconectado";
    });

    document.querySelectorAll(
      "[data-estado-bateria]"
    ).forEach(elemento => {
      elemento.textContent =
        estado.bateria + "%";
    });

    document.querySelectorAll(
      "[data-estado-motores]"
    ).forEach(elemento => {
      elemento.textContent =
        estado.velocidade === 0
          ? "Em repouso"
          : `Movimento virtual · ${estado.velocidade}%`;
    });

    document.querySelectorAll(
      "[data-estado-recarga]"
    ).forEach(elemento => {
      elemento.textContent =
        textosRecarga[estado.recarga] ||
        "Fora da base";
    });

    // Indicador de conexão
    const indicador = $("indicadorConexao");

    if (indicador) {
      indicador.classList.toggle(
        "online",
        estado.conexao === "conectado"
      );
    }

    // Pequena bateria visual
    const bateria = $("miniBateria");

    if (bateria) {
      bateria.style.width =
        estado.bateria + "%";

      bateria.style.background =
        estado.bateria <= 20
          ? "#d7a27e"
          : "#aa8bdc";
    }
  }

  // PREFERÊNCIAS

  function atualizarPreferencias() {
    if (!window.BibouPreferencias) return;

    window.BibouPreferencias.atualizarElementos();
  }

  // EVENTOS COMPARTILHADOS

  window.addEventListener(
    "bibou:estado",
    atualizarEstado
  );

  window.addEventListener(
    "bibou:preferencias",
    atualizarPreferencias
  );

  window.addEventListener("pageshow", () => {
    atualizarEstado();
    atualizarPreferencias();
  });

  // INICIALIZAÇÃO

  atualizarData();
  atualizarEstado();
  atualizarPreferencias();

  console.log(
    "BIBOU OS — Dashboard Premium carregado!"
  );
});
