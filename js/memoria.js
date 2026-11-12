
/* ==========================================
   BIBOU OS — MEMÓRIA PREMIUM
   Preferências e memórias locais
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = id => document.getElementById(id);

  const CHAVE = "bibou_os_memoria_v1";
  const LIMITE = 30;

  const PERSONALIDADES = {
    carinhoso: {
      nome: "Carinhoso",
      descricao: "Gentil e acolhedor"
    },
    divertido: {
      nome: "Divertido",
      descricao: "Animado e espontâneo"
    },
    curioso: {
      nome: "Curioso",
      descricao: "Atento e explorador"
    },
    tranquilo: {
      nome: "Tranquilo",
      descricao: "Calmo e sereno"
    }
  };

  const ESTILOS = {
    fofo: "Fofo",
    animado: "Animado",
    objetivo: "Objetivo",
    calmo: "Calmo"
  };

  const sidebar = $("sidebar");
  const menuToggle = $("menuToggle");
  const overlay = $("overlay");

  const nomeInput = $("nomeUsuario");
  const corInput = $("corFavorita");
  const estiloInput = $("estiloConversa");
  const interessesInput = $("interessesUsuario");

  const novaMemoria = $("novaMemoria");
  const listaMemorias = $("listaMemorias");

  let dados = {
    nome: "",
    cor: "Roxo",
    interesses: "",
    estilo: "fofo",
    personalidade: "carinhoso",
    memorias: []
  };

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

  // ARMAZENAMENTO

  function carregarDados() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE));

      if (!salvo || typeof salvo !== "object" ||
          Array.isArray(salvo)) return;

      dados = {
        ...dados,
        ...salvo,
        nome: typeof salvo.nome === "string" ? salvo.nome : "",
        cor: typeof salvo.cor === "string" ? salvo.cor : "Roxo",
        interesses: typeof salvo.interesses === "string"
          ? salvo.interesses : "",
        estilo: ESTILOS[salvo.estilo]
          ? salvo.estilo : "fofo",
        personalidade: PERSONALIDADES[salvo.personalidade]
          ? salvo.personalidade : "carinhoso",
        memorias: Array.isArray(salvo.memorias)
          ? salvo.memorias : []
      };
    } catch (erro) {
      console.warn("Erro ao carregar memória:", erro);
    }
  }

  function salvarDados() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(dados));

      // Notifica os módulos compartilhados.
      window.dispatchEvent(
        new CustomEvent("bibou:preferencias", {
          detail: { origem: "memoria" }
        })
      );

      return true;
    } catch (erro) {
      console.error("Erro ao salvar memória:", erro);
      avisar("Não foi possível salvar os dados.");
      return false;
    }
  }

  // AVISOS

  let timerToast;

  function avisar(mensagem) {
    const toast = $("toast");
    if (!toast) return;

    toast.textContent = mensagem;
    toast.classList.add("visivel");

    clearTimeout(timerToast);

    timerToast = setTimeout(() => {
      toast.classList.remove("visivel");
    }, 2800);
  }

  // PREFERÊNCIAS

  function preencherFormulario() {
    nomeInput.value = dados.nome;
    corInput.value = dados.cor;
    estiloInput.value = dados.estilo;
    interessesInput.value = dados.interesses;
  }

  function renderizarPersonalidade() {
    const personalidade =
      PERSONALIDADES[dados.personalidade];

    document.querySelectorAll(
      "[data-personalidade]"
    ).forEach(botao => {
      const selecionado =
        botao.dataset.personalidade === dados.personalidade;

      botao.classList.toggle("ativo", selecionado);
      botao.setAttribute(
        "aria-pressed",
        String(selecionado)
      );
    });

    $("personalidadeAtual").textContent =
      personalidade.nome;

    $("resumoPersonalidade").textContent =
      personalidade.descricao;

    $("estiloAtual").textContent =
      ESTILOS[dados.estilo];
  }

  document.querySelectorAll(
    "[data-personalidade]"
  ).forEach(botao => {
    botao.addEventListener("click", () => {
      const personalidade = botao.dataset.personalidade;

      if (!PERSONALIDADES[personalidade]) return;

      dados.personalidade = personalidade;

      if (salvarDados()) {
        renderizarPersonalidade();
        avisar("Personalidade atualizada!");
      }
    });
  });

  $("formPreferencias").addEventListener(
    "submit",
    evento => {
      evento.preventDefault();

      dados.nome = nomeInput.value.trim();
      dados.cor = corInput.value.trim() || "Roxo";
      dados.estilo = ESTILOS[estiloInput.value]
        ? estiloInput.value : "fofo";
      dados.interesses = interessesInput.value.trim();

      if (salvarDados()) {
        renderizarPersonalidade();
        avisar("Preferências salvas com sucesso!");
      }
    }
  );

  // MEMÓRIAS

  // Mantemos os itens existentes sem converter
  // automaticamente o formato salvo anteriormente.

  function textoDaMemoria(item) {
    if (typeof item === "string") {
      return item;
    }

    if (item && typeof item === "object") {
      const campos = [
        "texto", "conteudo", "memoria",
        "descricao", "valor"
      ];

      for (const campo of campos) {
        if (typeof item[campo] === "string") {
          return item[campo];
        }
      }
    }

    return "";
  }

  function renderizarMemorias() {
    listaMemorias.replaceChildren();

    const total = dados.memorias.length;

    $("totalMemorias").textContent =
      `${total} / ${LIMITE}`;

    $("contadorMemorias").textContent =
      `${total} ${total === 1 ? "registro" : "registros"}`;

    if (total === 0) {
      const vazio = document.createElement("div");
      vazio.className = "memory-empty";
      vazio.textContent =
        "Ainda não há memórias registradas. Adicione uma informação para começar.";
      listaMemorias.appendChild(vazio);
      return;
    }

    dados.memorias.forEach((item, indice) => {
      const linha = document.createElement("div");
      linha.className = "memory-item";

      const texto = document.createElement("p");
      texto.className = "memory-item-text";
      texto.textContent =
        textoDaMemoria(item) ||
        "Registro em formato anterior";

      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "memory-remove-button";
      remover.textContent = "Excluir";
      remover.setAttribute(
        "aria-label",
        `Excluir memória ${indice + 1}`
      );

      remover.addEventListener("click", () => {
        const confirmar = window.confirm(
          "Deseja excluir esta memória?"
        );

        if (!confirmar) return;

        const anterior = [...dados.memorias];
        dados.memorias.splice(indice, 1);

        if (salvarDados()) {
          renderizarMemorias();
          avisar("Memória excluída.");
        } else {
          dados.memorias = anterior;
        }
      });

      linha.append(texto, remover);
      listaMemorias.appendChild(linha);
    });
  }

  $("formMemoria").addEventListener(
    "submit",
    evento => {
      evento.preventDefault();

      const texto = novaMemoria.value.trim();

      if (!texto) {
        avisar("Escreva uma memória primeiro.");
        return;
      }

      if (dados.memorias.length >= LIMITE) {
        avisar("O limite de 30 memórias foi atingido.");
        return;
      }

      const anterior = [...dados.memorias];

      // Registros simples são salvos como texto.
      // Objetos antigos permanecem preservados.
      dados.memorias.push(texto);

      if (salvarDados()) {
        novaMemoria.value = "";
        renderizarMemorias();
        avisar("Nova memória registrada!");
      } else {
        dados.memorias = anterior;
      }
    }
  );

  $("limparMemorias").addEventListener(
    "click",
    () => {
      if (dados.memorias.length === 0) {
        avisar("Não há memórias para excluir.");
        return;
      }

      const confirmar = window.confirm(
        "Deseja excluir TODAS as memórias registradas? Essa ação não pode ser desfeita."
      );

      if (!confirmar) return;

      const anterior = [...dados.memorias];
      dados.memorias = [];

      if (salvarDados()) {
        renderizarMemorias();
        avisar("Todas as memórias foram excluídas.");
      } else {
        dados.memorias = anterior;
      }
    }
  );

  // ATUALIZAÇÃO ENTRE ABAS

  window.addEventListener("storage", evento => {
    if (evento.key !== CHAVE) return;

    carregarDados();
    preencherFormulario();
    renderizarPersonalidade();
    renderizarMemorias();
  });

  // INICIALIZAÇÃO

  carregarDados();
  preencherFormulario();
  renderizarPersonalidade();
  renderizarMemorias();

  console.log(
    "BIBOU OS — Memória Premium carregada!"
  );
});
