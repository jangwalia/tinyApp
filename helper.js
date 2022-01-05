const getuserByemail = function (database,email) {
  for(const key in database){
    if(database[key].email === email){
      return database[key];
   }
  }
  return undefined;
};
const getuserBYID = (database,id)=>{
  
  for(const key in database){
    if(database[key].id === id){
      return (database[key]);
    }
  }
 
}
const getUrl = (database,id)=>{
  let result = {};
  for(const check in database){
    if(database[check].userID === id){
      result[check] = {
        longURL : database[check].longURL,
        userID : database[check].userID
      }
    }
  }return result;
 
}
const generateRandomString = function() {
  let code = "";
  const characters = '012345678910abcdefghijklmnopqrstuvwxyz';
  for(let i = 0;i <= 6 ;i ++){
  code +=   characters.charAt(Math.floor(Math.random() * characters.length));
  }return code;
  
};
module.exports = {getuserByemail,generateRandomString,getUrl,getuserBYID};