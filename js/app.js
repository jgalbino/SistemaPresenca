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

function verificarPresencasPorTurmaEPessoa() {
  const db = firebase.firestore();

  db.collection("Presenças")
    .get()
    .then((querySnapshot) => {
      const contagemPorTurma = {};
      const contagemPorPessoaPorTurma = {};

      querySnapshot.forEach((doc) => {
        const turma = doc.data().turma;
        const presentes = doc.data().presentes;

        if (!contagemPorTurma[turma]) {
          contagemPorTurma[turma] = 0;
          contagemPorPessoaPorTurma[turma] = {};
        }
        
        // Contar as presenças totais por turma
        contagemPorTurma[turma]++;

        // Contar as presenças por pessoa dentro de cada turma
        if (Array.isArray(presentes)) {
          presentes.forEach((pessoa) => {
            if (!contagemPorPessoaPorTurma[turma][pessoa]) {
              contagemPorPessoaPorTurma[turma][pessoa] = 0;
            }
            contagemPorPessoaPorTurma[turma][pessoa]++;
          });
        }
      });

      const promessasAlunos = [];

      for (const turma in contagemPorPessoaPorTurma) {
        const totalPresencasTurma = contagemPorTurma[turma];

        for (const pessoa in contagemPorPessoaPorTurma[turma]) {
          const contagemPresencas = contagemPorPessoaPorTurma[turma][pessoa];
          const porcentagem = (contagemPresencas / totalPresencasTurma) * 100;

          if (porcentagem < 80) {
            // Se a porcentagem for menor que 80%, buscar o nome e o email do aluno
            const alunoRef = db.collection("Alunos").doc(pessoa);
            promessasAlunos.push(
              alunoRef.get().then((doc) => {
                if (doc.exists) {
                  const nome = doc.data().nome;
                  const email = doc.data().email;
                  return { nome, email, turma, porcentagem: porcentagem.toFixed(2) };
                } else {
                  console.warn(`Aluno com ID ${pessoa} não encontrado.`);
                  return null;
                }
              })
            );
          }
        }
      }

      return Promise.all(promessasAlunos);
    })
    .then((resultados) => {
      let mensagem = "Alunos com menos de 80% de presença:\n";

      resultados.forEach((resultado) => {
        if (resultado) {
          mensagem += `Turma: ${resultado.turma}\n`;
          mensagem += `Nome: ${resultado.nome}\n`;
          mensagem += `Email: ${resultado.email}\n`;
          mensagem += `Presença: ${resultado.porcentagem}%\n`;
          mensagem += "-------------------------\n";
        }
      });

      alert(mensagem);
    })
    .catch((error) => {
      console.error("Erro ao verificar presenças:", error);
      alert("Erro ao verificar presenças. Veja o console para mais detalhes.");
    });
}

window.onload = verificarPresencasPorTurmaEPessoa;


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
