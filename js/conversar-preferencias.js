
/* BIBOU OS - INTEGRAÇÃO INICIAL DO CHAT */

document.addEventListener("DOMContentLoaded", () => {
  const saudacao = document.getElementById(
    "bibouSaudacaoCompartilhada"
  );

  if (!saudacao || !window.BibouPreferencias) return;

  function atualizarSaudacao() {
    const preferencias =
      window.BibouPreferencias.obterTudo();

    const personalidade =
      window.BibouPreferencias.obterPersonalidade();

    const nome = preferencias.usuario.nome;

    saudacao.textContent = nome
      ? `${nome}, ${personalidade.saudacao}`
      : personalidade.saudacao;
  }

  atualizarSaudacao();

  window.addEventListener(
    "bibou:preferencias",
    atualizarSaudacao
  );

  window.addEventListener(
    "pageshow",
    atualizarSaudacao
  );
});

