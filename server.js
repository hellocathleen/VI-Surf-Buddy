"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');


// Loads the stormglass api helper
const stormglass = require('./routes/helpers/stormglass');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const beachRoutes = require("./routes/beaches");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));
app.use("/api/beaches", beachRoutes(knex));

function updateSurfData() {
  knex("beaches")
    .select("*")
    .then((results) => {
      results.forEach((result) => {
        stormglass.getSurfData(result)
          .then((data) => {
            data = JSON.stringify(data);
            updateDatabase(result, data);
          })
          .catch(error => console.error(error));
      });
    })
    .catch(error => console.error(error));
}

function updateDatabase(result, data) {
  knex("beaches")
    .where({ id: result.id })
    .update({
      stormglass: data,
      updated_at: new Date()
    })
    .catch(error => console.error(error));
}

// Update surf data every 1/2 day (in ms)
setInterval(updateSurfData, 43200000);

app.use(cookieSession({
  name: 'session',
  keys: ['secret-string', 'key2'],
}));

// Home page
app.get("/", (req, res) => {
  // Uncomment below to update database
  // updateSurfData();
});

app.get("/register", (req, res) => {
});

app.post("/register", (req, res) => {
  //res.json(req.body)
  console.log(req.body);
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const email = req.body.email.toLowerCase();
  const phoneNum = req.body.phone
  const password = req.body.password
  const hashedPW = bcrypt.hashSync(password, 10);
  //check if email is registered
  knex.select('*').from('users').then((results) => {
    //res.json(results);
    const stringified = JSON.stringify(results);
    const users = JSON.parse(stringified);
    for (const user of users) {
      if (user.email === email) {
        res.end("This email is already registered.")
        return;
      } 
    }
    //create user if all forms are filled
    if (firstName && lastName && email && phoneNum && password) {
      knex('users').insert({first_name: firstName, last_name: lastName, email: email, phone_number: phoneNum, password: hashedPW}).returning('id').then((id) => {
      console.log("Inserted id:", JSON.parse(id))
      req.session.user_id = JSON.parse(id);
      res.json(id);
      })
    } else {
      res.send("Fill out all the forms!")
    }
  })
});

app.get("/login", (req, res) => {

});

app.post("/login", (req, res) => {
  console.log("body", req.body)
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  if (email) {
    knex('users').select('id', 'password').where({email: email}).returning('password').then((results) => {
      const stringified = JSON.stringify(results);
      const userInfo = JSON.parse(stringified);
      if (bcrypt.compareSync(password, userInfo[0].password)) {
        req.session.user_id = userInfo[0].id;
        res.sendStatus(200);
        return;
      } else {
        res.send("Wrong password")
      }
    })
  } else {
    res.sendStatus(404);
  }

});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
});


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});


