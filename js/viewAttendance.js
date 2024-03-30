findTransactions();

function findTransactions() {
	firebase.firestore()
		.collection('aluno')
		.get()
		.then(snapshot => {
			snapshot.docs.forEach(doc => {
				console.log(doc.data())
			})
		})
}
