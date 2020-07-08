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
    storage = firebase.storage();

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
                        makeElementVisibility(button.value, 'visible')
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
  
            // - = - Load News Bar Buttons - = -
            // Preset for News Form
            const newsForm = document.querySelector('#news-editing-or-creating-form');
            const newsTitle = document.getElementById('news-edit-title');
            const newsImageDisplay = document.getElementById('na-article-image');
            const newsSubmit = document.getElementById('news-submit');

            // Tells form loader what to do with form
            var newsFormStatus = {'use' : null,
                                  'edit-title' : null,
                                  'edit-file' : null}; 
            var newsCurrentFile = null;

            // Generate button for each article
            var newsBar = document.getElementById('news-bar');
            function loadNews() {
                readDocOrder('news-articles', 'date', 'desc', null).then(token => {
                    token.forEach(doc => {
                        if (doc.exists) {

                            var newBar = document.createElement('button');
                            newBar.setAttribute('class', 'bar-button');
                            newBar.setAttribute('value', 'news-form');

                            var title = doc.data()['title']
                            if (title.length > 25) {
                                title = title.substr(0, 23) + '...'
                            }
                            newBar.innerHTML = title; 

                            newBar.addEventListener('click', function() {
                                // Clean form Style
                                newsSubmit.disabled = false;
                                newsSubmit.style.backgroundColor = '#81DA8F';
                                newsTitle.innerHTML = 'Edit News Article : ' + title;
                                
                                // Set values for a document replace      
                                newsFormStatus['use'] = 'edit';
                                newsFormStatus['edit-title'] = doc.data()['title'];
                                newsFormStatus['edit-file'] = doc.data()['fileName'];
                                newsCurrentFile = null;
                                newsImageDisplay.src = doc.data()['imageref'];

                                newsForm['na-title'].value = doc.data()['title'];
                                newsForm['na-article-text'].value = doc.data()['text'];
                                newsForm['na-article-file'].value = '';
                                newsForm['na-article-file'].required = false;
                            })
                            newsBar.appendChild(newBar);
                        }
                    })
                    // Create switch for all bar buttons after all generated
                    makeElementSwitch('bar-button', 'hide-form')
                })
            }
            loadNews()
            // Reload button event 
            document.getElementById('reload-news').addEventListener('click', function() {
                // Clear newsbar and re-add barTop
                const barTop = document.getElementById('news-bar-top');
                newsBar.innerHTML = '';
                newsBar.appendChild(barTop);
                loadNews()
            })
            
            // Create new document Event
            makeElementSwitch('add-news', 'hide-form')
            // Add news button event
            document.getElementById('add-news').addEventListener('click', function() {
                // Clean form style
                newsSubmit.style.backgroundColor = '#81DA8F';
                newsSubmit.disabled = false;
                newsTitle.innerHTML = 'Create News Article';
                
                // Reset values for a new document event
                newsFormStatus['use'] = 'create';
                newsCurrentFile = null;
                newsForm['na-article-file'].value = '';
                newsForm['na-article-file'].required = true;

                newsImageDisplay.src = '../public/image/empty.png';
            })

            // Listen for file change - if valid make input filled so form can be accepted and change value of file holder variable
            newsForm['na-article-file'].addEventListener('change', (e) => {
                var newFile = e.target.files[0];
                const fileTypes = ['.gif', '.jpg', '.png'];
                var confirm;

                fileTypes.forEach(fileType => {
                    if (newFile.name.includes(fileType)) {
                        console.log(fileType)
                        confirm = true;
                    }
                })

                if (confirm == true) {
                    newsImageDisplay.src = URL.createObjectURL(newFile);
                    newsCurrentFile = newFile;
                } else {
                    alert('Sorry but that file type is invalid, we only accept : ' + fileTypes)
                    newsForm['na-article-file'].value = '';
                }
            })

            // Submit Form
            newsForm.addEventListener('submit', (token) => {
                token.preventDefault();
                newsSubmit.disabled = true;
                newsSubmit.style.backgroundColor = '#FF7715';

                const title = newsForm['na-title'].value;
                const text = newsForm['na-article-text'].value;
                const file = newsCurrentFile;
                //const image = ;
                
                // If update delete original document
                if (newsFormStatus['use'] == 'edit') {
                    // Check if no change image
                    imgSame = false;
                    if (newsForm['na-article-file'].value == '') {
                        imgSame = true;
                    }

                    // Get old data for similarities
                    readDoc(newsFormStatus['edit-title'], 'news-articles').then(token => {
                        const oldData = token.data();
                        console.log(oldData)

                        // Delete old artilce and then create new
                        db.collection('news-articles').doc(newsFormStatus['edit-title']).delete().then(function() {
                            console.log(oldData)
                            createNews(title, text, file, imgSame, oldData).then(function() {
                                newsSubmit.style.backgroundColor = '#0EB206';
                                loadNews()

                                // Delete old image if not using same
                                if (imgSame != true) {
                                    storage.ref.child('news/' + oldData['fileName']).delete()
                                } 

                                alert('Edited News article : ' + title) 
                            })
                            
                        }) 
                    })

                    
                } else {
                    createNews(title, text, file, null, null)
                    newsSubmit.style.backgroundColor = '#0EB206';
                    loadNews()
                    alert('Created News article : ' + title)
                }
            })

            // Create new News form and upload image
            async function createNews(title, text, file, similar, oldData) {
                // If Similar image no on Upload Image
                if (similar != true) {
                    const storageRef = storage.ref('news/' + file.name);
                    var task = storageRef.put(file)
                    task.on(
                        'state_changed',
                        function progress(snapshot) {
                        },
                        function error(error) {
                            console.error('Error: ' + error)
                        },
                        function complete () {
                            storageRef.getDownloadURL()
                                .then(function (url) {
                                // Then create Document
                                const date = firebase.firestore.FieldValue.serverTimestamp()

                                // Edits if editing and has similar time
                                if (similar != null) {
                                    date = oldData['time'];
                                    if (similar == true) {
                                        imageref = oldData['imageref']
                                    }
                                }

                                db.collection('news-articles').doc(title).set({
                                    date: date,
                                    href: ('/' + 'news-articles/' + title),
                                    imageref: url,
                                    text: text,
                                    title: title,
                                    fileName: file.name
                                })
                                .then(function() {
                                    loadNews()
                                })
                            }).catch(function (error) {
                                console.error(error)
                            })
                        }  
                    )
                } else {
                    db.collection('news-articles').doc(title).set({
                        date: oldData['date'],
                        href: ('/' + 'news-articles/' + title),
                        imageref: oldData['imageref'],
                        text: text,
                        title: title,
                        fileName: oldData['imageref']
                    }).then(function() {
                        loadNews()
                    })
                }
            }


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