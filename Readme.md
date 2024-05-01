# Sistema de Controle de Frequência Escolar - Escola Octogono

Bem-vindo ao repositório do Sistema de Controle de Frequência Escolar, uma aplicação web para controle de frequência de alunos em sala de aula. O sistema foi desenvolvido com HTML, CSS, JavaScript e integra o Firebase como backend para armazenamento em tempo real.

## Recursos do Sistema
- Registro de presença dos alunos em tempo real.
- Interface amigável para professores e administradores.
- Integração com Firebase para armazenamento de dados.

## Pré-requisitos
Para configurar e executar o sistema, você precisará do seguinte:
- Um navegador web moderno (como Google Chrome, Mozilla Firefox ou Microsoft Edge).
- Uma conta no Firebase para integração com o banco de dados.

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
1
