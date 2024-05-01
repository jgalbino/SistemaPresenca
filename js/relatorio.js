// Configuração do Firebase
const config = {
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

// Função para calcular a presença por aluno
const obterPresencaPorAluno = async () => {
  const contagemPorTurma = {};
  const contagemPorPessoaPorTurma = {};

  const presencasSnapshot = await db.collection("Presenças").get();

  presencasSnapshot.docs.forEach((doc) => {
    const turma = doc.data().turma;
    const presentes = doc.data().presentes;

    if (!contagemPorTurma[turma]) {
      contagemPorTurma[turma] = 0;
      contagemPorPessoaPorTurma[turma] = {};
    }

    contagemPorTurma[turma]++;

    presentes.forEach((alunoId) => {
      if (!contagemPorPessoaPorTurma[turma][alunoId]) {
        contagemPorPessoaPorTurma[turma][alunoId] = 0;
      }
      contagemPorPessoaPorTurma[turma][alunoId]++;
    });
  });

  const alunosSnapshot = await db.collection("Alunos").get();

  const totalPorAluno = {};

  alunosSnapshot.docs.forEach((doc) => {
    const alunoId = doc.id;
    const alunoData = doc.data();

    for (const turma in contagemPorPessoaPorTurma) {
      if (contagemPorPessoaPorTurma[turma][alunoId]) {
        const presencas = contagemPorPessoaPorTurma[turma][alunoId];
        const totalTurma = contagemPorTurma[turma];
        const porcentagem = ((presencas / totalTurma) * 100).toFixed(2);

        totalPorAluno[alunoId] = {
          nome: alunoData.nome,
          turma,
          presenca: porcentagem,
        };
      }
    }
  });

  return totalPorAluno;
};

// Função para gerar relatório com agrupamento dinâmico (por aluno ou por turma)
const gerarRelatorio = async () => {
  const agrupamento = document.getElementById("select-agrupamento").value;
  const relatorioTabela = document.getElementById("relatorio-tabela");

  if (!agrupamento) {
    console.error("Critério de agrupamento não selecionado.");
    return;
  }

  relatorioTabela.innerHTML = ''; // Limpar a tabela antes de carregar

  try {
    const totalPorAluno = await obterPresencaPorAluno();
    const agrupado = {};

    for (const alunoId in totalPorAluno) {
      const alunoData = totalPorAluno[alunoId];

      let chave;
      switch (agrupamento) {
        case "aluno":
          chave = alunoData.nome; // Agrupar por nome do aluno
          break;
        case "turma":
          chave = alunoData.turma; // Agrupar por turma
          break;
        default:
          console.error("Critério de agrupamento inválido:", agrupamento);
          return;
      }

      if (!agrupado[chave]) {
        agrupado[chave] = [];
      }

      agrupado[chave].push({
        nome: alunoData.nome,
        turma: alunoData.turma,
        presenca: alunoData.presenca,
      });
    }

    // Criar a tabela do relatório
    const table = document.createElement("table");
    table.className = "table table-striped";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");

    trHead.appendChild(document.createElement("th")).textContent = agrupamento === "turma" ? "Turma" : "Aluno";
    trHead.appendChild(document.createElement("th")).textContent = agrupamento === "turma" ? "Alunos" : "Presença";

    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (const chave em agrupado) {
      const tr = document.createElement("tr");

      const chaveCell = document.createElement("td");
      chaveCell.textContent = chave; // Chave de agrupamento (nome do aluno ou turma)

      const detalhesCell = document.createElement("td");

      const detalhes = agrupamento === "turma"
        ? agrupado[chave].map(aluno => `${aluno.nome}: ${aluno.presenca}%`).join("; ") // Se agrupado por turma
        : `${agrupado[chave][0].presenca}%`; // Se agrupado por aluno

      detalhesCell.textContent = detalhes;

      tr.appendChild(chaveCell);
      tr.appendChild(detalhesCell);

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    relatorioTabela.appendChild(table);

    return agrupado;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
  }
};

// Vincular evento para gerar o relatório
document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);

// Função para baixar o relatório como arquivo de texto
const baixarRelatorioTXT = async () => {
  const agrupado = await gerarRelatorio();

  if (!agrupado) {
    console.error("Não foi possível gerar o relatório para baixar.");
    return;
  }

  let txtContent = agrupamento === "turma" ? "Relatório por Turma:\n\n" : "Relatório por Aluno:\n\n";

  for (const chave in agrupado) {
    txtContent += `- ${chave}\n`;

    if (agrupamento === "turma") {
      txtContent += agrupado[chave]
        .map(aluno => `  - ${aluno.nome}: ${aluno.presenca}%`)
        .join("\n");
    } else {
      txtContent += `  - Presença: ${agrupado[chave][0].presenca}%\n`;
    }

    txtContent += "\n";
  }

  const blob = new Blob([txtContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = agrupamento === "turma" ? "relatorio_por_turma.txt" : "relatorio_por_aluno.txt";
  a.click();

  URL.revokeObjectURL(url);
};

// Vincular eventos para gerar o relatório e baixar como TXT
document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);
document.getElementById("baixar-txt").addEventListener("click", baixarRelatorioTXT);

