# Sistema de Controle de Frequência Escolar - README

Este é o repositório do Sistema de Controle de Frequência Escolar, uma aplicação web desenvolvida em HTML, CSS, JavaScript e integrada com o Firebase para armazenamento de dados em tempo real. Este sistema permite o controle da frequência dos alunos em sala de aula, fornecendo uma interface intuitiva para os professores registrarem a presença dos estudantes.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- Um navegador web moderno (recomendamos Google Chrome, Mozilla Firefox ou Microsoft Edge).
- Node.js e npm (gerenciador de pacotes do Node.js).
- Uma conta no Firebase para configurar o banco de dados em tempo real.

## Configuração do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e crie um novo projeto.
2. No painel do projeto, clique em "Adicionar app" e siga as instruções para adicionar um app da web ao seu projeto.
3. Copie as configurações do SDK do Firebase (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId) e cole-as no arquivo `firebase-config.js` localizado na pasta `src`.

Exemplo de `firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-auth-domain",
  projectId: "seu-project-id",
  storageBucket: "seu-storage-bucket",
  messagingSenderId: "seu-sender-id",
  appId: "seu-app-id"
};

firebase.initializeApp(firebaseConfig);
```

## Instalação e Execução

1. Clone este repositório em sua máquina local:

```bash
git clone https://github.com/seu-usuario/SistemaPresenca.git
```

2. Navegue até a pasta do projeto e abra o arquivo index.html no seu navegador.

```bash
cd SistemaPresenca
```

3. Certifique-se de que sua conexão com a internet está ativa para que o Firebase possa ser acessado.


## Contribuição

Contribuições são bem-vindas! Se você deseja melhorar este projeto, siga estes passos:

1. Faça um fork do projeto.
2. Crie sua branch de feature (`git checkout -b feature/MinhaFeature`).
3. Faça commit de suas alterações (`git commit -am 'Adicionando uma nova feature'`).
4. Faça push para a branch (`git push origin feature/MinhaFeature`).
5. Abra um pull request.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

Esse é um guia básico para configurar e utilizar o Sistema de Controle de Frequência Escolar localmente. Se precisar de mais assistência, não hesite em entrar em contato!
