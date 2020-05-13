const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const secrets = require("./secrets.js");
const app = express();
const cors = require("cors");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "migracode-final-project",
  password: secrets.dbPassword,
  port: 5432,
});

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("../Front_End/public"));

app.use(cors());

app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname + "/../Front_End/login.html"));
});

app.get("/users", (req, res) => {
  pool
    .query("SELECT * FROM users")
    .then((result) => res.json(result.rows))
    .catch((err) => res.json(err, 404));
});

app.get("/users/:userId", function (req, res) {
  const userId = req.params.userId;

  pool
    .query("SELECT * FROM users where id = $1", [userId])
    .then((result) => res.json(result.rows[0]))
    .catch((err) => res.status(500).send(err));
});

app.put("/users/:userId", function (req, res) {
  const userId = req.params.userId;
  const newName = req.body.name;
  const newEmail = req.body.email;
  const newpassword = req.body.password;
  pool
    .query(
      `
		UPDATE users
		SET name=$1, email=$2, password=$3
		WHERE id=$4
		`,
      [newName, newEmail, newpassword, userId]
    )
    .then(() => res.send(`user updated!`))
    .catch((e) => console.error(e));
});

app.post("/login", function (request, response) {
  var email = request.body.email;
  var password = request.body.password;
  if (email && password) {
    
     pool .query(`SELECT password, id, name FROM users where email = $1`,[email])

      .then((result) => {
        if (result.rows.length == 0) {
          res.status(404).send(" your email doesn't exists");
        } else {
          const user = result.rows[0];

          console.log("user logging in: ", user);

          const userData = {
            id: user.id,
            name: user.name,
          };
          console.log(userData);
         
          res.json(userData).status(200);
          
        }
      })
      .catch(function (error) {
        res.status(500).send(error, "Refresh your page");
      });
  }
});

app.get("/home", function (request, response) {
  if (request.session.loggedin) {
    response
      .send("Welcome back, " + request.session.username + "!")
      .redirect("/../tie-in-Front_End/app.js");
  } else {
    response.send("Please login to view this page!");
  }
  response.end();
});

app.get("/logout", function (req, res) {
  delete req.session.user_id;
  res.redirect("/login");
});

app.get("/reg", function (req, res) {
  res.sendFile(path.join(__dirname + "/../Front_End/Register.js"));
});

app.post("/reg", function (req, res) {
  const username = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const points = 20;

  pool.query("SELECT * FROM users WHERE email = $1", [email]).then((result) => {
    if (result.rows.length > 0) {
      return res.status(400).send("A user with the same email already exists!");
    } else {
      const query =
        "INSERT INTO users (name,email,password,points) VALUES ($1,$2,$3,$4)";
      const params = [username, email, password, points];
      pool
        .query(query, params)
        .then((result) => res.status(200).send("user created"))
        .catch((e) => res.status(400).send(e));
    }
  });
});

/*app.get("/services", (req, res) => {
	const text = req.query.text;
	let words = text.split('')


	 let query = "SELECT s.*, h.text from services  s "+
	 "join users u on u.id=s.providerid "+
	 "join service_tags  t on t.service_id = s.id "+
	 "join hashtags h on h.id=t.hashtag_id "

	  let params = [];

	  if (text) {
		params = [`%${text}%`];
		query += ` where h.text ilike $1`;
	}
	pool
    .query(query, params)
    .then(result => res.json(result.rows))
    .catch(err => res.json(err, 500));

});*/

