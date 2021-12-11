const jwt = require("jsonwebtoken");
const Register = require("../models/register");

const auth = async (req , res ,next) =>{
    try{
        
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token , "mynameisthappayouarewellcomeiamcomplete");
        const user = await Register.findOne({_id:verifyUser._id});
        console.log(user);
        req.token = token;
        req.user = user;
        next();
    }catch(error){
        res.status(400).send(error);
    }
}

module.exports = auth;