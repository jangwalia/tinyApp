//creating express server
const express = require("express");
const app = express();
const path = require('path');
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { url } = require("inspector");
//const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session')
const { constants } = require("buffer");
const { log } = require("util");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
//using sessions to secure cookies
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
//Generate random string
function generateRandomString() {
  let code = "";
  const characters = '012345678910abcdefghijklmnopqrstuvwxyz';
  for(let i = 0;i <= 6 ;i ++){
  code +=   characters.charAt(Math.floor(Math.random() * characters.length));
  }return code;
  
}

const users = { 
  
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
  // {shorturl : {longUrL :  'www.some.com' , userID : user1randomID }}
  //{shorturl 2 :  {{longUrL :  'www.abc.com' , userID : user2randomID }}}
  //{shorturl 3 :  {{longUrL :  'www.xyz.com' , userID : user2randomID }}}
  
};
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
//#######  DIFFERENT ROUTES  #############

//Home Page route
app.get("/", (req, res) => {
  res.send("Hello!");
});
//function to get urls for user





//show all urls route
app.get("/urls",(req,res)=>{
  let result = {};
  const user = users[req.session.user_id];
  //to check if only currently logged user can access his created URLS
  for(const url in urlDatabase){
   if(urlDatabase[url].userID === req.session.user_id){
    result[url] =  urlDatabase[url]
   }
  }
  const tempVariable = {
    user,
    urls : result
   }
  res.render('urls_index',tempVariable);
});
//###### GET REQUEST TO SHOW THE FORM
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id]
  if(req.session.user_id){
  const tempVariable = {
   urls : urlDatabase,
   user,
}
 res.render("urls_new",tempVariable);
}else{
  res.redirect('/login');
}
});

//show individual url route
app.get('/urls/:shortURL',(req,res)=>{
  const shortURL = req.params.shortURL;
  const longurl = urlDatabase[shortURL]['longURL'];
  const user = users[req.session.user_id];
  const tempVariable = {
   user,
   longurl,
   shortURL
}
  res.render('urls_show',tempVariable);
})
//######### POST REQUEST FROM THE FORM
 app.post('/urls',(req,res)=>{
  const{longURL} = req.body;
  const shortURL = generateRandomString();
  const data = {
    longURL,
    userID : req.session.user_id
  }
  urlDatabase[shortURL] = data;
 
  
  res.redirect(`/urls/${shortURL}`);
 })

// fetch long url route
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(shortURL in urlDatabase){
  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
  }
  else{
    res.send("Page Not Found, Error 404");
  }
});

// Delete Route
app.post('/urls/:shortURL/delete',(req,res)=>{
  const userid = req.session.user_id;
  let currentUser = "";
  const {shortURL} = req.params;
  //only the current logged user can delete their urls
  for(const key in urlDatabase){
    currentUser = urlDatabase[key].userID;
    if(currentUser !== userid){
      res.redirect ('/login');
    }
    delete urlDatabase[shortURL];
  }
    res.redirect('/urls');
})
//UPDATE Route
 app.post('/urls/:id',(req,res)=>{
  let currentUser = "";
  const userid = req.session.user_id;
  const id = req.params.id;
  //To check that only logged user can edit their urls
  for(const user in urlDatabase){
     currentUser = urlDatabase[user].userID;
     if(currentUser !== userid){
      res.redirect('/login');
    }
    let newURL = req.body.newURL;
    urlDatabase[user].longURL = newURL;
  }
  res.redirect('/urls');

})
//Log IN Route

app.get('/login',(req,res)=>{
  
  const user = users[req.session.user_id]
  const tempVariable = {
   urls : urlDatabase,
   user,
}
 res.render('login',tempVariable);
})
//POST route for log in page
app.post('/login',(req,res)=>{
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if(checkemail(email,users)){
      for(const pwd in users){
       if(bcrypt.compareSync(password, hashedPassword)){
          const id = users[pwd]['id'];
          req.session.user_id  = id
          res.redirect('/urls');
        }
      }
  }else{
    res.status(403).send("Email or password does not match..");
  }
})
// LOGOUT Route
app.post('/logout',(req,res)=>{
  req.session = null
  res.redirect('/urls');
  
})


//Register Route to show register form

app.get('/register',(req,res)=>{
  const user = users[req.session.user_id]
  const tempVariable = {
   urls : urlDatabase,
   user,
}
  res.render('register',tempVariable);
})

//post request from register to update user object
app.post('/register',(req,res)=>{
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);
  if(!email || !password){
    res.status(400).send("Enter email and password..");
  }
  else if(!checkemail(email,users)){
      const user_id = generateRandomString();
      const user = {
      id : user_id,
      email,
      password
    }
    users[user_id] = user
    req.session.user_id = user_id;
    //res.cookie('id',user_id);
    res.redirect('/urls');
    
    
  }
  else{
    res.status(400).send("Email already exists..");
  }
});
  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});