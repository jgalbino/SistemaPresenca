// Configuração do Firebase
var config = {
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

// Função para preencher um dropdown
const preencherDropdown = (dropdownId, items) => {
    const dropdown = document.getElementById(dropdownId);

    if (!dropdown) {
        console.error(`Dropdown com ID '${dropdownId}' não encontrado.`);
        return;
    }

    // Limpar dropdown antes de adicionar novos itens
    dropdown.innerHTML = '<option value="" disabled selected>Selecione uma turma</option>';

    items.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.nome;
        dropdown.appendChild(option);
    });
};

// Função para carregar turmas
const loadTurmas = async () => {
    try {
        const querySnapshot = await db.collection("Turmas").get();

        if (querySnapshot.empty) {
            console.error("Nenhuma turma encontrada.");
            return;
        }

        const turmas = querySnapshot.docs.map((doc) => {
            return { id: doc.id, nome: doc.data().nome };
        });

        preencherDropdown("select-turma", turmas);
    } catch (error) {
        console.error("Erro ao carregar turmas:", error);
    }
};

// Função para contar presenças por turma e por pessoa

function contarPresencasPorTurmaEPessoa() {
  const db = firebase.firestore();

  db.collection("Presenças")
    .get()
    .then((querySnapshot) => {
      const contagemPorTurma = {};
      const contagemPorPessoaPorTurma = {};

      // Primeiro, contar as presenças por turma e por ID do aluno
      querySnapshot.forEach((doc) => {
        const turma = doc.data().turma;
        const presentes = doc.data().presentes;

        if (!contagemPorTurma[turma]) {
          contagemPorTurma[turma] = 1;
          contagemPorPessoaPorTurma[turma] = {};
        } else {
          contagemPorTurma[turma]++;
        }

        // Contagem por pessoa dentro de cada turma usando IDs de alunos
        if (Array.isArray(presentes)) {
          presentes.forEach((alunoID) => {
            if (!contagemPorPessoaPorTurma[turma][alunoID]) {
              contagemPorPessoaPorTurma[turma][alunoID] = 1;
            } else {
              contagemPorPessoaPorTurma[turma][alunoID]++;
            }
          });
        } else {
          console.warn(`Campo "presentes" no documento ${doc.id} não é um array`);
        }
      });

      // Agora, precisamos buscar os nomes dos alunos da coleção "Alunos"
      const promessasNomes = [];

      for (const turma in contagemPorPessoaPorTurma) {
        for (const alunoID in contagemPorPessoaPorTurma[turma]) {
          promessasNomes.push(
            db.collection("Alunos").doc(alunoID).get().then((doc) => {
              if (doc.exists) {
                const nomeAluno = doc.data().nome;
                contagemPorPessoaPorTurma[turma][alunoID] = {
                  contagem: contagemPorPessoaPorTurma[turma][alunoID],
                  nome: nomeAluno,
                };
              } else {
                console.warn(`Aluno com ID ${alunoID} não encontrado na coleção Alunos.`);
              }
            })
          );
        }
      }

      return Promise.all(promessasNomes);
    })
    .then(() => {
      let mensagem = "Contagem de presenças por turma:\n";
      for (const [turma, contagem] of Object.entries(contagemPorTurma)) {
        mensagem += `Turma ${turma}: ${contagem}\n`;
      }

      mensagem += "\nContagem de presenças por pessoa (com porcentagem):\n";
      for (const [turma, pessoas] of Object.entries(contagemPorPessoaPorTurma)) {
        mensagem += `Turma ${turma}:\n`;
        const totalPresencasTurma = contagemPorTurma[turma];

        for (const [alunoID, dados] of Object.entries(pessoas)) {
          const contagem = dados.contagem;
          const nome = dados.nome || "Desconhecido"; // Se não conseguir obter o nome
          const porcentagem = ((contagem / totalPresencasTurma) * 100).toFixed(2);
          const status = porcentagem >= 80 ? "Aprovado" : "Reprovado";

          mensagem += `${nome}: ${contagem} (${porcentagem}%) - ${status}\n`;
        }
      }

      alert(mensagem); // Exibe a mensagem final com nomes e porcentagens
    })
    .catch((error) => {
      console.error("Erro ao contar presenças:", error);
      alert("Erro ao contar presenças. Veja o console para mais detalhes.");
    });
}

