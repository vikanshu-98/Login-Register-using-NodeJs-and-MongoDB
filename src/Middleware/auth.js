
const jsonwebtoken = require('jsonwebtoken')
const users = require('../DB/Models/users')
 const auth = async function(req,res,next){
    try{
        let cookies = req.cookies.token
        if(cookies===undefined){
            res.redirect('/')
        }else{
            // console.log(jsonwebtoken.verify(cookies,process.env.SECRET_KEY))
            let Token = jsonwebtoken.verify(cookies,process.env.SECRET_KEY)
            const userData = await users.findOne({_id:Token._id})
            req.token = cookies;
            req.userData = userData;
            next()
        }
    }
    catch(Error){
        res.status(401).send(Error)
    }
}

module.exports=auth
