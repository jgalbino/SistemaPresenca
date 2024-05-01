# Sistema de Controle de Frequência Escolar - Escola Octogono

Bem-vindo ao repositório do Sistema de Controle de Frequência Escolar, uma aplicação web para controle de frequência de alunos em sala de aula. O sistema foi desenvolvido com HTML, CSS, JavaScript e integra o Firebase como backend para armazenamento em tempo real.

## Funcionalidades do Sistema
- **Registro de presença**: Professores podem registrar a presença dos alunos.
- **Relatórios**: Visualize e faça download de relatórios de frequência.
- **Envio de e-mails**: Alertas automáticos são enviados quando a frequência do aluno é menor que 80%.

## Pré-requisitos
Para configurar e executar o sistema, você precisará do seguinte:
- Um navegador web moderno (como Google Chrome, Mozilla Firefox ou Microsoft Edge).
- Conta no Firebase para integração do banco de dados.
- Conta no EmailJS para enviar e-mails automáticos.


## Instalação e Execução do Sistema

Para instalar e executar o sistema, siga estas etapas:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/SistemaPresenca.git

2. **Acesse a pasta do projeto:**
   ```bash
   cd SistemaPresenca
3. **Abra o arquivo 'index.html no navegador**
   Certifique-se de estar conectado à internet para conectar-se ao Firebase e ao EmailJS.
   
## Configuração do Firebase
Para conectar a aplicação ao Firebase, siga estas etapas:

1. Crie uma conta no Firebase e acesse o [Console do Firebase](https://console.firebase.google.com/).
2. Crie um novo projeto no Firebase.
3. Selecione a opção para adicionar um app da Web ao projeto.
4. Siga as instruções para obter as configurações do SDK do Firebase.
5. Altere na pasta JS, todos os arquivos com sua chave, conforme a seguir.

   ```javascript
   const firebaseConfig = {
     apiKey: "SUA_API_KEY",
     authDomain: "SEU_AUTH_DOMAIN",
     projectId: "SEU_PROJECT_ID",
     storageBucket: "SEU_STORAGE_BUCKET",
     messagingSenderId: "SEU_MESSAGING_SENDER_ID",
     appId: "SEU_APP_ID"
   };

   firebase.initializeApp(firebaseConfig);

# Estrutura do Banco de Dados

O sistema de controle de frequência escolar utiliza quatro coleções principais para armazenar dados sobre alunos, aulas, presenças e turmas. Cada coleção tem um conjunto específico de campos para representar diferentes tipos de informações.

## Coleções e Campos

1. **Alunos**
   - Armazena informações sobre os alunos da escola.
   - Cada documento na coleção deve conter os seguintes campos:
     - `ano`: O ano de ingresso do aluno na escola.
     - `email`: O e-mail de contato do aluno.
     - `nome`: O nome completo do aluno.
     - `turma`: O identificador ou nome da turma a qual o aluno pertence.

2. **Aulas**
   - Armazena informações sobre aulas ministradas em cada turma.
   - Cada documento na coleção deve conter os seguintes campos:
     - `date`: A data em que a aula ocorreu (recomenda-se usar o formato ISO 8601 para consistência, como `YYYY-MM-DD`).
     - `turma`: O identificador ou nome da turma associada à aula.

3. **Presenças**
   - Armazena dados sobre a presença dos alunos em cada aula.
   - Cada documento na coleção deve conter:
     - `date`: A data em que a presença foi registrada.
     - `presentes`: Um array contendo os identificadores dos alunos presentes na aula.
     - `turma`: O identificador ou nome da turma associada à presença.

4. **Turmas**
   - Armazena informações sobre as turmas da escola.
   - Cada subcoleção deve ser nomeada de acordo com o nome da turma.
   - Cada documento na subcoleção deve conter os seguintes campos:
     - `ano`: O ano ao qual a turma pertence.
     - `nome`: O nome da turma.



## Configuração do EmailJS

Para configurar a funcionalidade de envio de e-mails automáticos, siga estas etapas:

1. Acesse o [site do EmailJS](https://www.emailjs.com/) e crie uma conta gratuita ou faça login se já tiver uma.
2. Configure um serviço de e-mail (como Gmail, Yahoo, etc.) dentro do EmailJS.
3. Obtenha as credenciais necessárias para a integração com sua aplicação:
   - **Service ID**
   - **Template ID**
   - **Public Key**
4. No repositório do projeto, navegue até a pasta `js` e abra o arquivo `app.js`.
5. Encontre a função que lida com o envio de e-mails e insira as credenciais do EmailJS nos locais apropriados.

   Exemplo de configuração do EmailJS em `app.js`:
   ```javascript
   emailjs.send("SEU_SERVICE_ID", "SEU_TEMPLATE_ID", {
     to_email: "aluno@example.com",
     from_name: "Sistema de Frequência Escolar",
     subject: "Alerta de Frequência Baixa",
     message: "Sua frequência está abaixo de 80%. Favor, regularizar sua presença."
   }, "SEU_PUBLIC_KEY")

//