window.onload = contarPresencasPorTurmaEPessoa;


// Carregar turmas ao iniciar a página
document.addEventListener("DOMContentLoaded", loadTurmas);

// Função para carregar presenças para uma turma e data
const loadPresences = async () => {
    const turmaId = document.getElementById("select-turma").value;
    const date = document.getElementById("select-date").value;

    const presenceTable = document.getElementById("presence-table");

    if (!turmaId || !date) {
        console.error("Erro ao carregar presença: Turma ou data não especificada.");
        return;
    }

    presenceTable.innerHTML = ''; // Limpar tabela antes de carregar

    try {
        const alunosSnapshot = await db.collection("Alunos").where("turma", "==", turmaId).get();
        const presencasSnapshot = await db.collection("Presenças")
            .where("turma", "==", turmaId)
            .where("date", "==", date)
            .get();

        // Obter IDs dos alunos presentes se a presença já existe
        let presentes = [];
        if (!presencasSnapshot.empty) {
            const presencaDoc = presencasSnapshot.docs[0];
            presentes = presencaDoc.data().presentes;
        }

        // Criar a tabela de presença
        const table = document.createElement("table");
        table.className = "table table-striped";

        // Criar cabeçalho da tabela
        const thead = document.createElement("thead");
        const trHead = document.createElement("tr");
        trHead.appendChild(document.createElement("th")).textContent = "Aluno";
        trHead.appendChild(document.createElement("th")).textContent = "Presente";

        thead.appendChild(trHead);
        table.appendChild(thead);

        // Criar corpo da tabela
        const tbody = document.createElement("tbody");

        alunosSnapshot.docs.forEach((doc) => {
            const student = doc.data();
            const tr = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = student.nome;
            tr.appendChild(nameCell);

            const checkCell = document.createElement("td");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `student-${doc.id}`;
            checkbox.value = doc.id;
            checkbox.checked = presentes.includes(doc.id); // Marcar se o aluno estava presente
            checkCell.appendChild(checkbox);

            tr.appendChild(checkCell);
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        presenceTable.appendChild(table);
    } catch (error) {
        console.error("Erro ao carregar alunos ou presença:", error);
    }
};

// Vincular evento para carregar presenças
document.getElementById("load-presences").addEventListener("click", loadPresences);

// Função para registrar ou salvar presença
const registerPresence = (event) => {
    event.preventDefault();

    const turmaId = document.getElementById("select-turma").value;
    const date = document.getElementById("select-date").value;

    if (!turmaId || !date) {
        console.error("Erro ao registrar presença: Turma ou data não especificada.");
        return;
    }

    const presentStudentIds = [];

    const studentCheckboxes = document.querySelectorAll("#presence-table input[type='checkbox']");
    studentCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            presentStudentIds.push(checkbox.value);
        }
    });

    db.collection("Presenças").where("turma", "==", turmaId).where("date", "==", date).get().then((querySnapshot) => {
        if (querySnapshot.empty) {
            // Se a presença ainda não existir, adicione um novo documento
            return db.collection("Presenças").add({
                turma: turmaId,
                date,
                presentes: presentStudentIds
            });
        } else {
            // Se a presença já existir, atualize o documento existente
            const presencaDocId = querySnapshot.docs[0].id;
            return db.collection("Presenças").doc(presencaDocId).update({
                presentes: presentStudentIds
            });
        }
    }).then(() => {
        alert("Presença registrada/salva com sucesso!");
    }).catch((error) => {
        console.error("Erro ao registrar/salvar presença:", error);
    });
};

// Vincular evento para registrar ou salvar presença
document.getElementById("register-view-presence-form").addEventListener("submit", registerPresence);

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
