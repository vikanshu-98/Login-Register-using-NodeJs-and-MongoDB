const mongo = require('mongoose')

new mongo.connect("mongodb://localhost:27017/students")
.then(()=>console.log("connect succesfully"))
.catch((ex)=>console.log(ex));