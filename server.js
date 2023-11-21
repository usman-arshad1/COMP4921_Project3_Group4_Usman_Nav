"use strict";
require('./util');

require('dotenv').config();
const express = require("express");
const session = require("express-session");
const bcrypt = require('bcrypt');
const saltRounds = 12;

const MongoStore = require('connect-mongo');

const database = include('dbConnection');
const db_utils = include ('database/db_utils');
const db_query = include('database/query');

const bodyParser = require('body-parser');


const port = process.env.PORT || 3000;  

const app = express();

const expireTime = 60 * 60 * 1000; 

/* secret information section */
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json())

var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster0.hyta1z4.mongodb.net/?retryWrites=true&w=majority`,
	crypto: {
		secret: mongodb_session_secret
	}
})

app.use(session({ 
  secret: node_session_secret,
	store: mongoStore, 
	saveUninitialized: false, 
	resave: true
}
));

// Express
app.use("/js", express.static("./public/js"));
app.use("/css", express.static("./public/css"));
app.use("/img", express.static("./public/img"));
app.use("/html", express.static("./public/html"));


app.get('/', (req,res) => { // Homepage
  if (req.session.authenticated) {
      res.redirect('/loggedin');
  } else {
      res.render("index", {stylesheet: '/css/'})
  }
}); 


app.get('/signup', (req,res) => { // Get Signup
    if (req.session.authenticated) {
        res.redirect('/loggedin');
    } else {
        var userMsg = req.query.userMsg;
        var passMsg = req.query.passMsg;
        var emailMsg = req.query.emailMsg;
        res.render("signup", {userMsg: userMsg, emailMsg: emailMsg, passMsg: passMsg, stylesheet: '/css/login-signup.css'})
    }
  });
 

app.post('/createUser', async (req,res)=> { // Post Signup
if (req.session.authenticated) {
    res.redirect('/loggedin')
}
var username = req.body.username;
var email = req.body.email;
var password = req.body.password;

var hashedPassword = bcrypt.hashSync(password, saltRounds);

if (email && password && username) {
    var success = await db_query.createUser({ username: username, email: email, hashed_pass: hashedPassword });

    if (success) {
        res.redirect("/"); // User successfully created
    }
    else {
        var createMsg = "Account already exists";
        res.redirect(`/signup?createMsg=${createMsg}`)
    }

} else {
    if(!username) {
        var userMsg = "Please enter a username.";
    }
    if (!password) {
        var passMsg = "Please enter a password.";
    }
    if (!email) {
        var emailMsg = "Please enter an email.";
    }
    res.redirect(`/signup?userMsg=${userMsg}&emailMsg=${emailMsg}&passMsg=${passMsg}`)
}
});


app.get('/login', (req,res) => { // Get Login
if (req.session.authenticated) {
    res.redirect('/loggedin');
} else {
    var userMsg = req.query.userMsg;
    var passMsg = req.query.passMsg;
    res.render("login" , {userMsg: userMsg, passMsg: passMsg, stylesheet: '/css/login-signup.css'})
}
});

app.post('/loginUser', async (req,res) => { // Post Login
var username = req.body.username;
var password = req.body.password;

if(!username || !password) {
    if(!username) {
        var userMsg = "Please enter a username."
    }
    if (!password) {
        var passMsg = "Please enter a password."
    }
    res.redirect(`/login?userMsg=${userMsg}&passMsg=${passMsg}`)
} else {
    var results = await db_query.getUser({username:username});
    if (results) {
        if(results.length == 1) {
            if (bcrypt.compareSync(password, results[0].password)) {
                req.session.authenticated = true;
                req.session.username = username;
                req.session.cookie.maxAge = expireTime;
                req.session.user_type = results[0].type;
                req.session.user_id = results[0].user_id;
                res.redirect('/loggedin');
                return;
            } else {
                var userMsg = "Invalid login credentials."
                res.redirect(`/login?userMsg=${userMsg}`)
            }
        } else {
            //user and password combination not found
            console.log('Invalid number of users found: ' + results.length);
            var userMsg = "Invalid login credentials."
            res.redirect(`/login?userMsg=${userMsg}`)
        }
    } else {
        var userMsg = "Invalid login credentials."
        res.redirect(`/login?userMsg=${userMsg}`)
    }
}

});
  
app.get('/loggedin', (req,res) => { // Logging in Page
if (req.session.user_type == 'admin') {
    res.redirect('/admin')
} else if(req.session.user_type == "user") {
    res.redirect('/main')
} else {
    req.session.destroy()
    res.redirect('/')
}
});

app.get('/main', (req,res) => {
    res.render('main')
})

app.post('/sign-out', (req,res) => {
req.session.destroy();
res.redirect("/")
});

app.use(express.static(__dirname + "/public"));


app.get("*", async(req, res) => {
  res.status(404);
  res.render("404", {stylesheet: '/css/'});
})


app.listen(port, () => {
  console.log("server running on port 3000");
});