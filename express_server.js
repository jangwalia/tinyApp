//creating express server
const express = require("express");
const app = express();
const path = require('path');
const PORT = 8080; // default port 8080
//const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const {getuserByemail,generateRandomString,getUrl,getuserBYID} = require('./helper');
const { url } = require("inspector");
app.use(express.urlencoded({extended: false}));
app.use(express.json());
//app.use(cookieParser());
//using sessions to secure cookies
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//sample users database
const users = { 
  'xb1yw2a':{
  id: 'xb1yw2a',
  email: 'jangiwalia83@gmail.com',
  password: '$2b$10$bFzNi9KMpyR8a8Pl5M/xg.whwP09HUBH2gtns8kXTMSHUgK5VkAnG'
}
}
//sample url database

const urlDatabase = {
  //shorturl : { 
    //longURL : facebook.com,userID : req.session.id
  //}
};
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
//#######  DIFFERENT ROUTES  #############

//Home Page route
app.get("/", (req, res) => {
  const user = users[req.session.id];
  const tempVariable = {
    user,
    urls : urlDatabase
   }
  res.render('homepage',tempVariable);
});
//index Route
app.get("/urls",(req,res)=>{
  const id = req.session.id;
  if(!id){
    return res.redirect('/');
  }
  const user = users[id]
  const urls = getUrl(urlDatabase,id);
  const tempVariable = {
    user,
    urls
  }
  res.render('urls_index',{tempVariable});
});
//###### GET REQUEST TO SHOW THE FORM
app.get("/urls/new", (req, res) => {
  const id = req.session.id;
  const user = users[id]
  if(id){
  const tempVariable = {
  user
}
 res.render("urls_new",{tempVariable});
}else{
  res.redirect('/login');
}
});

//show  route
app.get('/urls/:shortURL',(req,res)=>{
  const shortURL = req.params.shortURL;
  if(!(shortURL in urlDatabase)){
    return res.status(400).redirect('/login');
  }
  const longurl = urlDatabase[shortURL].longURL;
  //logged out user can not access and edit the url
  if(!req.session.id){
   return res.status(400).redirect('/login');
  }
  const id = req.session.id;
  const user = users[id];
  const tempVariable = {
   user,
   longurl,
   shortURL
}
  res.render('urls_show',{tempVariable});
})
//######### POST REQUEST FROM THE FORM
 app.post('/urls',(req,res)=>{
   const id = req.session.id;
  const{longURL} = req.body;
  const shortURL = generateRandomString();
  const data = {
    longURL,
    userID : id
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
//UPDATE Route
app.patch('/urls/:id',(req,res)=>{
  const urlID = req.params.id;
  const id = req.session.id;
  const {newURL} = req.body;
  
  if(!id){
    res.send("permission denied");
  }
  const url = getUrl(urlDatabase,id)
  for(let key in url){
    url[key].longURL = newURL;
  }
  return res.redirect('/urls');

})
// Delete Route
app.post('/urls/:shortURL/delete',(req,res)=>{
  const userid = req.session.id;
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

//Log IN Route

app.get('/login',(req,res)=>{
  
  const user = users[req.session.id]
  const tempVariable = {
    user,
    urls : urlDatabase
}
 res.render('login',{tempVariable});
})
//POST route for log in page
app.post('/login',(req,res)=>{
  const email = req.body.email;
  const password = req.body.password;
  const user = getuserByemail(users,email);
  if (user === undefined || email !== user.email) {
    return res.status(403).send('User details not found');
  }
  if(bcrypt.compareSync(password,user.password)){
        const userID = user.id;
        req.session.id = userID;
        return res.redirect('/urls');
      }
  res.status(403).send("Email or password does not match..");
  
})
// LOGOUT Route
app.post('/logout',(req,res)=>{
  req.session = null
  return res.redirect('/urls');
  
})


//Register Route to show register form

app.get('/register',(req,res)=>{
  const user = users[req.session.id]
  const tempVariable = {
   user,
}
  res.render('register',{tempVariable});
})

//post request from register to update user object
app.post('/register',(req,res)=>{
  const{email,password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  if(!email || !password){
    res.status(400).send("Enter email and password..");
  }
  const userEmail = getuserByemail(users,email);
  if(userEmail !== undefined){
    res.send("email already exist");
  }
  const user = {
      id,
      email,
      password : hashedPassword
    }
    users[id] = user
    req.session.id = id;
    //res.cookie('id',user_id);
    return res.redirect('/urls');
});
  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = {users};