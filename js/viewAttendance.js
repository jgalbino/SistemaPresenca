findTransactions();

function findTransactions() {
	firebase.firestore()
		.collection('alunos')
		.get()
		.then(snapshot => {
			snapshot.docs.forEach(doc => {
				console.log(doc.data())
			})
		})
}
