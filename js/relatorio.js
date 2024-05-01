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

// Função para obter informações de presença por aluno, incluindo ano e data
const obterPresencaPorAluno = async () => {
  const contagemPorTurma = {};
  const contagemPorPessoaPorTurma = {};

  const presencasSnapshot = await db.collection("Presenças").get();

  presencasSnapshot.docs.forEach((doc) => {
    const turma = doc.data().turma;
    const presentes = doc.data().presentes;
    const data = doc.data().date; // Data da presença

    if (!contagemPorTurma[turma]) {
      contagemPorTurma[turma] = 0;
      contagemPorPessoaPorTurma[turma] = {};
    }

    contagemPorTurma[turma]++;

    presentes.forEach((alunoId) => {
      if (!contagemPorPessoaPorTurma[turma][alunoId]) {
        contagemPorPessoaPorTurma[turma][alunoId] = {
          presencas: 0,
          total: 0,
          nome: "",
          datas: [],
        };
      }
      contagemPorPessoaPorTurma[turma][alunoId].presencas++;
      contagemPorPessoaPorTurma[turma][alunoId].datas.push(data);
    });
  });

  const alunosSnapshot = await db.collection("Alunos").get();

  alunosSnapshot.docs.forEach((doc) => {
    const alunoId = doc.id;
    const alunoData = doc.data();

    if (contagemPorPessoaPorTurma) {
      for (const turma in contagemPorPessoaPorTurma) {
        if (contagemPorPessoaPorTurma[turma][alunoId]) {
          const aluno = contagemPorPessoaPorTurma[turma][alunoId];
          const totalTurma = contagemPorTurma[turma];
          const porcentagem = ((aluno.presencas / totalTurma) * 100).toFixed(2);

          aluno.nome = alunoData.nome;
          aluno.turma = turma;
          aluno.ano = alunoData.ano;
          aluno.presenca = porcentagem;
        }
      }
    }
  });

  return contagemPorPessoaPorTurma;
};

// Função para gerar relatório com agrupamento dinâmico (por aluno, turma, data ou ano)
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

    for (const turma in totalPorAluno) {
      for (const alunoId in totalPorAluno[turma]) {
        const alunoData = totalPorAluno[turma][alunoId];

        let chave;
        switch (agrupamento) {
          case "aluno":
            chave = alunoData.nome; // Agrupar por nome do aluno
            break;
          case "turma":
            chave = alunoData.turma; // Agrupar por turma
            break;
          case "data":
            chave = alunoData.datas.join(", "); // Agrupar por data (unir datas)
            break;
          case "ano":
            chave = alunoData.ano; // Agrupar por ano de ensino
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
          datas: alunoData.datas,
        });
      }
    }

    // Criar a tabela do relatório
    const table = document.createElement("table");
    table.className = "table table-striped";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");

    trHead.appendChild(document.createElement("th")).textContent = agrupamento;
    trHead.appendChild(document.createElement("th")).textContent = "Detalhes";

    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (const chave em agrupado) {
      agrupado[chave].forEach((aluno) => {
        const tr = document.createElement("tr");

        const chaveCell = document.createElement("td");
        chaveCell.textContent = chave;

        const detalhesCell = document.createElement("td");

        const detalhes = agrupamento === "aluno" || agrupamento === "ano"
          ? `Turma: ${aluno.turma}, Presença: ${aluno.presenca}%` 
          : `${aluno.nome}: ${aluno.presenca}%`;

        detalhesCell.textContent = detalhes;

        tr.appendChild(chaveCell);
        tr.appendChild(detalhesCell);

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

// Função para baixar o relatório como arquivo de texto
const baixarRelatorioTXT = async () => {
  const agrupado = await gerarRelatorio();

  if (!agrupado) {
    console.error("Não foi possível gerar o relatório para baixar.");
    return;
  }

  const agrupamento = document.getElementById("select-agrupamento").value;

  let txtContent = `Relatório por ${agrupamento}:\n\n`;

  for (const chave in agrupado) {
    txtContent += `- ${chave}\n`;

    if (agrupamento === "data") {
      txtContent += agrupado[chave]
        .map(aluno => `  - ${aluno.nome}: ${aluno.presenca}%`)
        .join("\n");
    } else {
      txtContent += agrupado[chave]
        .map(aluno => `  - ${aluno.nome}: ${aluno.presenca}%`)
        .join("\n");
    }

    txtContent += "\n";
  }

  const blob = new Blob([txtContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio_por_${agrupamento}.txt`;
  a.click();

  URL.revokeObjectURL(url);
};

// Vincular evento para gerar o relatório
document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);

// Vincular evento para baixar o relatório como TXT
document.getElementById("baixar-txt").addEventListener("click", baixarRelatorioTXT);


