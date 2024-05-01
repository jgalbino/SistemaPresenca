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

// Função para obter presença por turma e por data
const obterPresencaPorTurmaEDatas = async () => {
  const dadosPorTurmaEDatas = {}; // Armazena as informações de presença por turma e por data

  const presencasSnapshot = await db.collection("Presenças").get(); // Obter todas as presenças

  presencasSnapshot.docs.forEach((doc) => {
    const dataPresenca = doc.data().data; // Data da presença
    const turma = doc.data().turma; // Turma associada
    const presentes = doc.data().presentes; // Lista de alunos presentes

    if (!dadosPorTurmaEDatas[turma]) {
      dadosPorTurmaEDatas[turma] = {}; // Inicializa a turma se ainda não existe
    }

    if (!dadosPorTurmaEDatas[turma][dataPresenca]) {
      dadosPorTurmaEDatas[turma][dataPresenca] = {}; // Inicializa a data se ainda não existe
    }

    presentes.forEach((alunoId) => {
      dadosPorTurmaEDatas[turma][dataPresenca][alunoId] = true; // Marca como presente
    });
  });

  const alunosSnapshot = await db.collection("Alunos").get(); // Obter todos os alunos

  alunosSnapshot.docs.forEach((doc) => {
    const alunoId = doc.id; // ID do aluno
    const alunoData = doc.data(); // Dados do aluno

    // Itera sobre as turmas para garantir que todos os alunos são incluídos, mesmo que não estejam presentes
    for (const turma in dadosPorTurmaEDatas) {
      for (const dataPresenca in dadosPorTurmaEDatas[turma]) {
        if (!dadosPorTurmaEDatas[turma][dataPresenca][alunoId]) {
          dadosPorTurmaEDatas[turma][dataPresenca][alunoId] = false; // Marca como ausente
        }
      }
    }
  });

  return dadosPorTurmaEDatas; // Retorna a estrutura de dados por turma e por data
};

// Função para gerar o relatório
// Função para gerar o relatório
const gerarRelatorio = async () => {
  const relatorioTabela = document.getElementById("relatorio-tabela");
  relatorioTabela.innerHTML = ''; // Limpar a tabela antes de carregar

  try {
    const dadosPorTurmaEDatas = await obterPresencaPorTurmaEDatas(); // Obter os dados para o relatório

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

    // Iterar sobre cada turma, cada data, e cada aluno para criar a tabela
    for (const turma in dadosPorTurmaEDatas) {
      for (const dataPresenca in dadosPorTurmaEDatas[turma]) {
        for (const alunoId in dadosPorTurmaEDatas[turma][dataPresenca]) {
          const alunoPresente = dadosPorTurmaEDatas[turma][dataPresenca][alunoId];
          let nomeAluno = ""; // Inicializa o nome do aluno

          try {
            const alunoSnapshot = await db.collection("Alunos").doc(alunoId).get();
            nomeAluno = alunoSnapshot.exists ? alunoSnapshot.data().nome : "Aluno não encontrado"; // Obtém o nome do aluno ou define uma mensagem padrão se não encontrado
          } catch (error) {
            console.error("Erro ao obter o nome do aluno:", error);
            nomeAluno = "Erro ao obter o nome do aluno";
          }

          const tr = document.createElement("tr");

          const turmaCell = document.createElement("td");
          turmaCell.textContent = turma;

          const dataCell = document.createElement("td");
          dataCell.textContent = dataPresenca;

          const alunoCell = document.createElement("td");
          alunoCell.textContent = nomeAluno;

          const presenteCell = document.createElement("td");
          presenteCell.textContent = alunoPresente ? "Sim" : "Não";

          tr.appendChild(turmaCell);
          tr.appendChild(dataCell);
          tr.appendChild(alunoCell);
          tr.appendChild(presenteCell);

          tbody.appendChild(tr);
        }
      }
    }

    table.appendChild(tbody);
    relatorioTabela.appendChild(table); // Adicionar a tabela à página
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
  }
};


// Função para baixar o relatório como arquivo de texto
const baixarRelatorioTXT = async () => {
  const dadosPorTurmaEDatas = await obterPresencaPorTurmaEDatas();

  if (!dadosPorTurmaEDatas) {
    console.error("Não foi possível gerar o relatório para baixar.");
    return;
  }

  let txtContent = "Relatório por Turma e Data:\n\n";

  for (const turma in dadosPorTurmaEDatas) {
    for (const dataPresenca in dadosPorTurmaEDatas[turma]) {
      txtContent += `Data: ${dataPresenca} - Turma: ${turma}\n`;

      for (const alunoId in dadosPorTurmaEDatas[turma][dataPresenca]) {
        const alunoPresente = dadosPorTurmaEDatas[turma][dataPresenca][alunoId];
        const alunoSnapshot = await db.collection("Alunos").doc(alunoId).get();
        const nomeAluno = alunoSnapshot.data().nome;

        txtContent += `- ${nomeAluno}: ${alunoPresente ? "Sim" : "Não"}\n`;
      }

      txtContent += "\n";
    }
  }

  const blob = new Blob([txtContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "relatorio_por_turma_e_data.txt";
  a.click();

  URL.revokeObjectURL(url); // Limpar o objeto URL após o download
};

// Vincular evento para gerar o relatório
document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);
document.getElementById("baixar-txt").addEventListener("click", baixarRelatorioTXT);
