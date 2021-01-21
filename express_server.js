const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
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

const findUserByEmail = (usersDb, email) => {
  for (let userId in usersDb) {
    if (usersDb[userId].email === email) {
      return usersDb[userId];
    }
  }
  return false;
};

const authenticateUser = (usersDb, email, password) => {
  // find the user with the email
  const userFound = findUserByEmail(usersDb, email);

  // if user is retrieved and the password checks out return the user
  // otherwise return false
  if (userFound && userFound.password === password) {
    return userFound;
  }

  return false;
};

// returns the list or urls that belongs to the id of the user
const urlsForUser = (urlsDb, id) => {
  const userUrls = {};

  for (let shortURL in urlsDb) {
    // if the url belongs to the user, add it to userUrls
    if (urlsDb[shortURL].userID === id) {
      userUrls[shortURL] = urlsDb[shortURL];
    }
  }

  return userUrls;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  console.log(urlsForUser(urlDatabase, userId));

  const templateVars = {
    urls: urlsForUser(urlDatabase, userId),
    user: users[userId],
  };

  if (!userId) {
    res.statusCode = 401;
    let templateVars = {
      user: users[userId],
      errMessage: "401 To access the requested page you need to login first!",
    };
    res.render("urls_notFound", templateVars);
    return;
  }

  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];

  // if the user is not logged in, redirect to login page
  if (!userId) {
    res.redirect("/login");
    return;
  }

  const templateVars = { user: users[userId] };
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

  const user = findUserByEmail(users, email);

  if (user) {
    res
      .status(400)
      .send("A user with that email already exists, try to login instead");
    return;
  }

  // for (const user in users) {
  //   if (users[user].email === email) {
  //     res
  //       .status(400)
  //       .send("A user with that email already exists, try to login instead");
  //     return;
  //   }
  // }

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

app.post("/login", (req, res) => {
  //console.log(req.body.username);
  const email = req.body.email;
  const password = req.body.password;
  console.log("email", email);
  console.log("password", password);

  //THIS  IS NOT REQUIRE IF THE REGISTER PAGE WORKS
  // if (!email || !password) {
  //   // res.status(400).send(errorMsg);
  //   res.statusCode = 404;
  //   res.end("Please fill in both password and email!");
  // }

  //THIS IS NEEDED IF THERE IS NOT AUTHENTICATION FUNCTION
  // let userExist = false;
  // let userId;
  // for (const user in users) {
  //   if (users[user].email === email && users[user].password === password) {
  //     userExist = true;
  //     userId = users[user].id;
  //   }
  // }

  // if (userExist) {
  //   res.cookie("user_id", userId);
  //   res.redirect("/urls");
  // } else {
  //   res.status(403).send("User not exist or password not match");
  //   return;
  // }

  //res.cookie("username", req.body.user);
  //res.redirect(`/urls`);

  const authenticatedUser = authenticateUser(users, email, password);
  if (authenticatedUser) {
    // if the user is authenticated, set the user id in the cookies
    res.cookie("user_id", authenticatedUser.id);

    res.redirect("/urls");
  } else {
    // The user is not authenticated
    res.status(403).send("Wrong credentials!");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // const userId = req.cookies["user_id"];
  // const shortURL = req.params.shortURL;

  // const urlBelongsToUser =
  //   urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId;

  // if (!urlBelongsToUser) {
  //   res.statusCode = 401;
  //   let templateVars = {
  //     user: users[userId],
  //     errMessage: "401 The requested URL does not belong to you!",
  //   };
  //   res.render("urls_notFound", templateVars);
  //   return;
  // }

  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

//to handle the POST request from the client to edit an existing long URL in the database
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  //urlDatabase[req.params.shortURL].userID = req.session["user_id"];
  //redirection to specific page for the new created short link
  res.redirect("/urls/");
});

//genereta new short url
app.post("/urls", (req, res) => {
  //generete random short URL
  const newShortURL = generateRandomString();
  console.log(urlDatabase);
  console.log("newShortURL", newShortURL);
  console.log("req.body.longURL", req.body.longURL);
  console.log("req.cookies user_id", req.cookies["user_id"]);
  urlDatabase[newShortURL] = {};
  urlDatabase[newShortURL].longURL = req.body.longURL;
  urlDatabase[newShortURL].userID = req.cookies["user_id"];
  console.log(urlDatabase);
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const shortURL = req.params.shortURL;

  const urlBelongsToUser =
    urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId;

  if (!userId) {
    res.statusCode = 401;
    let templateVars = {
      user: users[userId],
      errMessage: "401 To access the requested URL you need to login first!",
    };
    res.render("urls_notFound", templateVars);
    return;
  }

  if (!urlBelongsToUser) {
    res.statusCode = 401;
    let templateVars = {
      user: users[userId],
      errMessage: "401 The requested URL does not belong to you!",
    };
    res.render("urls_notFound", templateVars);
    return;
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

//generate a link that will redirect to the appropriate longURL
app.get("/u/:shortURL", (req, res) => {
  //const longURL = urlDatabase[req.params.shortURL].longURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
