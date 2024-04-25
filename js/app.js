// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore(); // Referência ao Firestore

// Função para carregar turmas únicas para o filtro de turma
function loadUniqueTurmas() {
    db.collection('alunos')
        .get() // Obter todos os documentos
        .then((querySnapshot) => {
            const turmas = new Set(); // Para armazenar turmas únicas
            querySnapshot.forEach((doc) => {
                const turma = doc.data().turma; // Campo 'turma' no documento
                if (turma) {
                    turmas.add(turma); // Adicionar ao conjunto de turmas
                }
            });

            const selectElement = document.getElementById('filterTurma'); // Referência ao select
            selectElement.innerHTML = ''; // Limpar opções existentes

            // Adicionar opção para todas as turmas
            const allOption = document.createElement('option');
            allOption.value = ''; // Valor para indicar todas as turmas
            allOption.text = 'Todas as turmas';
            selectElement.appendChild(allOption);

            // Adicionar turmas únicas ao select
            turmas.forEach((turma) => {
                const option = document.createElement('option');
                option.value = turma; // Valor do option
                option.text = turma; // Texto do option
                selectElement.appendChild(option); // Adicionar ao select
            });
        })
        .catch((error) => {
            console.error("Erro ao carregar turmas:", error); // Log para erros
        });
}

// Função para carregar dados dos alunos na tabela com filtros aplicados
function loadAlunos() {
    const filterDate = document.getElementById('filterDate').value; // Filtro de data
    const filterTurma = document.getElementById('filterTurma').value; // Filtro de turma

    let query = db.collection('alunos'); // Inicia consulta ao Firestore

    if (filterDate) {
        // Supondo que há um campo de data de presença, como 'dataPresenca'
        query = query.where('dataPresenca', '==', filterDate);
    }

    if (filterTurma) {
        query = query.where('turma', '==', filterTurma); // Filtrar por turma
    }

    query
        .get() // Executar a consulta ao Firestore
        .then((querySnapshot) => {
            const dataElement = document.getElementById('data'); // Referência à tabela
            dataElement.innerHTML = ''; // Limpar a tabela antes de adicionar

            // Adicionar alunos à tabela
            querySnapshot.forEach((doc) => {
                const aluno = doc.data(); // Dados do aluno
                const row = document.createElement('tr'); // Criar linha

                // Colunas para nome, matrícula, turma, e data de presença
                const nomeCell = document.createElement('td');
                nomeCell.textContent = aluno.nome; // Nome do aluno
                row.appendChild(nomeCell);

                const matriculaCell = document.createElement('td');
                matriculaCell.textContent = aluno.matricula; // Matrícula do aluno
                row.appendChild(matriculaCell);

                const turmaCell = document.createElement('td');
                turmaCell.textContent = aluno.turma; // Turma do aluno
                row.appendChild(turmaCell);

                const dataPresencaCell = document.createElement('td');
                dataPresencaCell.textContent = aluno.dataPresenca ? aluno.dataPresenca : 'N/A'; // Data de presença
                row.appendChild(dataPresencaCell);

                // Adiciona a linha à tabela
                dataElement.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Erro ao carregar dados dos alunos:", error); // Log para erros
        });
}

// Eventos para aplicar filtros
document.getElementById('filterDate').addEventListener('change', loadAlunos); // Alteração no filtro de data
document.getElementById('filterTurma').addEventListener('change', loadAlunos); // Alteração no filtro de turma

// Carregar turmas e alunos ao iniciar
loadUniqueTurmas(); // Carregar turmas únicas para o filtro
loadAlunos(); // Carregar alunos para a tabela

