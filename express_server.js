const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//generate a "unique" shortURL, by returning a string of 6 random alphanumeric characters
//used to generate random shortURL
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  //const user = users[req.cookies["user_id"]];
  //console.log(user);
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    // res.status(400).send(errorMsg);
    res.statusCode = 404;
    res.end("Please filli in both password and email!");
  }

  // const findUserByEmail = (usersDb, email) => {
  //   for (let userId in usersDb) {
  //     if (usersDb[userId].email === email) {
  //       return usersDb[userId];
  //     }
  //   }

  //   return false;
  // };

  //const user = findUserByEmail(users, email);

  // if (user) {
  //   res
  //     .status(400)
  //     .send('A user with that email already exists, try to login instead');
  //   return;
  // }

  for (const user in users) {
    if (users[user].email === email) {
      res
        .status(400)
        .send("A user with that email already exists, try to login instead");
      return;
    }
  }

  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: email,
    password: password,
  };
  //console.log(users);
  res.cookie("user_id", newUserId);
  res.redirect(`/urls`);
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.post("/urls/login", (req, res) => {
  //console.log(req.body.username);
  res.cookie("username", req.body.username);
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  //generete random short URL
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

//generate a link that will redirect to the appropriate longURL
app.get("/u/:shortURL", (req, res) => {
  //const longURL = urlDatabase[req.params.shortURL].longURL;
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
