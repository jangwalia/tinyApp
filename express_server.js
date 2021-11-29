//creating express server
const express = require("express");
const app = express();
const path = require('path');
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { url } = require("inspector");
const cookieParser = require("cookie-parser");
const { constants } = require("buffer");
const { log } = require("util");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
//Generate random string
function generateRandomString() {
  let code = "";
  const characters = '012345678910abcdefghijklmnopqrstuvwxyz';
  for(let i = 0;i <= 6 ;i ++){
  code +=   characters.charAt(Math.floor(Math.random() * characters.length));
  }return code;
  
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
//checking email already exists in users
function checkemail(email,database){
  for(const check in database){
   if(database[check]['email'] === email){
       return true;
     }
   }  return false;
}



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
//#######  DIFFERENT ROUTES  #############

//Home Page route
app.get("/", (req, res) => {
  res.send("Hello!");
});

//show all urls route
app.get("/urls",(req,res)=>{
  const {id} = req.cookies;
  const user = users[id]
  const tempVariable = {
   urls : urlDatabase,
   user,
}
  res.render('urls_index',tempVariable);
})
//###### GET REQUEST TO SHOW THE FORM
app.get("/urls/new", (req, res) => {
  const {id} = req.cookies;
  const user = users[id]
  const tempVariable = {
   urls : urlDatabase,
   user,
}
 res.render("urls_new",tempVariable);
});

//show individual url route
app.get('/urls/:shortURL',(req,res)=>{
  const shortURL = req.params.shortURL;
  const longurl = urlDatabase[shortURL];
  const {id} = req.cookies;
  const user = users[id];
  const tempVariable = {
   urls : urlDatabase,
   user,
   longurl,
   shortURL
}
  res.render('urls_show',tempVariable);
})
//######### POST REQUEST FROM THE FORM
 app.post('/urls',(req,res)=>{
  const{longURL} = req.body;
  const newCode = generateRandomString();
  urlDatabase[newCode] = longURL;
  res.redirect(`/urls/${newCode}`);
 })

// fetch long url route
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(shortURL in urlDatabase){
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
  }
  else{
    res.send("Page Not Found, Error 404");
  }
});

// Delete Route
app.post('/urls/:shortURL/delete',(req,res)=>{
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})
//UPDATE Route
app.post('/urls/:id',(req,res)=>{
  const id = req.params.id;
  const longURL = req.body.newURL
  urlDatabase[id] = longURL;
  res.redirect('/urls');
})
//Log IN Route

app.get('/login',(req,res)=>{
  const {id} = req.cookies;
  const user = users[id]
  const tempVariable = {
   urls : urlDatabase,
   user,
}
 res.render('login',tempVariable);
})
//POST route for log in page
app.post('/login',(req,res)=>{
  const{email,password} = req.body;
    if(checkemail(email,users)){
      for(const pwd in users){
        if(users[pwd]['password'] === password){
          const id = users[pwd]['id'];
          res.cookie('id',id);
          res.redirect('/urls');
        }
      }
  }else{
    res.status(403).send("Email or password does not match..");
  }
})
// LOGOUT Route
app.post('/logout',(req,res)=>{
  res.clearCookie('id');
  res.redirect('/urls');
  
})


//Register Route to show register form

app.get('/register',(req,res)=>{
  const {id} = req.cookies;
  const user = users[id]
  const tempVariable = {
   urls : urlDatabase,
   user,
}
  res.render('register',tempVariable);
})

//post request from register to update user object
app.post('/register',(req,res)=>{
  const{email,password} = req.body;
  if(!email || !password){
    res.status(400).send("Enter email and password..");
  }
  else if(!checkemail(email,users)){
      const user_id = generateRandomString();
      const user = {
      id : user_id,
      email : email,
      password : password
    }
    users[user_id] = user
    res.cookie('id',user_id);
    res.redirect('/urls');
    
    
  }
  else{
    res.status(400).send("Email already exists..");
  }
});
  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});