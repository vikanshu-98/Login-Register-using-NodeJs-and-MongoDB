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
const session        = require('express-session');
const port = process.env.PORT || 3300;
const statispath = path.join(__dirname, '../public')

require('./DB/connection/connect')
app.set("view engine", "hbs")
app.use(cookieParser());
app.use(express.static(statispath))
app.set('views', path.join(__dirname, '../template/views'))
hbs.registerPartials(path.join(__dirname, '../template/partials'))
app.use(express.urlencoded({extended:false}))

//use middleware 
app.use(session({resave:false,saveUninitialized:true,secret: 'keyboard cat', cookie:{ maxAge:12000 }}))
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
            const result = await fUsers.save()
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
      const resultEmail = await bcrypt.compare(password,result.password) 
      if(resultEmail){
         const token  = await result.saveToken()
         console.log(token);
         res.cookie('token',token,{
            expires:new Date(Date.now()+120000),
            httpOnly:true
         
         });
         req.session.regenerate(function(err){
            if(err) next(err); 
            let session =  req.session
            session.user = {}
            session.user.name= result.name;
            session.user.email= result.email;
            req.session.save(function(err){
               if(err) next(err)
               res.render('index',{
                  name:result.name
                  }) 
            })
 
         })
         // res.render('index',{
         //    name:result.name
         // }) 
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

const authenticate =  async function(req,res,next){
   console.log(req.url);
  if(req.url==='/logout'){
   console.log(req.url);
     console.log('request user data');
     console.log(req.userData);
      const session       = req.session;
      req.userData.tokens =[]
      await req.userData.save() 
      res.clearCookie('token') 
      if(session.user){
         session.user = null
         session.save(function(err){
            if(err) next(err)
            session.regenerate(function(err){
               if(err) next(err)
               res.redirect('/')
            })
         })
      }
  }else{
   if(req.session.user){
      req.name= req.session.user.name
      next()
   }
   else{
      req.name = "Undefined"
   }
  }
}

app.get('/secret', auth,authenticate,async (req, res) => {
   res.render('secret',{
     name:req.name 
   })
 })

 app.get('/logout', auth, authenticate,async(req, res) => {
   try{ 
      // single user logout


      // req.userData.tokens = req.userData.tokens.filter((currentToken)=>{
      //    return currentToken.token !== req.token
      // });

      // multiple user logout 
   }catch(err){
      res.status(500).send(err)
   }
})


app.get('/authorized', (req, res) => {
   res.render('authorized')
})

app.get('*', (req, res) => {
   res.status(404).render('authorized',{
      message:"Oops!! page not found.",
      is404:true
   })
})



app.listen(port, () => {
   console.log(`${port}`)
})