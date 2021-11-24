const express = require("express");
const app = express();
const path = require('path');
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls",(req,res)=>{
  res.render('urls_index',{urls : urlDatabase});
})

app.get('/urls/:shortURL',(req,res)=>{
  const{shortURL} = req.params;
  const longurl = urlDatabase[shortURL];
  res.render('urls_show',{shortURL,longurl});
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});