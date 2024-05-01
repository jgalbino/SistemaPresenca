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

const obterPresencaPorAluno = async () => {
  const presencasSnapshot = await db.collection("Presenças").get();
  const alunosSnapshot = await db.collection("Alunos").get();

  const totalPorAluno = {};
  const contagemPorTurma = {};

  presencasSnapshot.docs.forEach((doc) => {
    const turma = doc.data().turma;
    const presentes = doc.data().presentes;

    if (!contagemPorTurma[turma]) {
      contagemPorTurma[turma] = 0;
    }

    contagemPorTurma[turma]++;

    presentes.forEach((alunoId) => {
      if (!totalPorAluno[alunoId]) {
        totalPorAluno[alunoId] = { presencas: 0, total: 0, nome: "" };
      }
      totalPorAluno[alunoId].presencas++;
      totalPorAluno[alunoId].total = contagemPorTurma[turma];
    });
  });

  alunosSnapshot.docs.forEach((doc) => {
    const alunoData = doc.data();
    const alunoId = doc.id;

    if (totalPorAluno[alunoId]) {
      totalPorAluno[alunoId].nome = alunoData.nome;
    }
  });

  return totalPorAluno;
};

const gerarRelatorio = async () => {
  const agrupamento = document.getElementById("select-agrupamento").value;
  const relatorioTabela = document.getElementById("relatorio-tabela");

  if (!agrupamento) {
    console.error("Critério de agrupamento não selecionado.");
    return;
  }

  relatorioTabela.innerHTML = ''; // Limpar a tabela antes de carregar

  try {
    const totalPorAluno = await obterPresencaPorAluno(); // Obter a porcentagem de presença
    const agrupado = {};

    for (const alunoId in totalPorAluno) {
      const alunoData = totalPorAluno[alunoId];
      const porcentagem = ((alunoData.presencas / alunoData.total) * 100).toFixed(2);

      let chave;

      switch (agrupamento) {
        case "ano":
          chave = alunosInfo[alunoId]?.ano || "Desconhecido";
          break;
        case "turma":
          chave = alunosInfo[alunoId]?.turma || "Desconhecido";
          break;
        case "aluno":
          chave = alunoData.nome || "Desconhecido";
          break;
        default:
          console.error("Critério de agrupamento inválido:", agrupamento);
          return;
      }

      if (!agrupado[chave]) {
        agrupado[chave] = [];
      }

      agrupado[chave].push({ nome: alunoData.nome, presenca: porcentagem });
    }

    // Criar tabela para exibição do relatório
    const table = document.createElement("table");
    table.className = "table table-striped";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    trHead.appendChild(document.createElement("th")).textContent = "Agrupamento";
    trHead.appendChild(document.createElement("th")).textContent = "Detalhes";
    trHead.appendChild(document.createElement("th")).textContent = "Presença";

    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (const chave in agrupado) {
      agrupado[chave].forEach((aluno) => {
        const tr = document.createElement("tr");

        const agrupamentoCell = document.createElement("td");
        agrupamentoCell.textContent = chave; // Exibe a chave do agrupamento

        const detalhesCell = document.createElement("td");
        detalhesCell.textContent = aluno.nome; // Exibe o nome do aluno

        const presencaCell = document.createElement("td");
        presencaCell.textContent = `${aluno.presenca}%`; // Exibe a porcentagem de presença

        tr.appendChild(agrupamentoCell);
        tr.appendChild(detalhesCell);
        tr.appendChild(presencaCell);

        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    relatorioTabela.appendChild(table);

    return agrupado; // Retorna para uso na função de download de texto
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
  }
};

const baixarRelatorioTXT = async () => {
  const agrupado = await gerarRelatorio();

  if (!agrupado) {
    console.error("Não foi possível gerar o relatório para baixar.");
    return;
  }

  let txtContent = "Relatório de Faltas:\n\n";

  for (const chave in agrupado) {
    agrupado[chave].forEach((aluno) => {
      txtContent += `Agrupamento: ${chave}\n`;
      txtContent += `Nome: ${aluno.nome}\n`;
      txtContent += `Presença: ${aluno.presenca}%\n\n`;
    });
  }

  const blob = new Blob([txtContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "relatorio_faltas.txt";
  a.click();

  URL.revokeObjectURL(url);
};

document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);
document.getElementById("baixar-txt").addEventListener("click", baixarRelatorioTXT);
