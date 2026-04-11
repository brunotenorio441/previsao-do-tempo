// =============================================
// CONFIGURAÇÃO
// =============================================

// Sua chave da API do OpenWeatherMap
const CHAVE_API = "f625582233746205a14168c8ce5a5660";

// URL base da API
const URL_BASE = "https://api.openweathermap.org/data/2.5";


// =============================================
// SELECIONANDO OS ELEMENTOS DO HTML
// =============================================

const inputCidade    = document.getElementById("inputCidade");
const btnBuscar      = document.getElementById("btnBuscar");
const erroEl         = document.getElementById("erro");
const conteudoEl     = document.getElementById("conteudo");
const telaInicialEl  = document.getElementById("telaInicial");

const nomeCidadeEl   = document.getElementById("nomeCidade");
const dataHojeEl     = document.getElementById("dataHoje");
const iconeClimaEl   = document.getElementById("iconeClima");
const temperaturaEl  = document.getElementById("temperatura");
const descricaoEl    = document.getElementById("descricao");
const sensacaoEl     = document.getElementById("sensacao");
const umidadeEl      = document.getElementById("umidade");
const ventoEl        = document.getElementById("vento");
const visibilidadeEl = document.getElementById("visibilidade");
const previsaoLista  = document.getElementById("previsaoLista");


// =============================================
// FUNÇÕES AUXILIARES
// =============================================

// Converte o código do ícone da API para um emoji
function obterEmoji(codigoIcone) {
  const codigo = codigoIcone.slice(0, 2); // pega os 2 primeiros dígitos

  const emojis = {
    "01": "☀️",   // céu limpo
    "02": "🌤️",  // poucas nuvens
    "03": "⛅",   // nuvens dispersas
    "04": "☁️",   // nublado
    "09": "🌧️",  // chuva leve
    "10": "🌦️",  // chuva
    "11": "⛈️",   // tempestade
    "13": "❄️",   // neve
    "50": "🌫️",  // névoa
  };

  return emojis[codigo] || "🌡️";
}

// Formata a data de hoje em português
function formatarData() {
  const agora = new Date();
  return agora.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Pega o nome do dia da semana a partir de um timestamp Unix
function obterDiaSemana(timestamp) {
  const data = new Date(timestamp * 1000); // API usa segundos, JS usa milissegundos
  return data.toLocaleDateString("pt-BR", { weekday: "short" });
}

// Mostra ou esconde a mensagem de erro
function mostrarErro(mostrar) {
  erroEl.style.display = mostrar ? "block" : "none";
}

// Mostra o conteúdo e esconde a tela inicial
function mostrarConteudo() {
  telaInicialEl.style.display  = "none";
  conteudoEl.style.display     = "flex";
  mostrarErro(false);
}


// =============================================
// BUSCAR CLIMA ATUAL
// =============================================

async function buscarClimaAtual(cidade) {
  // Monta a URL com os parâmetros necessários
  const url = `${URL_BASE}/weather?q=${cidade}&appid=${CHAVE_API}&units=metric&lang=pt_br`;

  // Faz a requisição para a API
  const resposta = await fetch(url);

  // Se a cidade não for encontrada, lança um erro
  if (!resposta.ok) {
    throw new Error("Cidade não encontrada");
  }

  // Converte a resposta para JSON
  const dados = await resposta.json();
  return dados;
}


// =============================================
// BUSCAR PREVISÃO DE 5 DIAS
// =============================================

async function buscarPrevisao(cidade) {
  const url = `${URL_BASE}/forecast?q=${cidade}&appid=${CHAVE_API}&units=metric&lang=pt_br`;

  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error("Previsão não encontrada");
  }

  const dados = await resposta.json();
  return dados;
}


// =============================================
// EXIBIR CLIMA ATUAL NA TELA
// =============================================

function exibirClimaAtual(dados) {
  // Nome da cidade e país
  nomeCidadeEl.textContent = `${dados.name}, ${dados.sys.country}`;

  // Data de hoje formatada
  dataHojeEl.textContent = formatarData();

  // Ícone (emoji) e temperatura
  iconeClimaEl.textContent = obterEmoji(dados.weather[0].icon);
  temperaturaEl.textContent = `${Math.round(dados.main.temp)}°C`;

  // Descrição do clima (ex: "céu limpo")
  descricaoEl.textContent = dados.weather[0].description;

  // Detalhes
  sensacaoEl.textContent    = `${Math.round(dados.main.feels_like)}°C`;
  umidadeEl.textContent     = `${dados.main.humidity}%`;
  ventoEl.textContent       = `${Math.round(dados.wind.speed * 3.6)} km/h`; // converte m/s para km/h
  visibilidadeEl.textContent = `${(dados.visibility / 1000).toFixed(1)} km`;
}


// =============================================
// EXIBIR PREVISÃO DE 5 DIAS NA TELA
// =============================================

function exibirPrevisao(dados) {
  // A API retorna previsões a cada 3 horas — vamos pegar 1 por dia (ao meio-dia)
  const previsoesDiarias = dados.list.filter((item) => {
    return item.dt_txt.includes("12:00:00");
  });

  // Limpa a lista antes de preencher
  previsaoLista.innerHTML = "";

  // Pega até 5 dias
  previsoesDiarias.slice(0, 5).forEach((item) => {
    const dia = document.createElement("div");
    dia.classList.add("dia-card");

    dia.innerHTML = `
      <span class="dia-nome">${obterDiaSemana(item.dt)}</span>
      <span class="dia-icone">${obterEmoji(item.weather[0].icon)}</span>
      <span class="dia-temp">${Math.round(item.main.temp)}°</span>
    `;

    previsaoLista.appendChild(dia);
  });
}


// =============================================
// FUNÇÃO PRINCIPAL — une tudo
// =============================================

async function buscarTudo(cidade) {
  try {
    // Faz as duas buscas ao mesmo tempo (mais rápido)
    const [climaAtual, previsao] = await Promise.all([
      buscarClimaAtual(cidade),
      buscarPrevisao(cidade),
    ]);

    // Exibe tudo na tela
    exibirClimaAtual(climaAtual);
    exibirPrevisao(previsao);
    mostrarConteudo();

  } catch (erro) {
    // Se der erro, mostra a mensagem
    mostrarErro(true);
    console.error("Erro ao buscar clima:", erro);
  }
}


// =============================================
// EVENTOS — o que acontece quando o usuário age
// =============================================

// Clique no botão Buscar
btnBuscar.addEventListener("click", () => {
  const cidade = inputCidade.value.trim(); // .trim() remove espaços extras

  if (cidade === "") return; // se estiver vazio, não faz nada

  buscarTudo(cidade);
});

// Pressionar Enter no campo de texto
inputCidade.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    const cidade = inputCidade.value.trim();

    if (cidade === "") return;

    buscarTudo(cidade);
  }
});