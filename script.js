/*************************************************
 * EDIÇÃO DE NOMES (OPONENTES / INSTITUIÇÕES)
 *************************************************/
function makeEditable(selector) {
  const element = document.querySelector(selector);
  if (!element) return;

  element.addEventListener("click", () => {
    if (element.querySelector("input")) return;

    const oldText = element.textContent.trim();
    const input = document.createElement("input");

    input.type = "text";
    input.value = oldText;
    input.style.fontSize = "inherit";
    input.style.fontWeight = "inherit";
    input.style.width = "90%";
    input.style.textAlign = "center";
    input.style.border = "none";
    input.style.outline = "none";
    input.style.background = "rgba(255,255,255,0.7)";
    input.style.borderRadius = "1vmin";

    element.textContent = "";
    element.appendChild(input);
    input.focus();

    function save() {
      element.textContent = input.value.trim() || oldText;
    }

    input.addEventListener("blur", save);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") input.blur();
    });
  });
}

makeEditable(".oponent1");
makeEditable(".oponent2");
makeEditable(".instituicao1");
makeEditable(".instituicao2");


/*************************************************
 * CRONÔMETRO
 *************************************************/
const display = document.querySelector(".tempo-display");
const btnPlay = document.querySelector(".btn-play");
const btnStop = document.querySelector(".btn-stop");
const btnReset = document.querySelector(".btn-reset");

let intervalo = null;
let tempoInicial = 0;
let tempoAtual = 0;

