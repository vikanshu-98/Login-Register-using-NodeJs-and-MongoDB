require('dotenv').config();
const mongo = require('mongoose')
 
new mongo.connect("mongodb+srv://root:Staging123$@cluster0.dz1fd.mongodb.net/?retryWrites=true&w=majority")
.then(()=>console.log("connect succesfully"))
.catch((ex)=>console.log(ex));
 