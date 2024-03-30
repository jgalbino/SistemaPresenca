const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
  firestore.settings(settings);

findTransactions();

function findTransactions() {
	firebase.firestore()
		.collection('alunos')
		.get()
		.then(snapshot => {
			console.log(snapshot);
		})
}