function formatarTempo(segundos) {
  const min = String(Math.floor(segundos / 60)).padStart(2, "0");
  const sec = String(segundos % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

display.textContent = formatarTempo(tempoAtual);

display.addEventListener("click", () => {
  const novoTempo = prompt("Digite o tempo (MM:SS)", display.textContent);
  if (!novoTempo || !/^\d{2}:\d{2}$/.test(novoTempo)) return;

  const [min, sec] = novoTempo.split(":").map(Number);
  tempoInicial = min * 60 + sec;
  tempoAtual = tempoInicial;
  display.textContent = formatarTempo(tempoAtual);
});

btnPlay.addEventListener("click", () => {
  if (intervalo || tempoAtual <= 0) return;

  intervalo = setInterval(() => {
    tempoAtual--;
    display.textContent = formatarTempo(tempoAtual);

    if (tempoAtual <= 0) {
      clearInterval(intervalo);
      intervalo = null;
      alert(`Fim de luta — ${modalidadeAtual?.nome || "Tempo encerrado"}`);
    }
  }, 1000);
});

btnStop.addEventListener("click", () => {
  clearInterval(intervalo);
  intervalo = null;
});


/*************************************************
 * ESTADO GLOBAL DA LUTA
 *************************************************/
let pontosGerais1 = 0;
let pontosGerais2 = 0;

let modalidadeAtual = null;

const modalidades = {
  ippon:  { nome: "Shobu-Ippon", tempo: 120, pontosMax: 2 },
  nihon:  { nome: "Shobu-Nihon", tempo: 90,  pontosMax: 4 },
  sanbon: { nome: "Shobu-Sanbon",tempo: 180, pontosMax: 6 },
  rotation:{ nome: "Rotation",   tempo: 300, pontosMax: 10 }
};

function aplicarModalidade(chave) {
  modalidadeAtual = modalidades[chave];
  tempoInicial = modalidadeAtual.tempo;
  tempoAtual = tempoInicial;
  btnReset.click();
}


/*************************************************
 * VERIFICA FIM DE LUTA
 *************************************************/
function verificarFimDeLuta() {
  if (!modalidadeAtual) return;

  if (
    pontosGerais1 >= modalidadeAtual.pontosMax ||
    pontosGerais2 >= modalidadeAtual.pontosMax
  ) {
    clearInterval(intervalo);
    intervalo = null;
    alert(`Fim de luta — ${modalidadeAtual.nome}`);
  }
}


/*************************************************
 * RESET GERAL
 *************************************************/
btnReset.addEventListener("click", () => {
  clearInterval(intervalo);
  intervalo = null;

  tempoAtual = tempoInicial;
  display.textContent = formatarTempo(tempoAtual);

  pontosGerais1 = 0;
  pontosGerais2 = 0;

  document.querySelector(".pontos1").textContent = "0";
  document.querySelector(".pontos2").textContent = "0";

  document.querySelectorAll(".pen-box").forEach(box => {
  box.dataset.valor = "0";
  box.querySelector(".count").textContent = "0";
});

});


/*************************************************
 * PONTUAÇÃO (IPPON / WAZARI) — CORRIGIDO
 *************************************************/
function configurarPonto(tipo, valor) {
  document.querySelectorAll(`.pen-box[data-type="${tipo}"]`).forEach(box => {
    const side = box.dataset.side;
    const count = box.querySelector(".count");
    const mais = box.querySelector(".mais");
    const menos = box.querySelector(".menos");
    const placar = document.querySelector(`.pontos${side}`);

    // estado salvo NO DOM
    box.dataset.valor = "0";

    function atualizar() {
      count.textContent = box.dataset.valor;
      placar.textContent = side === "1" ? pontosGerais1 : pontosGerais2;
    }

    mais.addEventListener("click", () => {
      box.dataset.valor = Number(box.dataset.valor) + 1;

      if (side === "1") {
        pontosGerais1 += valor;
      } else {
        pontosGerais2 += valor;
      }

      atualizar();
      verificarFimDeLuta();
    });

    menos.addEventListener("click", () => {
      if (Number(box.dataset.valor) <= 0) return;

      box.dataset.valor = Number(box.dataset.valor) - 1;

      if (side === "1") {
        pontosGerais1 = Math.max(0, pontosGerais1 - valor);
      } else {
        pontosGerais2 = Math.max(0, pontosGerais2 - valor);
      }

      atualizar();
    });
  });
}


configurarPonto("ippon", 2);
configurarPonto("wazari", 1);


/*************************************************
 * PENALIDADES (SEM PLACAR)
 *************************************************/
document.querySelectorAll(".pen-box").forEach(box => {
  const tipo = box.dataset.type;
  if (tipo === "ippon" || tipo === "wazari") return;

  const count = box.querySelector(".count");
  const mais = box.querySelector(".mais");
  const menos = box.querySelector(".menos");

  let valor = 0;

  mais.addEventListener("click", () => {
    valor++;
    count.textContent = valor;
  });

  menos.addEventListener("click", () => {
    if (valor > 0) valor--;
    count.textContent = valor;
  });
});


/*************************************************
 * MODAL DE CONFIGURAÇÃO
 *************************************************/
const configBtn = document.querySelector(".config-btn");
const configModal = document.getElementById("configModal");
const closeConfig = document.getElementById("closeConfig");

configBtn.addEventListener("click", () => {
  configModal.style.display = "flex";
});

closeConfig.addEventListener("click", () => {
  configModal.style.display = "none";
});

configModal.addEventListener("click", e => {
  if (e.target === configModal) {
    configModal.style.display = "none";
  }
});


/*************************************************
 * MODAL – MODALIDADES DE LUTA
 *************************************************/
document.querySelectorAll(".config-option[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    aplicarModalidade(btn.dataset.mode);
    alert(`Modalidade selecionada: ${modalidadeAtual.nome}`);
    configModal.style.display = "none";
  });
});

/*************************************************
 * MODAL — MUDANÇA DE TEMA
 *************************************************/

// Botões de tema dentro do modal
document.querySelectorAll('[data-theme]').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;

    // Remove qualquer tema antes
    document.body.classList.remove('tema-azul');

    // Aplica tema escolhido
    if (theme === 'ra') {
      document.body.classList.add('tema-azul');
    }
    // rb = tema padrão → não adiciona nada

    // Fecha o modal
    document.getElementById('configModal').style.display = 'none';
  });
});
