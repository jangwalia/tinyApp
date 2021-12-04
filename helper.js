const getuserByemail = function (email,database) {
  
  for(const check in database){
    if(database[check].email === email){
       return database[check];
       
     }
   }  return undefined;
};
const generateRandomString = function() {
  let code = "";
  const characters = '012345678910abcdefghijklmnopqrstuvwxyz';
  for(let i = 0;i <= 6 ;i ++){
  code +=   characters.charAt(Math.floor(Math.random() * characters.length));
  }return code;
  
};
module.exports = {getuserByemail,generateRandomString};