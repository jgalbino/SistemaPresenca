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
