findTransactions();

function findTransactions() {
	firebase.firestore()
		.collection('alunos')
		.get()
		.then(snapshot => {
			console.log(snapshot);
		})
}
