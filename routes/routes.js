import express from 'express';
import path from 'path';
//import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);

// move this to app.js so i can use above
const __dirname = '/Users/cecilialopez/Desktop/web-dev/dater-app/dater';

const router = express.Router();

import myDB from "../db/MyMongoDB.js";
import datesDB from "../db/datesDB.js";
import surveyDB from "../db/surveyDB.js";

//Is this needed??
//export const PORT = process.env.PORT || 3000;

import bodyParser from "body-parser";


// begin example code

// const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.post('/sign-up', async (req, res) => {
  const user = req.body;
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  //const isUnique = await myDB.uniqueEmail(email);

  let result = await myDB.createUser(name, email, password);
  
  console.log(result);

  if (result) {
    req.session.user = user;
    req.session.isLoggedIn = true;
    res.json({isCreated: true, isLoggedIn: true, err: null});
    console.log(req.session);
  } else {
    req.session.user = null;
    res.json({ isCreated: false, isLoggedIn: false, err: "An account is already registered with given email. Try again." });
  }

  // db.collection('users').insertOne({
  //   name: name,
  //   email: email,
  //   password: password
  //  }, (err, result) => {
  //   if (err) {
  //     return console.log(err);
  //   }

  //   console.log('insert was successful - user added from app.js');
  //   console.log(res);
  //   res.sendStatus(201);
  // });
});

router.post('/authenticate(.html)?', async (req, res) => {
  const user = req.body;

  // TODO check that we got the correct info
  
  if (await myDB.authenticate(user)) {
    // NEW ADDITION
    req.session.user = user;
    req.session.user.isLoggedIn = true;
    // NEW CODE -- TESTING
    req.session.user.name = await myDB.getName(user);
    //
    console.log(req.session);
    res.json({isLoggedIn: true, err: null});
  } else {
    req.session.user = null;
    res.json({ isLoggedIn: false, err: "Wrong email or password." });
  }
});

router.post("/update-account", async (req, res) => {
  const user = req.body;
  // FINISH
  const result = await myDB.updateAccount(req.session.user.email, user.name, user.email, user.password);
  if (result) {
    req.session.user = user;
    res.json({isUpdated: true, err: null});
  } else {
    res.json({isUpdated: false, err: "Something went wrong."});
  }

});

router.get("/deleteAccount", async (req, res) => {
  const result = await myDB.deleteAccount(req.session.user.email);
  if (result) {
    req.session.user = null;
    res.json({isDeleted: true, err: null});
  } else {
    res.json({isDeleted: false, err: "Something went wrong."});
  }
})

// router.get('/dashboard(.html)?', async (req, res) => {
//   if (req.session.user) {

//   }
// });


router.get('/getUser', (req, res) => {

  // can we query the DB and add the user's name?
  res.json({
    isLoggedIn: !!req.session.user,
    user: req.session.user
  });
  // TESTING
  console.log("User: ", req.session.user);
});

router.post('/answer-questions', async (req, res) => {
  console.log(`I'm in the /postSurvey route`);
  const responses = req.body;
  const currentUserEmail = req.session.user.email;
  console.log("date ID: ", req.session.user.currectDateID);

  const newSurvey = await datesDB.submitSurvey(responses, currentUserEmail);

  // if (newSurvey) {
  //   res.json({ isCreated: true, err: null });
  // } else {
  //   res.json({ isCreated: false });
  // }
});

router.get('/getDates', async (req, res) => {
  console.log("I'm in the /getDates route");
  if (!req.session.user) {
    console.log("user is logged out");
    return;
  }

  const query = req.session.user.email;
  const dates = await datesDB.getDates(query);

  // gets data from datesDB.js and sends it to clientDates.js
  return res.json(dates);

});

router.get('/getDate', async (req, res) => {
  console.log("I'm in the /getDate route. ID: ", req.query.id);
  // call getDate function from the db

  const query = req.query.id;
  req.session.user.currectDateID = req.query.id;
  const currentDate = await datesDB.getDate(query);
  return res.json(currentDate);
});

router.post('/create-date', async (req, res) => {
  const currentUserName = req.session.user.name;
  console.log('user name: ', currentUserName);
  const currentUserEmail = req.session.user.email;

  const otherUserName = req.body.name;
  const otherUserEmail = req.body.email;
  const date = req.body.date;

  const newSurveyObj = {
    Q1: null,
    Q2: null,
    Q3: null,
    Q4: null,
    Q5: null,
    Q6: null,
    Q7: null,
    Q8: null
  };

  const currentUser = { name: currentUserName, email: currentUserEmail, formResponses: newSurveyObj };
  const otherUser = { name: otherUserName, email: otherUserEmail, formResponses: newSurveyObj };
  await datesDB.createDate(currentUser, otherUser, date);

  const createResult = await datesDB.createDate(currentUserEmail, otherUserEmail, date);
  if (createResult) {
    res.json({datePosted: true, err: null})
  } else {
    res.json({datePosted: false, err: "Please enter another registered user."})
  }

});

/*
router.post('/sign-up', (req, res) => {

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  myDB.collection('users').insertOne({
    name: name,
    email: email,
    password: password
   }, (err, result) => {
    if (err) {
      return console.log(err);
    }

    console.log('insert was successful - user added');
    res.sendStatus(201);
  });
});
*/


export default router;