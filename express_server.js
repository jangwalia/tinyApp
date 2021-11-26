//creating express server
const express = require("express");
const app = express();
const path = require('path');
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { url } = require("inspector");
const cookieParser = require("cookie-parser");
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
  const tempVariable = {
    urls : urlDatabase,
    username : req.cookies.name 
  }
  res.render('urls_index',tempVariable);
})
//###### GET REQUEST TO SHOW THE FORM
app.get("/urls/new", (req, res) => {
 const username = req.cookies.name 
  res.render("urls_new",{username});
});

//show individual url route
app.get('/urls/:shortURL',(req,res)=>{
  const shortURL = req.params.shortURL;
  const longurl = urlDatabase[shortURL];
  const username = req.cookies.name ;
  res.render('urls_show',{shortURL,longurl,username});
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

app.post('/login',(req,res)=>{
  const username = req.body.username;
  res.cookie('name',username);
  res.redirect('/urls');
})
// LOGOUT Route
app.post('/logout',(req,res)=>{
  res.clearCookie('name');
  res.redirect('/urls');
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});