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

const obterPresencaPorTurma = async () => {
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

  alunosSnapshot.docs.forEach((doc) => {
    const alunoId = doc.id;
    const alunoData = doc.data();

    if (contagemPorPessoaPorTurma) {
      for (const turma in contagemPorPessoaPorTurma) {
        if (contagemPorPessoaPorTurma[turma][alunoId]) {
          const presencas = contagemPorPessoaPorTurma[turma][alunoId];
          const totalTurma = contagemPorTurma[turma];
          const porcentagem = ((presencas / totalTurma) * 100).toFixed(2);

          if (!contagemPorPessoaPorTurma[turma][alunoId]) {
            contagemPorPessoaPorTurma[turma][alunoId] = {};
          }

          contagemPorPessoaPorTurma[turma][alunoId] = {
            nome: alunoData.nome,
            presenca: porcentagem,
          };
        }
      }
    }
  });

  return contagemPorPessoaPorTurma; // Retorna informações por turma
};

const gerarRelatorio = async () => {
  const relatorioTabela = document.getElementById("relatorio-tabela");
  relatorioTabela.innerHTML = ''; // Limpar a tabela antes de carregar

  try {
    const totalPorTurma = await obterPresencaPorTurma();

    // Criar tabela para exibição do relatório
    const table = document.createElement("table");
    table.className = "table table-striped";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    trHead.appendChild(document.createElement("th")).textContent = "Turma";
    trHead.appendChild(document.createElement("th")).textContent = "Alunos e Presenças";

    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (const turma in totalPorTurma) {
      const tr = document.createElement("tr");

      const turmaCell = document.createElement("td");
      turmaCell.textContent = turma;

      const detalhesCell = document.createElement("td");

      const detalhes = Object.values(totalPorTurma[turma])
        .map((aluno) => `${aluno.nome}: ${aluno.presenca}%`)
        .join("; ");

      detalhesCell.textContent = detalhes;

      tr.appendChild(turmaCell);
      tr.appendChild(detalhesCell);

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    relatorioTabela.appendChild(table);

    return totalPorTurma; // Retorna para uso na função de download
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
  }
};

// Função para baixar relatório como arquivo de texto
const baixarRelatorioTXT = async () => {
  const totalPorTurma = await gerarRelatorio();

  if (!totalPorTurma) {
    console.error("Não foi possível gerar o relatório para baixar.");
    return;
  }

  let txtContent = "Relatório por Turma:\n\n";

  for (const turma in totalPorTurma) {
    txtContent += `Turma: ${turma}\n`;

    txtContent += Object.values(totalPorTurma[turma])
      .map((aluno) => `- ${aluno.nome}: ${aluno.presenca}%`)
      .join("\n");

    txtContent += "\n";
  }

  const blob = new Blob([txtContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "relatorio_por_turma.txt";
  a.click();

  URL.revokeObjectURL(url);
};

// Vincular evento para gerar o relatório
document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);
document.getElementById("baixar-txt").addEventListener("click", baixarRelatorioTXT);



