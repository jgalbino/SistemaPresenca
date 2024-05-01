// Função para obter todos os alunos por turma para garantir que a presença é registrada mesmo quando ausente
const obterAlunosPorTurma = async () => {
  const alunosPorTurma = {}; // Armazena alunos por turma

  const alunosSnapshot = await db.collection("Alunos").get();

  alunosSnapshot.docs.forEach((doc) => {
    const alunoId = doc.id;
    const alunoData = doc.data();
    const turma = alunoData.turma; // Turma do aluno

    if (!alunosPorTurma[turma]) {
      alunosPorTurma[turma] = [];
    }

    alunosPorTurma[turma].push({ id: alunoId, nome: alunoData.nome }); // Armazena o ID e o nome do aluno
  });

  return alunosPorTurma;
};

// Função para gerar o relatório
const gerarRelatorio = async () => {
  const relatorioTabela = document.getElementById("relatorio-tabela");
  relatorioTabela.innerHTML = ''; // Limpar a tabela antes de carregar

  try {
    const dadosPorTurmaEDatas = await obterPresencaPorTurmaEDatas(); // Obter presenças
    const alunosPorTurma = await obterAlunosPorTurma(); // Obter todos os alunos por turma

    // Criar a tabela para exibição do relatório
    const table = document.createElement("table");
    table.className = "table table-striped";

    // Cabeçalho da tabela
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    trHead.appendChild(document.createElement("th")).textContent = "Turma";
    trHead.appendChild(document.createElement("th")).textContent = "Data";
    trHead.appendChild(document.createElement("th")).textContent = "Aluno";
    trHead.appendChild(document.createElement("th")).textContent = "Presente";

    thead.appendChild(trHead);
    table.appendChild(thead);

    // Corpo da tabela
    const tbody = document.createElement("tbody");

    // Iterar sobre cada turma e cada data para garantir que todos os alunos são listados
    for (const turma in dadosPorTurmaEDatas) {
      for (const dataPresenca in dadosPorTurmaEDatas[turma]) {
        const alunosPresentes = dadosPorTurmaEDatas[turma][dataPresenca]; // Lista de IDs de alunos presentes

        // Obter todos os alunos desta turma
        const todosAlunos = alunosPorTurma[turma] || []; // Lista de todos os alunos por turma

        // Adicionar linha para cada aluno na turma, indicando se estava presente ou não
        todosAlunos.forEach(async (aluno) => {
          let presente = alunosPresentes.includes(aluno.id); // Verifica se o aluno estava presente

          const tr = document.createElement("tr");

          const turmaCell = document.createElement("td");
          turmaCell.textContent = turma;

          const dataCell = document.createElement("td");
          dataCell.textContent = dataPresenca; // Data da presença

          const alunoCell = document.createElement("td");
          alunoCell.textContent = aluno.nome;

          const presenteCell = document.createElement("td");
          presenteCell.textContent = presente ? "Sim" : "Não"; // Indica se estava presente ou não

          tr.appendChild(turmaCell);
          tr.appendChild(dataCell);
          tr.appendChild(alunoCell);
          tr.appendChild(presenteCell);

          tbody.appendChild(tr); // Adiciona a linha ao corpo da tabela
        });
      }
    }

    table.appendChild(tbody);
    relatorioTabela.appendChild(table); // Adicionar a tabela à página
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
  }
};

document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio); // Vincula evento ao botão

