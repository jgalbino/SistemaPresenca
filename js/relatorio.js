// Configuração do Firebase
let config = {
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

// Função para obter nomes dos IDs
const obterNomesDosIDs = async (ids) => {
    const nomePorId = {}; // Para armazenar nomes mapeados por IDs

    // Validar se os IDs não estão vazios ou nulos
    const idsValidos = ids.filter((id) => id && id.trim() !== ""); // Remover IDs inválidos

    if (idsValidos.length === 0) {
        console.error("Nenhum ID válido para buscar.");
        return nomePorId;
    }

    // Buscar documentos no Firestore para IDs válidos
    const promessas = idsValidos.map((id) => db.collection("Alunos").doc(id).get());

    const resultados = await Promise.all(promessas);

    resultados.forEach((doc) => {
        if (doc.exists) {
            nomePorId[doc.id] = doc.data().nome; // Mapeia ID para nome
        } else {
            console.warn("Documento não encontrado para ID:", doc.id);
        }
    });

    return nomePorId;
};

// Modificar gerarRelatorio para verificar IDs antes de usar
const gerarRelatorio = async () => {
    const agrupamento = document.getElementById("select-agrupamento").value;
    const relatorioTabela = document.getElementById("relatorio-tabela");

    if (!agrupamento) {
        console.error("Critério de agrupamento não selecionado.");
        return;
    }

    relatorioTabela.innerHTML = ''; // Limpar a tabela antes de carregar

    try {
        const querySnapshot = await db.collection("Presenças").get();
        const dados = querySnapshot.docs.map((doc) => doc.data());

        const agrupado = {};

        // Obter IDs únicos dos presentes para buscar os nomes
        const idsUnicos = new Set();
        dados.forEach((item) => {
            item.presentes.forEach((id) => idsUnicos.add(id));
        });

        const nomePorId = await obterNomesDosIDs([...idsUnicos]); // Buscar nomes dos IDs válidos

        // Agrupar conforme o critério selecionado
        dados.forEach((item) => {
            let chave;

            if (agrupamento === "data") {
                chave = item.date; // Campo de data do Firestore
            } else {
                chave = item[agrupamento]; // Outros critérios como "ano", "turma", etc.
            }

            if (typeof chave === "undefined") {
                console.error("Chave para agrupamento está indefinida:", item);
                return; // Se chave estiver indefinida, retorne para evitar erro
            }

            if (!agrupado[chave]) {
                agrupado[chave] = [];
            }

            agrupado[chave].push(item); // Adicionar ao agrupamento
        });

        // Criar tabela para exibição do relatório
        const table = document.createElement("table");
        table.className = "table table-striped";

        const thead = document.createElement("thead");
        const trHead = document.createElement("tr");
        trHead.appendChild(document.createElement("th")).textContent = "Agrupamento"; // Nome do agrupamento
        trHead.appendChild(document.createElement("th")).textContent = "Detalhes"; // Detalhes do agrupamento

        thead.appendChild(trHead);
        table.appendChild(tbody);

        const tbody = document.createElement("tbody");

        for (const chave in agrupado) {
            const tr = document.createElement("tr");

            const agrupamentoCell = document.createElement("td");
            agrupamentoCell.textContent = chave; // Exibe a chave do agrupamento

            const detalhesCell = document.createElement("td");

            // Exibir nomes separados por ponto e vírgula
            const nomesPresentes = agrupado[chave].map((item) => 
                item.presentes.map((id) => nomePorId[id] || "ID desconhecido").join("; ")
            ).join(" | "); 

            detalhesCell.textContent = nomesPresentes;

            tr.appendChild(agrupamentoCell);
            tr.appendChild(detalhesCell);

            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        relatorioTabela.appendChild(table);

        return agrupado; // Retorna para uso na função de download de texto
    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
    }
};

// Vincular evento para gerar o relatório
document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);


// Função para baixar relatório como arquivo de texto
const baixarRelatorioTXT = async () => {
    const agrupado = await gerarRelatorio();

    if (!agrupado) {
        console.error("Não foi possível gerar o relatório para baixar.");
        return;
    }

    // Criar o conteúdo do arquivo TXT
    let txtContent = "Relatório de Faltas:\n\n";

    for (const chave in agrupado) {
        txtContent += `Agrupamento: ${chave}\n`;
        txtContent += "Detalhes:\n";

        agrupado[chave].forEach((item) => {
            txtContent += `  - ${item.presentes.join(", ")}\n`;
        });

        txtContent += "\n";
    }

    // Criar um Blob para o arquivo TXT
    const blob = new Blob([txtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Criar um link para download do arquivo TXT
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_faltas.txt";
    a.click(); // Clicar para iniciar o download

    URL.revokeObjectURL(url); // Limpar o objeto após download
};

// Vincular evento para gerar o relatório
document.getElementById("gerar-relatorio").addEventListener("click", gerarRelatorio);

// Vincular evento para baixar relatório como TXT
document.getElementById("baixar-txt").addEventListener("click", baixarRelatorioTXT);
