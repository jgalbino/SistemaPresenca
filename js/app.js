// Inicialização do Firebase
// Certifique-se de que firebaseConfig está definido no seu arquivo config.js
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
                    turmas.add(turma); // Adicionar à lista de turmas únicas
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
        // Supomos que há um campo de data de presença, como 'dataPresenca'
        query = query.where('dataPresenca', '==', filterDate);
    }

    if (filterTurma) {
        query = query.where('turma', '==', filterTurma);
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

                dataElement.appendChild(row); // Adicionar linha à tabela
            });
        })
        .catch((error) => {
            console.error("Erro ao carregar dados dos alunos: ", error);
        });
}

// Eventos para aplicar filtros
document.getElementById('filterDate').addEventListener('change', loadAlunos);
document.getElementById('filterTurma').addEventListener('change', loadAlunos);

// Inicializar filtros e carregar dados
loadUniqueTurmas(); // Carregar turmas únicas
loadAlunos(); // Carregar dados ao iniciar
