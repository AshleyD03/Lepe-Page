const express = require('express');
const engines = require('consolidate');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccountKey.json')

// Initialize server, Firebase & handlebars engine
const app = express();
const port = 3000;

app.use('/public', express.static('public'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})
const db = admin.firestore();

app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

// Read doc from category
async function readDoc(docName, category) { 
    const ref = db.collection(category).doc(docName);
    const doc = await ref.get();
    return doc
}

// Read docs from a cateorgy in an order with / without limit
async function readDocOrder(category, orderBy, orderWay, limit) {
    var ref;
    if (limit == null) {
        ref = db.collection(category).orderBy(orderBy, orderWay)
    } else {
        ref = db.collection(category).orderBy(orderBy, orderWay).limit(limit)
    }

    const snapshot = await ref.get();
    return snapshot
}

// get request for  Home page 
// Generates: - up to 3 newest articles
app.get('/home', (req,res) => {
    res.set('Cache-control', 'public, max-age=30, s-maxage=60');

    readDocOrder('news-articles', 'date', 'asc', 3).then(token => {
        var renderItems = {
            documents: []
        };
        token.forEach(doc => {
            if (doc.exists) {
                var data = doc.data()
                // Fix date string issues
                let date = String(data['date'].toDate());
                data['date'] = date.substring(0, date.length - 40);

                renderItems['documents'].push(data)
            }
        })

        res.render('home', renderItems)
    })
})

app.get('/console/:name', (req, res) => {
    const name = req.params['name'];
    const nameList = ['login', 'editor'];

    if (nameList.includes(name)) {
        res.render(name)
    } else {
        res.render('error', {
            pageName: 'console/' + name
        })
    }
})

// Response to article request
// Inputs: - Article's doc folder
//         - Article's doc name
app.get('/:folder/:name', (req, res) => {
    // res.set('Cache-control', 'public, max-age=300, s-maxage=600');

    // Take values from link and create list to check with
    const name = req.params['name'];
    var folder = req.params['folder'];
    const folderList = ['general-articles', 'news-articles', 'categories']

    // Search for doc requested in link
    readDoc(name, folder)
    .then(token => { 
        // If doc exists and allowed to be read
        if (token.exists && folderList.includes(folder)) {
            token = token.data()

            switch (folder) {
                case 'general-articles':
                    // No edits, just render
                    res.render('general-articles', token)
                    break;

                case 'news-articles':
                    // Fix date value issue on news article
                    var dateString = String(token['date'].toDate());
                    token['date'] = dateString.substring(0, dateString.length - 40);
                    res.render('news-articles', token)
                    break;

                case 'categories':
                    if (token['articles'].length == 1 && token['1docFormat'] == true) {

                        // Render article if only 1 article and 1docFormat ON in category doc
                        token['articles'][0]["serverRef"].get()
                        .then(token => {
                            res.render('general-articles', token.data())  
                        })
                        .catch(function (error) {
                            console.error("Error :", error);
                        });

                    } else {

                        // No edits, just render
                        res.render('categories', token)
                    }
                    break;
            }

        } else {
            res.render('error', {
                pageName: folder+'/'+name
            });
        }
    })
    .catch(function (error) {
        console.error("Error :", error);
      });
})

app.get('*', (req, res) => {
    res.render('error', {
        pageName: req.path
    })
})


// Turn on Message
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/home`)
})