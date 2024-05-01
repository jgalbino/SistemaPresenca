const gerarRelatorio = async () => {
  const relatorioTabela = document.getElementById("relatorio-tabela");
  relatorioTabela.innerHTML = ''; // Limpar a tabela antes de carregar
  let textoRelatorio = ''; // Variável para armazenar o texto do relatório

  try {
    const dadosPorTurmaEDatas = await obterPresencaPorTurmaEDatas(); // Obter os dados para o relatório

    // Cabeçalho do relatório para exibição
    const table = document.createElement("table");
    table.className = "table table-striped";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    trHead.appendChild(document.createElement("th")).textContent = "Turma";
    trHead.appendChild(document.createElement("th")).textContent = "Data";
    trHead.appendChild(document.createElement("th")).textContent = "Aluno";
    trHead.appendChild(document.createElement("th")).textContent = "Presente";

    thead.appendChild(trHead);
    table.appendChild(thead);

    // Cabeçalho para o texto do relatório
    textoRelatorio += 'Turma\tData\tAluno\tPresente\n'; // Adiciona o cabeçalho com tabulações

    const tbody = document.createElement("tbody");

    // Iterar sobre cada turma, cada data, e cada aluno para criar a tabela de forma clara
    for (const turma in dadosPorTurmaEDatas) {
      for (const dataPresenca in dadosPorTurmaEDatas[turma]) {
        const alunosPresentes = dadosPorTurmaEDatas[turma][dataPresenca];

        for (const alunoId of alunosPresentes) {
          try {
            const alunoSnapshot = await db.collection("Alunos").doc(alunoId).get();
            const nomeAluno = alunoSnapshot.exists ? alunoSnapshot.data().nome : "Desconhecido";

            const tr = document.createElement("tr");

            const turmaCell = document.createElement("td");
            turmaCell.textContent = turma;

            const dataCell = document.createElement("td");
            dataCell.textContent = dataPresenca;

            const alunoCell = document.createElement("td");
            alunoCell.textContent = nomeAluno;

            const presenteCell = document.createElement("td");
            presenteCell.textContent = "Sim"; // Sempre presente pois está na lista

            // Adicionar dados para a tabela HTML
            tr.appendChild(turmaCell);
            tr.appendChild(dataCell);
            tr.appendChild(alunoCell);
            tr.appendChild(presenteCell);

            tbody.appendChild(tr); // Adiciona ao corpo da tabela

            // Adicionar dados para o arquivo TXT
            textoRelatorio += `${turma}\t${dataPresenca}\t${nomeAluno}\tSim\n`;
          } catch (error) {
            console.error("Erro ao obter o nome do aluno:", error);
          }
        }
      }
    }

    table.appendChild(tbody);
    relatorioTabela.appendChild(table); // Adiciona a tabela à página

    // Criar um link para download do arquivo TXT
    const downloadLink = document.createElement("a");
    const blob = new Blob([textoRelatorio], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    downloadLink.href = url;
    downloadLink.download = 'relatorio_presencas.txt';
    downloadLink.textContent = 'Baixar Relatório';

    // Adicionar o link à página para permitir o download
    document.getElementById("download-relatorio").appendChild(downloadLink);

  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
  }
};

document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);
document.getElementById("baixar-txt").addEventListener("click", downloadLink);
