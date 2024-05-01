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
// Inicializa o EmailJS com seu User ID
emailjs.init('jTqaJyiSymGuaW1jj'); // Substitua pelo seu User ID do EmailJS

function enviarEmailParaAlunosComBaixaPresenca() {
  const db = firebase.firestore();

  // Identificar alunos com menos de 80% de presença
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

        contagemPorTurma[turma]++;

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
      const serviceID = 'service_djxccyq'; // ID do serviço
      const templateID = 'template_01jpzky'; // ID do template

      resultados.forEach((resultado) => {
        if (resultado) {
          const destinatario = resultado.email;
          const templateParams = {
            to_email: destinatario,
            subject: 'Aviso de Presença', // Assunto do email
            message: `Olá ${resultado.nome}, você está com ${resultado.porcentagem}% de presença na turma ${resultado.turma}. Por favor, verifique sua frequência para evitar problemas.`, // Mensagem do email
          };

          emailjs.send(serviceID, templateID, templateParams)
            .then(function (response) {
              console.log(`E-mail enviado com sucesso para ${destinatario}!`, response.status, response.text);
              alert(`E-mail enviado para:\nNome: ${resultado.nome}\nEmail: ${destinatario}\nPresença: ${resultado.porcentagem}%`);
            }, function (error) {
              console.error(`Falha ao enviar e-mail para ${destinatario}:`, error);
              alert(`Erro ao enviar e-mail para ${destinatario}.`);
            });
        }
      });
    })
    .catch((error) => {
      console.error("Erro ao verificar presenças:", error);
      alert("Erro ao verificar presenças. Veja o console para mais detalhes.");
    });
}

window.onload = function() {
  const confirmacao = confirm("Você deseja enviar email para os pais dos alunos com menos de 80% de presença?");
  
  if (confirmacao) {
    enviarEmailParaAlunosComBaixaPresenca();
  } else {
    alert("Ação cancelada. Nenhum email será enviado.");
  }
};


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
