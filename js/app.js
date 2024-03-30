const db = firebase.firestore();

// Function to fetch data from Firestore
function fetchData() {
  const dataList = document.getElementById('dataList');

  // Clear previous data
  dataList.innerHTML = '';

  // Fetch data from Firestore collection
  db.collection("alunos").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      // Create a list item for each document
      const listItem = document.createElement('li');
      listItem.textContent = doc.id + ": " + JSON.stringify(doc.data());
      dataList.appendChild(listItem);
    });
  }).catch((error) => {
    console.log("Error getting documents: ", error);
  });
}

// Call fetchData when the page loads
fetchData();
