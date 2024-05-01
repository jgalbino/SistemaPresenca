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

    if (Array.isArray(presentes)) {
      presentes.forEach((pessoa) => {
        if (!contagemPorPessoaPorTurma[turma][pessoa]) {
          contagemPorPessoaPorTurma[turma][pessoa] = 0;
        }
        contagemPorPessoaPorTurma[turma][pessoa]++;
      });
    }
  });

  const alunosSnapshot = await db.collection("Alunos").get();

  const totalPorAluno = {};

  alunosSnapshot.docs.forEach((doc) => {
    const alunoId = doc.id;
    const alunoData = doc.data();

    if (contagemPorPessoaPorTurma) {
      for (const turma in contagemPorPessoaPorTurma) {
        if (contagemPorPessoaPorTurma[turma][alunoId]) {
          const presencas = contagemPorPessoaPorTurma[turma][alunoId];
          const totalTurma = contagemPorTurma[turma];
          const porcentagem = ((presencas / totalTurma) * 100).toFixed(2);

          totalPorAluno[alunoId] = {
            nome: alunoData.nome,
            presenca: porcentagem,
            turma,
          };
        }
      }
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
    const totalPorAluno = await obterPresencaPorAluno();
    const agrupado = {};

    for (const alunoId in totalPorAluno) {
      const alunoData = totalPorAluno[alunoId];

      let chave;

      switch (agrupamento) {
        case "ano":
          chave = alunoData.turma; // Se "ano" significa "turma", ajuste aqui
          break;
        case "turma":
          chave = alunoData.turma;
          break;
        case "aluno":
          chave = alunoData.nome;
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
        presenca: alunoData.presenca,
      });
    }

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
        agrupamentoCell.textContent = chave;

        const detalhesCell = document.createElement("td");
        detalhesCell.textContent = aluno.nome;

        const presencaCell = document.createElement("td");
        presencaCell.textContent = `${aluno.presenca}%`;

        tr.appendChild(agrupamentoCell);
        tr.appendChild(detalhesCell);
        tr.appendChild(presencaCell);

        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    relatorioTabela.appendChild(table);

    return agrupado;
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
