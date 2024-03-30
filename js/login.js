function login(){
var persist = document.getElementById('persist').checked;
	var loginButton = document.getElementById('btnLogIn');
	var emailTxt = document.getElementById('email');
	var passwordTxt = document.getElementById('password');
	loginButton.disabled = true;
	loginButton.innerHTML='<i class="fa fa-spinner fa-spin" style="font-size:20px"></i>'+' Verifying...';
	var email = emailTxt.value;
	var password = passwordTxt.value;

	if(persist==true){
		firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
	.then(function() {
		return firebase.auth().signInWithEmailAndPassword(email, password);
		})
		.catch(function(error) {
			loginButton.innerHTML="Try logging again.."
			loginButton.disabled = false;
		emailTxt.className+=' invalid';
		passwordTxt.className+=' invalid';
		});
}else{
	firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
	.then(function() {
		return firebase.auth().signInWithEmailAndPassword(email, password);
		})
		.catch(function(error) {
			loginButton.innerHTML="Try logging again.."
			loginButton.disabled = false;
		emailTxt.className+=' invalid';
		passwordTxt.className+=' invalid';
	});
}
}

firebase.auth().getRedirectResult().then(function(data) {

		let checker = 0; //checks on second call to auth(), (bcoz of redirect)
	firebase.auth().onAuthStateChanged(function(user){
		if(user)
		{
			checker++;
			console.log('user signed in!');
			console.log(user.email);

			firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken){

			}).catch(function(error) {console.log(error);});

			if(user.email.endsWith("@escolaoctogono.com"))
			{
				console.log('allowed!');
				window.location = 'viewAttendance.html';
			}
			else
			{
				firebase.auth().signOut().then(function() {
					console.log('logged out!');
				})
				.catch(function(error){
					console.log(error);
				});
			}
		}
		else
		{
			checker++;
			if(checker == 1)
			console.log('user NOT signed in!');
		}
	});

}).catch(function(error) {
	console.log(error);
});
