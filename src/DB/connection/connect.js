const mongo = require('mongoose')
 
new mongo.connect(process.env.CONNECTION_URL)
.then(()=>console.log("connect succesfully"))
.catch((ex)=>console.log(ex));
 