var mainApp = {}; 

(function () {
    var firebaseConfig = {
        apiKey: "AIzaSyBxMMGaKn04-ZHrWvyc7_ep9y34C5SIWHQ",
        authDomain: "lepe-park.firebaseapp.com",
        databaseURL: "https://lepe-park.firebaseio.com",
        projectId: "lepe-park",
        storageBucket: "lepe-park.appspot.com",
        messagingSenderId: "300999927786",
        appId: "1:300999927786:web:7ac496e9d02b07f1d9f493",
        measurementId: "G-P6DQZ6M6QQ"
      };

    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();

    var uid = null;
  
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User logged in
            uid = user.uid;
            console.log(uid)
            console.log("Wellcome ", user["email"], user["displayName"]); 

            document.getElementById('logOut').addEventListener('click', function() {
                logOut()
            })

        } else {
            // User not logged in
            window.location.replace("/admin/login");
        }
    })

    function logOut() {
        firebase.auth().signOut();
    }
    
    mainApp.logOut = logOut;
})();