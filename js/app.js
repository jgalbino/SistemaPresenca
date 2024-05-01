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

        preencherDropdown("select-class-turma", turmas);
        preencherDropdown("select-presence-turma", turmas);
        preencherDropdown("select-view-turma", turmas);
    } catch (error) {
        console.error("Erro ao carregar turmas:", error);
    }
};

// Carregar turmas ao iniciar a página
document.addEventListener("DOMContentLoaded", loadTurmas);

// Função para criar aula
const createClass = (event) => {
    event.preventDefault();

    const turmaId = document.getElementById("select-class-turma").value;
    const date = document.getElementById("class-date").value;

    if (!turmaId) {
        console.error("Nenhuma turma selecionada para criar aula.");
        return;
    }

    db.collection("Aulas").add({
        turma: turmaId,
        date
    }).then(() => {
        alert("Aula criada com sucesso!");
    }).catch((error) => {
        console.error("Erro ao criar aula:", error);
    });
};

// Vincular evento para criar aula
document.getElementById("create-class-form").addEventListener("submit", createClass);

// Função para carregar alunos
const loadStudents = () => {
    const turmaId = document.getElementById("select-presence-turma").value;
    const studentList = document.getElementById("student-list");

    if (!turmaId || !studentList) {
        console.error("Erro ao carregar alunos: Turma não selecionada ou lista de alunos não encontrada.");
        return;
    }

    studentList.innerHTML = "";

    db.collection("Alunos").where("turma", "==", turmaId).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `student-${doc.id}`;
            checkbox.value = doc.id;

            const label = document.createElement("label");
            label.htmlFor = `student-${doc.id}`;
            label.innerText = student.nome;

            const div = document.createElement("div");
            div.appendChild(checkbox);
            div.appendChild(label);

            studentList.appendChild(div);
        });
    }).catch((error) => {
        console.error("Erro ao carregar alunos:", error);
    });
};

// Vincular evento para carregar alunos
document.getElementById("load-students").addEventListener("click", loadStudents);

// Função para registrar presença
const registerPresence = (event) => {
    event.preventDefault();

    const turmaId = document.getElementById("select-presence-turma").value;
    const date = document.getElementById("select-date").value;

    if (!turmaId) {
        console.error("Erro ao registrar presença: Turma não selecionada.");
        return;
    }

    const studentCheckboxes = document.querySelectorAll("#student-list input[type='checkbox']");
    const presentStudentIds = [];

    studentCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            presentStudentIds.push(checkbox.value);
        }
    });

    db.collection("Presenças").add({
        turma: turmaId,
        date,
        presentes: presentStudentIds
    }).then(() => {
        alert("Presença registrada com sucesso!");
    }).catch((error) => {
        console.error("Erro ao registrar presença:", error);
    });
};

// Vincular evento para registrar presença
document.getElementById("register-presence-form").addEventListener("submit", registerPresence);

// Função para visualizar presença
const viewPresence = (event) => {
    event.preventDefault();

    const turmaId = document.getElementById("select-view-turma").value;
    const date = document.getElementById("view-date").value;

    const presenceList = document.getElementById("presence-list");

    if (!turmaId || !presenceList) {
        console.error("Erro ao visualizar presença: Turma ou lista de presença não encontrada.");
        return;
    }

    presenceList.innerHTML = ""; // Limpar lista antes de carregar

    db.collection("Presenças").where("turma", "==", turmaId).where("date", "==", date).get().then((querySnapshot) => {
        if (querySnapshot.empty) {
            presenceList.innerText = "Nenhuma presença encontrada para essa aula.";
            return;
        }

        const presentes = querySnapshot.docs[0].data().presentes;

        const promises = presentes.map((studentId) => {
            return db.collection("Alunos").doc(studentId).get();
        });

        Promise.all(promises).then((results) => {
            results.forEach((studentDoc) => {
                const student = studentDoc.data();
                const p = document.createElement("p");
                p.innerText = student.nome;
                presenceList.appendChild(p);
            });
        });
    }).catch((error) => {
        console.error("Erro ao visualizar presença:", error);
    });
};

// Vincular evento para visualizar presença
document.getElementById("view-presence-form").addEventListener("submit", viewPresence);

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
            message: `Caros pais, gostariamos de informar que ${resultado.nome} encontra-se com ${resultado.porcentagem}% de presença na turma ${resultado.turma}. Por favor, verifique a frequência para evitar problemas. Qualquer dúvida estamos a disposição.`, // Mensagem do email
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
