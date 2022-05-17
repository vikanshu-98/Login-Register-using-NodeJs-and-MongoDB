require('dotenv').config();
const mongo = require('mongoose')
 
new mongo.connect(process.env.DB_CONNECTION_URL)
.then(()=>console.log("connect succesfully"))
.catch((ex)=>console.log(ex));
 