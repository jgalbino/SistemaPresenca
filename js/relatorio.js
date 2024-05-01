//DEOKIY

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

// Função para obter presenças por turma e por data, com separação adequada
const obterPresencaPorTurmaEDatas = async () => {
  const dadosPorTurmaEDatas = {}; // Armazena as informações de presença por turma e por data

  const presencasSnapshot = await db.collection("Presenças").get(); // Obter todas as presenças

  // Loop para organizar as presenças por turma e data
  presencasSnapshot.docs.forEach((doc) => {
    const dataPresenca = doc.data().date; // Data da presença (corrigido para "date")
    const turma = doc.data().turma; // Turma associada
    const presentes = doc.data().presentes; // Lista de alunos presentes

    if (!dadosPorTurmaEDatas[turma]) {
      dadosPorTurmaEDatas[turma] = {}; // Inicializa a turma se ainda não existe
    }

    if (!dadosPorTurmaEDatas[turma][dataPresenca]) {
      dadosPorTurmaEDatas[turma][dataPresenca] = []; // Inicializa a lista de presenças para a data
    }

    presentes.forEach((alunoId) => {
      dadosPorTurmaEDatas[turma][dataPresenca].push(alunoId); // Adiciona o ID do aluno à lista de presenças para a data
    });
  });

  return dadosPorTurmaEDatas; // Retorna a estrutura de dados por turma e por data
};

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

    // Iterar sobre cada turma, cada data, e cada aluno para criar a tabela de forma clara
    for (const turma in dadosPorTurmaEDatas) {
      for (const dataPresenca in dadosPorTurmaEDatas[turma]) {
        const alunosPresentes = dadosPorTurmaEDatas[turma][dataPresenca]; // Lista de IDs de alunos presentes

        // Para cada aluno presente, adicione uma linha à tabela
        for (const alunoId of alunosPresentes) {
          try {
            const alunoSnapshot = await db.collection("Alunos").doc(alunoId).get();
            const nomeAluno = alunoSnapshot.exists ? alunoSnapshot.data().nome : "Desconhecido";

            const tr = document.createElement("tr");

            const turmaCell = document.createElement("td");
            turmaCell.textContent = turma;

            const dataCell = document.createElement("td");
            dataCell.textContent = dataPresenca; // Data da presença

            const alunoCell = document.createElement("td");
            alunoCell.textContent = nomeAluno;

            const presenteCell = document.createElement("td");
            presenteCell.textContent = "Sim"; // Sempre presente pois está na lista

            tr.appendChild(turmaCell);
            tr.appendChild(dataCell);
            tr.appendChild(alunoCell);
            tr.appendChild(presenteCell);

            tbody.appendChild(tr); // Adiciona a linha ao corpo da tabela
          } catch (error) {
            console.error("Erro ao obter o nome do aluno:", error);
          }
        }
      }
    }

    table.appendChild(tbody);
    relatorioTabela.appendChild(table); // Adicionar a tabela à página
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
  }
};

document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);
