// Configuração do Firebase
let config = {
	apiKey: "AIzaSyDTVuDV0-cK9Nk6OvRV3IO8f563nPXTjuY",
	authDomain: "sistemaoctogono.firebaseapp.com",
	projectId: "sistemaoctogono",
	storageBucket: "sistemaoctogono.appspot.com",
	messagingSenderId: "415747300285",
	appId: "1:415747300285:web:2ae6ae2d51eefc7e1950d4"
};

// Inicializar Firebase
const app = firebase.initializeApp(config);
const db = firebase.firestore();

const gerarRelatorio = async () => {
  const agrupamento = document.getElementById("select-agrupamento").value;
  const relatorioTabela = document.getElementById("relatorio-tabela");

  if (!agrupamento) {
    console.error("Critério de agrupamento não selecionado.");
    return;
  }

  relatorioTabela.innerHTML = ''; // Limpar a tabela antes de carregar

  try {
    const querySnapshot = await db.collection("Presenças").get();
    const dados = querySnapshot.docs.map((doc) => doc.data());

    const agrupado = {};

    // Para agrupamento por "ano de ensino" ou "turma", precisamos de informações adicionais dos alunos
    let alunosInfo = {};
    if (agrupamento === "ano" || agrupamento === "turma" || agrupamento === "aluno") {
      const alunosSnapshot = await db.collection("Alunos").get();
      alunosInfo = alunosSnapshot.docs.reduce((map, doc) => {
        const alunoData = doc.data();
        map[doc.id] = alunoData; // Mapeia IDs para dados dos alunos
        return map;
      }, {});
    }

    dados.forEach((item) => {
      let chave;

      switch (agrupamento) {
        case "data":
          chave = item.date; // Campo de data do Firestore
          break;
        case "ano":
          chave = alunosInfo[item.presentes[0]]?.ano; // Ano de ensino do primeiro aluno presente
          break;
        case "turma":
          chave = item.turma; // Identificação da turma
          break;
        case "aluno":
          chave = alunosInfo[item.presentes[0]]?.nome; // Nome do primeiro aluno presente
          break;
        default:
          console.error("Critério de agrupamento inválido:", agrupamento);
          return;
      }

      if (typeof chave === "undefined") {
        console.error("Chave para agrupamento indefinida:", item);
        return; // Se chave estiver indefinida, retorne para evitar erro
      }

      if (!agrupado[chave]) {
        agrupado[chave] = new Set(); // Usar set para eliminar duplicatas
      }

      item.presentes.forEach((id) => {
        const nome = alunosInfo[id]?.nome || "Desconhecido";
        agrupado[chave].add(nome); // Adicionar ao set
      });
    });

    // Criar tabela para exibição do relatório
    const table = document.createElement("table");
    table.className = "table table-striped";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    trHead.appendChild(document.createElement("th")).textContent = "Agrupamento";
    trHead.appendChild(document.createElement("th")).textContent = "Detalhes";

    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (const chave in agrupado) {
      const tr = document.createElement("tr");

      const agrupamentoCell = document.createElement("td");
      agrupamentoCell.textContent = chave; // Exibe a chave do agrupamento

      const detalhesCell = document.createElement("td");

      // Criar uma lista única de nomes sem duplicatas
      const detalhes = Array.from(agrupado[chave]).join("; ");

      detalhesCell.textContent = detalhes;

      tr.appendChild(agrupamentoCell);
      tr.appendChild(detalhesCell);

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    relatorioTabela.appendChild(table);

    return agrupado; // Retorna para uso na função de download de texto
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
  }
};

// Vincular evento para gerar o relatório
document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);


// Função para baixar relatório como arquivo de texto
const baixarRelatorioTXT = async () => {
    const agrupado = await gerarRelatorio();

    if (!agrupado) {
        console.error("Não foi possível gerar o relatório para baixar.");
        return;
    }

    // Criar o conteúdo do arquivo TXT
    let txtContent = "Relatório de Faltas:\n\n";

    for (const chave in agrupado) {
        txtContent += `Agrupamento: ${chave}\n`;
        txtContent += "Detalhes:\n";

        agrupado[chave].forEach((item) => {
            txtContent += `  - ${item.presentes.join(", ")}\n`;
        });

        txtContent += "\n";
    }

    // Criar um Blob para o arquivo TXT
    const blob = new Blob([txtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Criar um link para download do arquivo TXT
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_faltas.txt";
    a.click(); // Clicar para iniciar o download

    URL.revokeObjectURL(url); // Limpar o objeto após download
};

// Vincular evento para gerar o relatório
document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);

// Vincular evento para baixar relatório como TXT
document.getElementById("baixar-txt").addEventListener("click", baixarRelatorioTXT);
