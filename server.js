const { Pool } = require("pg");
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const secrets = require("./secrets.js");
const app = express();
const pg = require('pg');

const pool = new Pool({
	user: "postgres",
	host: "localhost",
	database: "nodelogin",
	password: secrets.dbPassword,
	port: 5432
  });

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static('../Front_End/public'))
 

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/../Front_End/login.html'));
});

app.post('/auth', function(request, response) {
	const username = request.body.username;
	const password = request.body.password;
	if (username && password) {
		pool.query("SELECT * FROM accounts WHERE username = $1 AND password = $2", [username, password],
		 function(error, results, fields)
		  {
			  console.log(error);
			  console.log(results);
			  console.log(fields);

			 if(results.rowCount > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.get('/logout', function (req, res) {
	delete req.session.user_id;
	res.redirect('/login');
  });

  app.get('/url', function(req,res){
    res.sendFile(path.join(__dirname + '/../Front_End/login.html'));
});

app.post('/url', function(req,res){
    const username= req.body.username;
    const email = req.body.email;
	const password = req.body.password;

	pool.query("SELECT * FROM accounts WHERE email = $1", [email])
	    .then(result => {
	      if (result.rows.length > 0) {
	    	return res.status(400)
				      .send("A user with the same email already exists!");
		    }else{ const query = "INSERT INTO accounts (username,email,password) VALUES ($1,$2,$3)" ;
			       const params = [username,email,password];
	pool
	.query(query, params)
	.then(() => res.send("Signup Success"))
	.catch(e => res.status(500).send(e));
	 
	 }
	 pool
	 .query(query, params)
	 .then(() =>res.redirect('/'));
});
});

  app.post("/services", (req, res) => {
	const newproviderId = req.body.providerId;
    const newreceiverId = req.body.receiverId;
	const newpoints = req.body.points;
	const newcontent = req.body.content;
    const state= req.body.state
	const start_date = req.body.start_date;
	const end_date= req.body.end_date
	const review = req.body.review;
	const comment = req.body.comment;
	pool.query("SELECT * FROM services WHERE content = $1", [newcontent])
	    .then(result => {
	      if (result.rows.length < 150) {
	    	return res.status(400)
				      .send("an invalid request");
		    }else{ const query =
	  "insert into services (providerId,receiverId,points, content ,state,start_date,end_date,review,comment) Values ($1,$2, $3,$4,$5,$6,$7,$8,$9 )";
	const parameters = [newproviderId,newreceiverId, newpoints ,newcontent, state, start_date,end_date,review,comment ];
  
	pool
	  .query(query, parameters)
	  .then(result => res.send("request created!"))
	  .catch(err => res.json(err, 500));
			}
  });
});

  app.get("/services", (req, res) => {
	const receiverId = req.body.receiverId;
	const providerId = req.body.providerId;
	const text = req.body.text; 
	let query =
	  "SELECT services.*, nick_name ,text from services join users on users.id=services.receiverid and users.id=services.providerid join service_tags on service_tags.service_id = services.id join hashtags on hashtag_id=service_tags.id where receiverid=$1 or Providerid = $2 or text = $3";

	let params = [receiverId, providerId, text];

	pool
	  .query(query, params)
	  .then(result => res.send("results shown"))
	  .catch(e => res.status(500).send(e));
  });

  app.listen(3000, function() {
	console.log("Server is listening on port 3000. Ready to accept requests!");
  });