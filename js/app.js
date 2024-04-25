// Referência ao Firestore
var db = firebase.firestore();

// Referência para a coleção de alunos
var alunosRef = db.collection("alunos");

// Limpa o conteúdo anterior antes de adicionar novos dados
document.getElementById("data").innerHTML = "";

// Obter todos os documentos da coleção
alunosRef.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        if (doc.exists) {
            // Exibir dados na página HTML
            var data = doc.data();
            var nome = data.nome;
            var matricula = data.matricula;
            var turma = data.turma;

            // Adiciona os dados na tabela
            var tableRow = "<tr><td>" + nome + "</td><td>" + matricula + "</td><td>" + turma + "</td></tr>";
            document.getElementById("data").innerHTML += tableRow;
        } else {
            console.log("Documento não encontrado:", doc.id);
        }
    });
}).catch(function(error) {
    console.log("Erro ao obter documentos:", error);
});

        function logout() {
            firebase.auth().signOut().then(function() {
                // Logout bem-sucedido
                console.log("Logout bem-sucedido");
                // Redirecionar para a página de login ou outra página de sua escolha
                window.location.href = "index.html";
            }).catch(function(error) {
                // Tratar erros de logout
                console.log("Erro ao fazer logout:", error);
            });
        }

// Função para carregar turmas únicas para o filtro de turma
function loadUniqueTurmas() {
    db.collection('alunos')  // Coleção de dados dos alunos no Firestore
        .get()
        .then((querySnapshot) => {
            const turmas = new Set();  // Usar Set para obter valores únicos
            querySnapshot.forEach((doc) => {
                const turma = doc.data().turma;  // Campo 'turma' do aluno
                if (turma) {
                    turmas.add(turma);
                }
            });

            const selectElement = document.getElementById('filterTurma');
            selectElement.innerHTML = '';  // Limpar o select antes de preencher

            turmas.forEach((turma) => {
                const option = document.createElement('option');
                option.value = turma;
                option.text = turma;
                selectElement.appendChild(option);
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
        // Supondo que haja um campo de data de presença, como 'dataPresenca'
        query = query.where('dataPresenca', '==', filterDate);
    }

    if (filterTurma) {
        query = query.where('turma', '==', filterTurma);
    }

    query
        .get()
        .then((querySnapshot) => {
            const dataElement = document.getElementById('data');
            dataElement.innerHTML = '';  // Limpar a tabela antes de preencher

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

                dataElement.appendChild(row);
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
loadUniqueTurmas();  // Carregar turmas únicas
loadAlunos();  // Carregar alunos ao iniciar