app.get("/services", function (request, response) {
  const text = request.query.text;
  console.log(text);
  var words = text.split(" ").map((word) => word.trim());
  var hashtags = words // hashtags = ['dogs' 'vacations']
    .filter((word, index) => word.startsWith("h:"))
    .map((word) => word.replace("h:", ""));
  h: var users = words // users = ['eduard' 'ward' 'housni']
    .filter((word, index) => word.startsWith("u:"))
    .map((word) => word.replace("u:", ""));

  var query = `SELECT s.*, h.text, providers.name as pro, receivers.name as rec
		from services s
		join users receivers on receivers.id=s.receiver_id
		join users providers on providers.id=s.provider_id
		join service_tags  t on t.service_id = s.id
		join hashtags h on h.id=t.hashtag_id `;

  //const hashtagPlaceholders = hashtags.map ((h, index) => `$${index + 1}`).join(',')
  function hashtagPlaceholders(hashtags) {
    return `(${hashtags.map((h, i) => `$${i + 1}`).join(",")})`;
  }

  const offset = hashtags.length;
  function userPlaceholders(users, offset = 0) {
    return `(${users.map((users, i) => `$${i + 1 + offset}`).join(",")})`;
  }
  const queryHasHashtags = hashtags.length > 0;
  const queryHasUsers = users.length > 0;

  const queryPartHashtags = `h.text in ${hashtagPlaceholders(hashtags)}`;
  const queryPartUsers = `receivers.name in ${userPlaceholders(
    users,
    hashtags.length
  )}
			or providers.name in ${userPlaceholders(users, hashtags.length)}`;

  query += `WHERE ${queryHasHashtags ? queryPartHashtags : ""}${
    queryHasHashtags && queryHasUsers ? " or " : ""
  }${queryHasUsers ? queryPartUsers : ""}`;

  const values = hashtags.concat(users);
  pool
    .query(query, values)
    .then((result) => response.json(result.rows))
    .catch((err) => response.status(500).json(err));
});

app.post("/services", (req, res) => {
  const newproviderId = req.body.provider_id;
  const newreceiverId = req.body.receiver_id;
  const newpoints = req.body.points;
  const newcontent = req.body.content;
  const state = req.body.state;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const review = req.body.review;
  const comment = req.body.comment;
  pool
    .query("SELECT * FROM services WHERE content = $1", [newcontent])
    .then((result) => {
      if (result.rows.length < 150) {
        return res.status(400).send("an invalid request");
      } else {
        const query =
          "insert into services (provider_id,receiver_id,points, content ,state,start_date,end_date,review,comment) Values ($1,$2, $3,$4,$5,$6,$7,$8,$9 )";
        const parameters = [
          newproviderId,
          newreceiverId,
          newpoints,
          newcontent,
          state,
          start_date,
          end_date,
          review,
          comment,
        ];

        pool
          .query(query, parameters)
          .then((res) => res.send("request created!"))
          .catch((err) => res.json(err, 500));
      }
    });
});

app.get("/services/:receiver_id/content", (req, res) => {
  const receiver_id = req.params.receiver_id;
  let query = "select content from services where receiver_id= $1";

  const params = [receiver_id];

  pool
    .query(query, params)
    .then((result) => res.json(result.rows))
    .catch((err) => res.json(err, 500));
});

app.get("/services/:receiver_Id", (req, res) => {
  const receiverid = req.params.customerId;

  pool
    .query("SELECT * from services where receiver_id = $1", [receiverid])
    .then((result) => res.json(result.rows))
    .catch((err) => res.json(err, 500));
});

app.put("/services/:receiver_id", (req, res) => {
  const receiver_id = req.params.receiver_id;
  const content = req.body.content;
  let query = "UPDATE services SET content=$1 where receiver_id= $2";

  const params = [content, receiver_id];

  pool
    .query(query, params)
    .then((result) => res.json("updated!"))
    .catch((err) => res.status(200).json(err));
});

app.get("/content", (req, res) => {
  pool
    .query("SELECT content FROM services")
    .then((result) => res.json(result.rows))
    .catch((err) => res.json(err, 404));
});

app.post("/content", function (req, res) {
  const content = req.body.content;

  const query = "INSERT INTO services (content) VALUES ($1)";
  const parameters = [content];

  pool
    .query(query, parameters)
    .then((result) => res.send("content created!"))
    .catch((err) => res.status(200).json(err));
});

app.listen(5000, function () {
  console.log("Server is listening on port 5000. Ready to accept requests!");
});
