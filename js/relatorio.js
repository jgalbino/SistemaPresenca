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

// Função para gerar o relatório de faltas
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

        // Buscar os nomes dos alunos a partir dos IDs
        const nomePorId = {};

        // Função para obter nomes dos IDs
        const obterNomesDosIDs = async (ids) => {
            const promessas = ids.map((id) => db.collection("Alunos").doc(id).get());
            const resultados = await Promise.all(promessas);

            resultados.forEach((doc) => {
                if (doc.exists) {
                    nomePorId[doc.id] = doc.data().nome; // Mapeia ID para nome
                }
            });
        };

        // Obter os IDs únicos dos presentes para buscar os nomes
        const idsUnicos = new Set();
        dados.forEach((item) => {
            item.presentes.forEach((id) => idsUnicos.add(id));
        });

        await obterNomesDosIDs([...idsUnicos]); // Obter nomes dos IDs

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
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        for (const chave in agrupado) {
            const tr = document.createElement("tr");

            const agrupamentoCell = document.createElement("td");
            agrupamentoCell.textContent = chave; // Exibe a chave do agrupamento

            const detalhesCell = document.createElement("td");

            // Exibir os nomes dos alunos presentes, separados por ponto e vírgula
            const nomesPresentes = agrupado[chave].map((item) => 
                item.presentes.map((id) => nomePorId[id]).join("; ")
            ).join(" | "); // Se houver mais de um item, usar pipe para separar

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
