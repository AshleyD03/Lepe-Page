(function() {
    var firebaseConfig = {
        apiKey: "AIzaSyBxMMGaKn04-ZHrWvyc7_ep9y34C5SIWHQ",
        authDomain: "lepe-park.firebaseapp.com",
        databaseURL: "https://lepe-park.firebaseio.com",
        projectId: "lepe-park",
        storageBucket: "lepe-park.appspot.com",
        messagingSenderId: "300999927786",
        appId: "1:300999927786:web:5accfa629d7b54ccd9f493",
        measurementId: "G-YZW1LEBMTX"
      };
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();

    const loginForm = document.querySelector("#login-form");
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // get user info
        const email = loginForm["login-email"].value;
        const password = loginForm["login-password"].value;

        // log the user in
        auth.signInWithEmailAndPassword(email, password)
        .then((cred) => {
            console.log(cred)
            window.location.replace("/admin/editor");
        })
        .catch(error => alert(error.message));
    })
})();