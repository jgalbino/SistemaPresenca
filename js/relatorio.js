//teste

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

const obterPresencas = async () => {
  const presencasSnapshot = await db.collection("Presenças").get();
  return presencasSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const obterAlunos = async () => {
  const alunosSnapshot = await db.collection("Alunos").get();
  return alunosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const obterRelatorioPorData = (presencas, alunos) => {
  const relatorio = {};

  presencas.forEach((presenca) => {
    const data = presenca.data; // Assumindo que há um campo 'data'
    const presentes = presenca.presentes;

    if (!relatorio[data]) {
      relatorio[data] = {};
    }

    presentes.forEach((alunoId) => {
      if (!relatorio[data][alunoId]) {
        relatorio[data][alunoId] = { alunoId, presencas: 0 };
      }
      relatorio[data][alunoId].presencas++;
    });
  });

  // Associar nomes de alunos
  alunos.forEach((aluno) => {
    for (const data in relatorio) {
      if (relatorio[data][aluno.id]) {
        relatorio[data][aluno.id].nome = aluno.nome;
      }
    }
  });

  return relatorio;
};

const obterRelatorioPorAno = (presencas, alunos) => {
  const relatorio = {};

  presencas.forEach((presenca) => {
    const ano = presenca.ano; // Assumindo que há um campo 'ano'
    const presentes = presenca.presentes;

    if (!relatorio[ano]) {
      relatorio[ano] = {};
    }

    presentes.forEach((alunoId) => {
      if (!relatorio[ano][alunoId]) {
        relatorio[ano][alunoId] = { alunoId, presencas: 0 };
      }
      relatorio[ano][alunoId].presencas++;
    });
  });

  alunos.forEach((aluno) => {
    for (const ano in relatorio) {
      if (relatorio[ano][aluno.id]) {
        relatorio[ano][aluno.id].nome = aluno.nome;
      }
    }
  });

  return relatorio;
};

const obterRelatorioPorTurma = (presencas, alunos) => {
  const relatorio = {};

  presencas.forEach((presenca) => {
    const turma = presenca.turma; // Assumindo que há um campo 'turma'
    const presentes = presenca.presentes;

    if (!relatorio[turma]) {
      relatorio[turma] = {};
    }

    presentes.forEach((alunoId) => {
      if (!relatorio[turma][alunoId]) {
        relatorio[turma][alunoId] = { alunoId, presencas: 0 };
      }
      relatorio[turma][alunoId].presencas++;
    });
  });

  alunos.forEach((aluno) => {
    for (const turma in relatorio) {
      if (relatorio[turma][aluno.id]) {
        relatorio[turma][aluno.id].nome = aluno.nome;
      }
    }
  });

  return relatorio;
};

const obterRelatorioPorAluno = (presencas, alunos) => {
  const relatorio = {};

  alunos.forEach((aluno) => {
    relatorio[aluno.id] = {
      nome: aluno.nome,
      presencas: 0,
    };
  });

  presencas.forEach((presenca) => {
    const presentes = presenca.presentes;

    presentes.forEach((alunoId) => {
      if (relatorio[alunoId]) {
        relatorio[alunoId].presencas++;
      }
    });
  });

  return relatorio;
};

const gerarTabela = (relatorio, tipo) => {
  const relatorioTabela = document.getElementById("relatorio-tabela");
  relatorioTabela.innerHTML = ''; // Limpar a tabela antes de carregar

  const table = document.createElement("table");
  table.className = "table table-striped";

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");

  if (tipo === "Data") {
    trHead.appendChild(document.createElement("th")).textContent = "Data";
    trHead.appendChild(document.createElement("th")).textContent = "Alunos Presentes";
  } else if (tipo === "Ano de Ensino") {
    trHead.appendChild(document.createElement("th")).textContent = "Ano de Ensino";
    trHead.appendChild(document.createElement("th")).textContent = "Alunos Presentes";
  } else if (tipo === "Turma") {
    trHead.appendChild(document.createElement("th")).textContent = "Turma";
    trHead.appendChild(document.createElement("th")).textContent = "Alunos Presentes";
  } else if (tipo === "Aluno") {
    trHead.appendChild(document.createElement("th")).textContent = "Aluno";
    trHead.appendChild(document.createElement("th")).textContent = "Presenças";
  }

  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  if (tipo === "Data") {
    for (const data in relatorio) {
      const tr = document.createElement("tr");
      const dataCell = document.createElement("td");
      const alunosCell = document.createElement("td");

      dataCell.textContent = data;
      alunosCell.textContent = Object.values(relatorio[data])
        .map((aluno) => `${aluno.nome}: ${aluno.presencas} presenças`)
        .join(", ");

      tr.appendChild(dataCell);
      tr.appendChild(alunosCell);
      tbody.appendChild(tr);
    }
  } else if (tipo === "Ano de Ensino") {
    for (const ano in relatorio) {
      const tr = document.createElement("tr");
      const anoCell = document.createElement("td");
      const alunosCell = document.createElement("td");

      anoCell.textContent = ano;
      alunosCell.textContent = Object.values(relatorio[ano])
        .map((aluno) => `${aluno.nome}: ${aluno.presencas} presenças`)
        .join(", ");

      tr.appendChild(anoCell);
      tr.appendChild(alunosCell);
      tbody.appendChild(tr);
    }
  } else if (tipo === "Turma") {
    for (const turma in relatorio) {
      const tr = document.createElement("tr");
      const turmaCell = document.createElement("td");
      const alunosCell = document.createElement("td");

      turmaCell.textContent = turma;
      alunosCell.textContent = Object.values(relatorio[turma])
        .map((aluno) => `${aluno.nome}: ${aluno.presencas} presenças`)
        .join(", ");

      tr.appendChild(turmaCell);
      tr.appendChild(alunosCell);
      tbody.appendChild(tr);
    }
  } else if (tipo === "Aluno") {
    Object.values(relatorio).forEach((aluno) => {
      const tr = document.createElement("tr");
      const alunoCell = document.createElement("td");
      const presencasCell = document.createElement("td");

      alunoCell.textContent = aluno.nome;
      presencasCell.textContent = aluno.presencas;

      tr.appendChild(alunoCell);
      tr.appendChild(presencasCell);
      tbody.appendChild(tr);
    });
  }

  table.appendChild(tbody);
  relatorioTabela.appendChild(table);
};

const gerarRelatorio = async () => {
  const opcao = document.getElementById("dropdown-filtro").value; // Assumindo que você tem um dropdown com ID "dropdown-filtro"
  const presencas = await obterPresencas();
  const alunos = await obterAlunos();

  let relatorio;
  if (opcao === "Data") {
    relatorio = obterRelatorioPorData(presencas, alunos);
    gerarTabela(relatorio, "Data");
  } else if (opcao === "Ano de Ensino") {
    relatorio = obterRelatorioPorAno(presencas, alunos);
    gerarTabela(relatorio, "Ano de Ensino");
  } else if (opcao === "Turma") {
    relatorio = obterRelatorioPorTurma(presencas, alunos);
    gerarTabela(relatorio, "Turma");
  } else if (opcao === "Aluno") {
    relatorio = obterRelatorioPorAluno(presencas, alunos);
    gerarTabela(relatorio, "Aluno");
  }
};

document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);



