// Referência ao Firestore
var db = firebase.firestore();

// Referência para o documento que você deseja ler
var docRef = db.collection("alunos").doc("3cuw0Yz0CfgSeQIZGO7t");

// Obter os dados do documento
docRef.get().then(function(doc) {
    if (doc.exists) {
        // Exibir dados na página HTML
        document.getElementById("data").innerHTML = "<pre>" + JSON.stringify(doc.data(), null, 2) + "</pre>";
    } else {
        console.log("Documento não encontrado!");
    }
}).catch(function(error) {
    console.log("Erro ao obter documento:", error);
});
