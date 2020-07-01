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
    const testRef = db.collection(category).doc(docName);
    const doc = await testRef.get();
    return doc
}

// get request / for tests
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/move along.gif'));
})

app.get('/home', (req,res) => {
    res.render('home')
})

// Response to article request
app.get('/article/:articleName', (req, res) => {
    res.set("Cache-control", "public, max-age=300, s-maxage=600");

    const article = req.params["articleName"];
    readDoc(article, 'general-articles').then(token => { 
        if (token.exists) {  
            res.render('article', token.data())
        } else {
            res.render('error', {
                missing: article
            });
        }
    });
})

// Turn on Message
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/home`)
})