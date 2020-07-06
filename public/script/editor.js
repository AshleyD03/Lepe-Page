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
            console.log('Wellcome', user['email'], user['displayName']);
            document.getElementById('wellcome-msg').innerHTML = ('Wellcome ' + user['displayName']); 

            // Logout Button
            document.getElementById('logOut').addEventListener('click', function() {
                logOut()
            })

            // Change visibility of a class to a value
            function makeElementVisibility(className, visibility) {
                var collection = document.getElementsByClassName(className)
                
                if (collection.length > 0) {
                    // If Elements are found using class iterate through array 
                    Array.from(collection).forEach(element => {
                        element.style.visibility = visibility;
                    })
                } else {
                    console.log("Checking by id")
                    // Else try for single Id
                    var element = document.getElementById(className)
                    if (element != null) {
                        element.style.visibility = visibility
                    }
                }
            }

            // Makes a button make one class invisible and 
            function makeClassSwitch(buttonClassName, hiddenClassName) {
                Array.from(document.getElementsByClassName(buttonClassName)).forEach(element => {
                    element.addEventListener('click', function() {
                        makeElementVisibility(hiddenClassName, 'hidden')
                        makeElementVisibility(element.value, 'visible')
                    })
                })
            }

            makeClassSwitch('header-button', 'hide-all')
            makeClassSwitch('bar-button', 'hide-form')

        } else {
            // User not logged in
            window.location.replace("/console/login");
        }
    })

    function logOut() {
        firebase.auth().signOut();
    }
    
    mainApp.logOut = logOut;
})();