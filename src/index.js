require('dotenv').config();
const express = require('express')
const hbs = require('hbs')
const app = express()
const path = require('path')
const users = require('./DB/Models/users')
const bcrypt =require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const cookieParser  =  require("cookie-parser")
const auth          = require('./Middleware/auth');
const { response } = require('express');
const port = process.env.PORT | 3300;
const statispath = path.join(__dirname, '../public')

require('./DB/connection/connect')
app.set("view engine", "hbs")
app.use(cookieParser());
app.use(express.static(statispath))
app.set('views', path.join(__dirname, '../template/views'))
hbs.registerPartials(path.join(__dirname, '../template/partials'))
app.use(express.urlencoded({extended:false}))
app.get('/', (req, res) => {
   res.render('index')
})
app.get('/register', (req, res) => {
   res.render('register')
}); 
app.post('/', async (req, res) => {
   try{
      // console.log(req.body.email)
      const email = req.body.email;
      const password= req.body.password;
      const cpassword = req.body.cpassword;
      const name = req.body.name;
      // const result = await users.findOne({email:email}); 
      // if(result){
      //    res.send('Already registered email !!')
      // }else{
         if(password === cpassword){
            const fUsers= new users({
               name:name,
               email:email,
               password:password,
               cpassword:cpassword
             })
 
            const token  = await fUsers.saveToken()
            //  console.log(token);
            res.cookie('token',token,{
               expires:new Date(Date.now()+600000),
               httpOnly:true
            
            });
            const result = await fUsers.save(fUsers)
            if(result){
               // console.log(result);
               res.redirect('/')
            }
            else{
               res.error(401).send('Some thing went wrong!!')
            }
         }else{
            res.send('password donot match !!')
         }
      // }
   }catch(Ex){
      res.send(Ex)
   }
});

app.post('/login', async (req, res) => {
   try{ 
      const email       = req.body.email;
      const password    = req.body.password; 
      const result      = await users.findOne({email:email}); 
      const resultEmail = await bcrypt.compare(password,result.password);
      const token  = await result.saveToken()
      res.cookie('token',token,{
         expires:new Date(Date.now()+120000),
         httpOnly:true
      
      });
       
      if(resultEmail){
         res.render('index') 
      }else{    
         res.send('Invalid Email !!')
      }
   }catch(Ex){
      res.send(Ex)
   }
});

app.get('/login', (req, res) => {
   res.render('login')
})

app.get('/jsonWebToken',async (req, res) => {
  const token= await jsonwebtoken.sign({_id:'62822e12bf4f28cb6f0bf597'},'Vikanshu chuahanis  a good boy',{expiresIn:"5s"})
  res.send(token);

  const result = await jsonwebtoken.verify(token,'Vikanshu chuahanis  a good boy');
//   console.log(result);
})


app.get('/secret', auth, (req, res) => {
 
   res.render('secret')
 })

 app.get('/logout', auth, async(req, res) => {
   try{ 
      // single user logout


      // req.userData.tokens = req.userData.tokens.filter((currentToken)=>{
      //    return currentToken.token !== req.token
      // });

      // multiple user logout 
      req.userData.tokens=[]

      // console.log("modified data and token is++++++");
      // console.log(req.userData.length);
      await req.userData.save() 
      res.clearCookie('token')
      res.render('login')
   }catch(err){
      res.status(500).send(err)
   }
})

app.get('*', (req, res) => {
   res.status(404).send('oops!! page not found')
})



app.listen(port, () => {
   console.log(`${port}`)
})