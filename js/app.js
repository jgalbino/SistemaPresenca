// Referência ao Firestore
var db = firebase.firestore();

// Referência para a coleção de alunos
var alunosRef = db.collection("alunos");

// Obter todos os documentos da coleção
alunosRef.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // Exibir dados na página HTML
        document.getElementById("data").innerHTML += "<pre>" + JSON.stringify(doc.data(), null, 2) + "</pre>";
    });
}).catch(function(error) {
    console.log("Erro ao obter documentos:", error);
});
