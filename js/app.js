// Inicialização do Firebase (deve estar definida no config.js)
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// Função para carregar turmas únicas para o filtro de turma
function loadUniqueTurmas() {
    db.collection('alunos')
        .get()
        .then((querySnapshot) => {
            const turmas = new Set(); // Armazenar valores únicos
            querySnapshot.forEach((doc) => {
                const turma = doc.data().turma; // Campo 'turma' do aluno
                if (turma) {
                    turmas.add(turma); // Adicionar ao conjunto de turmas únicas
                }
            });

            const selectElement = document.getElementById('filterTurma');
            selectElement.innerHTML = ''; // Limpar opções existentes

            turmas.forEach((turma) => {
                const option = document.createElement('option');
                option.value = turma;
                option.text = turma;
                selectElement.appendChild(option); // Adicionar ao dropdown
            });

            // Adicionar uma opção para limpar filtro
            const clearOption = document.createElement('option');
            clearOption.value = ''; // Valor vazio para limpar
            clearOption.text = 'Todas as turmas'; // Texto para exibir
            selectElement.appendChild(clearOption);
        })
        .catch((error) => {
            console.error("Erro ao carregar turmas: ", error);
        });
}

// Função para carregar dados dos alunos na tabela com filtros aplicados
function loadAlunos() {
    const filterDate = document.getElementById('filterDate').value;
    const filterTurma = document.getElementById('filterTurma').value;

    let query = db.collection('alunos');

    if (filterDate) {
        query = query.where('dataPresenca', '==', filterDate); // Filtro por data
    }

    if (filterTurma) {
        query = query.where('turma', '==', filterTurma); // Filtro por turma
    }

    query
        .get()
        .then((querySnapshot) => {
            const dataElement = document.getElementById('data');
            dataElement.innerHTML = ''; // Limpar tabela antes de adicionar novos dados

            querySnapshot.forEach((doc) => {
                const aluno = doc.data();
                const row = document.createElement('tr');

                const nomeCell = document.createElement('td');
                nomeCell.textContent = aluno.nome;
                row.appendChild(nomeCell);

                const matriculaCell = document.createElement('td');
                matriculaCell.textContent = aluno.matricula;
                row.appendChild(matriculaCell);

                const turmaCell = document.createElement('td');
                turmaCell.textContent = aluno.turma;
                row.appendChild(turmaCell);

                // Campo para data de presença, com valor padrão 'N/A' se não existir
                const dataPresencaCell = document.createElement('td');
                dataPresencaCell.textContent = aluno.dataPresenca || 'N/A';
                row.appendChild(dataPresencaCell);

                dataElement.appendChild(row); // Adicionar linha à tabela
            });
        })
        .catch((error) => {
            console.error("Erro ao carregar dados dos alunos: ", error);
        });
}

// Função para logout
function logout() {
    firebase.auth().signOut().then(() => {
        console.log("Logout bem-sucedido");
        window.location.href = "index.html"; // Redirecionar após logout
    }).catch((error) => {
        console.error("Erro ao fazer logout:", error);
    });
}

// Eventos para aplicar filtros
document.getElementById('filterTurma').addEventListener('change', loadAlunos); // Filtro por turma
document.getElementById('filterDate').addEventListener('change', loadAlunos); // Filtro por data

// Carregar dados iniciais
loadUniqueTurmas(); // Carregar turmas únicas
loadAlunos(); // Carregar alunos ao iniciar
