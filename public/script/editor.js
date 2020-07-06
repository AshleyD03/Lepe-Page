var mainApp = {}; 

(function () {
    // Fire base Config & Initiliase 
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
    db = firebase.firestore();

    var uid = null;
  
    // Auth protection 
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User logged in

            // Introduction
            uid = user.uid;
            console.log(uid)
            console.log('Wellcome', user['email'], user['displayName']);
            document.getElementById('wellcome-msg').innerHTML = ('Wellcome ' + user['displayName']); 

            // Logout Button
            document.getElementById('logOut').addEventListener('click', function() {
                logOut()
            }) 

            // - = - Visibility Switches - = -
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
            // Makes a button make one class hidden and it's value visible
            function makeElementSwitch(queryName, hiddenQueryName) {
                var buttons = document.getElementsByClassName(queryName);
                if (buttons.length == 0 ) {
                    var button = document.getElementById(queryName)
                    button.addEventListener('click', function() {
                        makeElementVisibility(hiddenQueryName, 'hidden')
                        makeElementVisibility(element.value, 'visible')
                    })
                } else {
                    Array.from(buttons).forEach(element => {
                                        element.addEventListener('click', function() {
                                            makeElementVisibility(hiddenQueryName, 'hidden')
                                            makeElementVisibility(element.value, 'visible')
                                        })
                                    })
                }  
            }
            // Create Switches
            makeElementSwitch('header-button', 'hide-all')

            // - = - Reset Password - = - 
            const resetForm = document.querySelector('#send-reset-email');
            resetForm.addEventListener('submit', (token) => {
                token.preventDefault();

                const email = resetForm['sr-email'].value;

                firebase.auth().sendPasswordResetEmail(email).then(function() {
                    alert("Email sent to : " + email);
                }).catch(error => alert(error.message))
            })

            // - = - Make Account - = - 
            const accountForm = document.querySelector('#create-account');
            accountForm.addEventListener('submit', (token) => {
                token.preventDefault();

                const email = accountForm['ca-email'].value;
                const username = accountForm['ca-username'].value;
                const password = accountForm['ca-password'].value;

                firebase.auth().createUserWithEmailAndPassword(email, password).then(function (result) {
                    return result.user.updateProfile({
                        displayName: username
                    })
                }).then(function() {
                    alert("Created account for : " + email)
                }).catch(error => alert(error.message))
            })

            // - = - Doc Reading Functions - = -
            // Read doc from category
            async function readDoc(docName, category) {
                const ref = db.collection(category).doc(docName);
                const doc = await ref.get();
                return doc;
            }
            // Read docs from a cateorgy in an order with / without limit
            async function readDocOrder(category, orderBy, orderWay, limit) {
                var ref;
                if (limit == null) {
                    ref = db.collection(category).orderBy(orderBy, orderWay);
                } else {
                    ref = db.collection(category).orderBy(orderBy, orderWay).limit(limit);
                }
            
                const snapshot = await ref.get();
                return snapshot;
            }
  
            // - = - Load News - = -
            var newsBar = document.getElementById('news-bar');
            readDocOrder('news-articles', 'date', 'desc', null).then(token => {
                token.forEach(doc => {
                    if (doc.exists) {
                        var newBar = document.createElement('button');
                        newBar.setAttribute('class', 'bar-button');
                        newBar.setAttribute('value', 'news-edit');

                        var title = doc.data()['title']
                        if (title.length > 25) {
                            title = title.substr(0, 23) + '...'
                        }
                        newBar.innerHTML = title 

                        newBar.addEventListener('click', function() {
                            // Later on will change document value to edit
                            document.getElementById('news-edit-title').innerHTML = 'Edit News Document : ' + title;
                            console.log("bleh")
                        })
                        newsBar.appendChild(newBar);
                    }
                })
                // Create switch for all bar buttons after all generated
                makeElementSwitch('bar-button', 'hide-form')
            })

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