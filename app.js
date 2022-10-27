require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.static('public'));
const { MongoClient } = require("mongodb");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

let db;

app.listen(3000, () => {
    console.log('Server listening on 3000');
 });

MongoClient.connect(process.env.URI, { useNewUrlParser: true }, (error, client) => {
  if (error) {
    return console.log("Connection failed for some reason");
  }
  console.log("Connection established - All well");
  db = client.db(process.env.DATABASE_NAME);
  
});

app.post('/sign-up', urlencodedParser, (req, res) => {

  console.log("I've made it to the router")
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  db.collection('users').insertOne({
    name: name,
    email: email,
    password: password
   }, (err, result) => {
    if (err) {
      return console.log(err);
    }

    console.log('insert was successful - user added from app.js');
    console.log(res);
    res.sendStatus(201);
  });
});

app.post('/login', urlencodedParser, async (req, res) => {
  // TODO -- finish get for logging in
  const email = req.body.email;
  const password = req.body.password;

  const query = {email: email, password: password};
  const cursor = await db.collection('users').find(query);
  const record = cursor[0];
  if (record) {
    res.redirect("/dashboard.html");
  } else {
    res.redirect("/login.html");
    res.status(404).send();

  }

  console.log(`Email: ${email}, Password: ${password}`);

})

// app.post('new-date', urlencodedParser, (req, res) => {
//     console.log('bout to post some date data');
//     const dateName = req.body.name;
// })
