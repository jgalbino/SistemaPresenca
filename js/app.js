// Inicialize o Firebase com a configuração correta
firebase.initializeApp(firebaseConfig); 
var db = firebase.firestore(); // Referência ao Firestore

// Função para carregar turmas únicas para o filtro de turma
function loadUniqueTurmas() {
    db.collection('alunos') // Referência à coleção de alunos
        .get() // Obter todos os documentos
        .then((querySnapshot) => {
            const turmas = new Set(); // Usar Set para valores únicos
            querySnapshot.forEach((doc) => {
                const turma = doc.data().turma; // Campo 'turma'
                if (turma) {
                    turmas.add(turma); // Adicionar ao conjunto
                }
            });

            // Adicionar turmas ao select
            const selectElement = document.getElementById('filterTurma'); 
            selectElement.innerHTML = ''; // Limpar antes de adicionar
            turmas.forEach((turma) => {
                const option = document.createElement('option');
                option.value = turma;
                option.text = turma;
                selectElement.appendChild(option); // Adicionar ao select
            });

            // Adicionar opção para limpar o filtro
            const clearOption = document.createElement('option');
            clearOption.value = ''; // Valor vazio para "todas as turmas"
            clearOption.textContent = 'Todas as turmas'; // Texto exibido
            selectElement.appendChild(clearOption);
        })
        .catch((error) => {
            console.error("Erro ao carregar turmas:", error); // Captura erros
        });
}

// Função para carregar alunos na tabela, com filtros aplicados
function loadAlunos() {
    const filterDate = document.getElementById('filterDate').value; // Filtro de data
    const filterTurma = document.getElementById('filterTurma').value; // Filtro de turma

    let query = db.collection('alunos'); // Inicializa query básica

    if (filterDate) {
        query = query.where('dataPresenca', '==', filterDate); // Filtrar por data
    }

    if (filterTurma) {
        query = query.where('turma', '==', filterTurma); // Filtrar por turma
    }

    query.get() // Executar query
        .then((querySnapshot) => {
            const dataElement = document.getElementById('data'); 
            dataElement.innerHTML = ''; // Limpar tabela antes de adicionar

            querySnapshot.forEach((doc) => {
                const aluno = doc.data(); 
                const row = document.createElement('tr'); // Criação de linha

                // Colunas para os dados do aluno
                const nomeCell = document.createElement('td');
                nomeCell.textContent = aluno.nome;
                row.appendChild(nomeCell);

                const matriculaCell = document.createElement('td');
                matriculaCell.textContent = aluno.matricula;
                row.appendChild(matriculaCell);

                const turmaCell = document.createElement('td');
                turmaCell.textContent = aluno.turma;
                row.appendChild(turmaCell);

                // Data de presença com valor padrão "N/A" caso não exista
                const dataPresencaCell = document.createElement('td');
                dataPresencaCell.textContent = aluno.dataPresenca ? aluno.dataPresenca : 'N/A';
                row.appendChild(dataPresencaCell);

                // Adiciona a linha à tabela
                dataElement.appendChild(row);
            });
        })
        .catch((error) => {
            console.error("Erro ao carregar dados dos alunos:", error); // Captura erros
        });
}

// Função para logout
function logout() {
    firebase.auth().signOut().then(() => {
        console.log("Logout bem-sucedido");
        window.location.href = "index.html"; // Redirecionar após logout
    }).catch((error) => {
        console.error("Erro ao fazer logout:", error); // Captura erro de logout
    });
}

// Eventos para aplicar filtros
document.getElementById('filterDate').addEventListener('change', loadAlunos); // Filtro de data
document.getElementById('filterTurma').addEventListener('change', loadAlunos); // Filtro de turma

// Inicializar ao carregar a página
loadUniqueTurmas(); // Carregar turmas únicas para o filtro
loadAlunos(); // Carregar alunos na tabela

