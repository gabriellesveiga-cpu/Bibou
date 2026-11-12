
/* ==========================================
   BIBOU OS - PREFERÊNCIAS COMPARTILHADAS
   Etapa 9.3
   Integração local e demonstrativa
========================================== */

(() => {
  "use strict";

  const CHAVES = {
    memoria: "bibou_os_memoria_v1",
    configuracoes: "bibou_os_configuracoes_v1"
  };

  const PERSONALIDADES = {
    carinhoso: {
      nome: "Carinhoso",
      saudacao: "Que bom conversar com você! 💜"
    },
    divertido: {
      nome: "Divertido",
      saudacao: "Ebaaa! Vamos nos divertir! 🎉"
    },
    curioso: {
      nome: "Curioso",
      saudacao: "O que vamos descobrir hoje? 🔎"
    },
    tranquilo: {
      nome: "Tranquilo",
      saudacao: "Vamos aproveitar este momento com calma. 🌙"
    }
  };

  const ESTILOS = {
    fofo: "Fofo e amigável",
    animado: "Animado e divertido",
    objetivo: "Simples e objetivo",
    calmo: "Calmo e gentil"
  };

  function lerJSON(chave) {
    try {
      const texto = localStorage.getItem(chave);

      if (!texto) return {};

      const dados = JSON.parse(texto);

      if (
        !dados ||
        typeof dados !== "object" ||
        Array.isArray(dados)
      ) {
        return {};
      }

      return dados;
    } catch {
      return {};
    }
  }

  function obterMemoria() {
    const dados = lerJSON(CHAVES.memoria);

    return {
      nome: typeof dados.nome === "string"
        ? dados.nome.trim() : "",

      cor: typeof dados.cor === "string"
        ? dados.cor : "Roxo",

      interesses: typeof dados.interesses === "string"
        ? dados.interesses.trim() : "",

      estilo: ESTILOS[dados.estilo]
        ? dados.estilo : "fofo",

      personalidade: PERSONALIDADES[dados.personalidade]
        ? dados.personalidade : "carinhoso",

      memorias: Array.isArray(dados.memorias)
        ? dados.memorias : []
    };
  }

  function obterConfiguracoes() {
    const dados = lerJSON(CHAVES.configuracoes);

    return {
      nome: typeof dados.nome === "string" &&
            dados.nome.trim()
        ? dados.nome.trim() : "BIBOU",

      modo: ["wifi", "bluetooth", "automatico"]
        .includes(dados.modo)
        ? dados.modo : "wifi",

      sons: typeof dados.sons === "boolean"
        ? dados.sons : true,

      notificacoes:
        typeof dados.notificacoes === "boolean"
          ? dados.notificacoes : true,

      animacoes: typeof dados.animacoes === "boolean"
        ? dados.animacoes : true,

      intensidade: Number.isFinite(
        Number(dados.intensidade)
      )
        ? Math.max(
            0,
            Math.min(100, Number(dados.intensidade))
          )
        : 70
    };
  }

  function obterTudo() {
    return {
      usuario: obterMemoria(),
      robo: obterConfiguracoes()
    };
  }

  function obterPersonalidade() {
    const memoria = obterMemoria();

    return PERSONALIDADES[memoria.personalidade];
  }

  // ATUALIZAÇÃO DE ELEMENTOS COMPARTILHADOS
  function atualizarElementos() {
    const preferencias = obterTudo();

    document.querySelectorAll(
      "[data-bibou-nome]"
    ).forEach(elemento => {
      elemento.textContent = preferencias.robo.nome;
    });

    document.querySelectorAll(
      "[data-bibou-usuario]"
    ).forEach(elemento => {
      elemento.textContent =
        preferencias.usuario.nome || "Visitante";
    });

    document.querySelectorAll(
      "[data-bibou-personalidade]"
    ).forEach(elemento => {
      elemento.textContent =
        obterPersonalidade().nome;
    });

    document.querySelectorAll(
      "[data-bibou-cor]"
    ).forEach(elemento => {
      elemento.textContent =
        preferencias.usuario.cor;
    });
  }

  // SINCRONIZAÇÃO ENTRE ABAS
  window.addEventListener("storage", evento => {
    if (
      evento.key === CHAVES.memoria ||
      evento.key === CHAVES.configuracoes
    ) {
      atualizarElementos();

      window.dispatchEvent(
        new CustomEvent("bibou:preferencias", {
          detail: obterTudo()
        })
      );
    }
  });

  function iniciar() {
    atualizarElementos();

    // Releitura ao retornar para a página.
    window.addEventListener(
      "pageshow",
      atualizarElementos
    );
  }

  window.BibouPreferencias = {
    obterTudo,
    obterMemoria,
    obterConfiguracoes,
    obterPersonalidade,
    atualizarElementos,
    personalidades: PERSONALIDADES,
    estilos: ESTILOS
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      iniciar
    );
  } else {
    iniciar();
  }
})();

