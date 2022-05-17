const mongo = require('mongoose')
const validator  = require('validator')
const bcrypt  = require('bcrypt')
const webToken =  require('jsonwebtoken')
const scheema  = new mongo.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
     type:String,
     required:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid!!')
            }
        }
    },
    password:{
        type:String,
        required:true
    },
    cpassword :{
        type:String,
        required:true
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]
})

scheema.methods.saveToken =async function(){
    try{
        const token = webToken.sign({_id:this._id.toString()},process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({token})
        console.log(process.env.SECRET_KEY)
        await this.save()
        return token;
    }catch(ex){
        console.log(ex);
    }
}
//middleware


scheema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10)
        this.cpassword =await bcrypt.hash(this.cpassword,10)
        next()
    } 

})
//collection (models)

const modelsUser = new mongo.model('user',scheema)




module.exports = modelsUser
