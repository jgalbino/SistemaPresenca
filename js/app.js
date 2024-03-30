// Referência ao Firestore
var db = firebase.firestore();

// Referência para a coleção de alunos
var alunosRef = db.collection("alunos");

// Obter todos os documentos da coleção
alunosRef.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        if (doc.exists) {
            // Exibir dados na página HTML
            var data = doc.data();
            document.getElementById("data").innerHTML += "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
        } else {
            console.log("Documento não encontrado:", doc.id);
        }
    });
}).catch(function(error) {
    console.log("Erro ao obter documentos:", error);
});
