const express = require("express");
const dotenv = require("dotenv");
const app = express();
const bcrypt = require("bcryptjs");
const path = require("path");
require("./db/conn");
const hbs = require("hbs");
const Register = require("../src/models/register");
dotenv.config({path:".env"});
const port = process.env.PORT;
const cookeiParser=require("cookie-parser");
const auth = require("./middleware/auth");
app.use(cookeiParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");

app.use(express.static(static_path));
app.set("view engine" , "hbs");
app.set("views" , template_path);
hbs.registerPartials(partials_path);

app.get("/",(req , res) => {
    const cokie = req.cookies.jwt;
    console.log(`YOUR COOKIE IS ${cokie}`);
    res.render("index");
});

app.get("/secret",auth,(req , res) => {
    const cokie = req.cookies.jwt;
    console.log(`YOUR COOKIE IS ${cokie}`);
    res.render("secret");
});

app.get("/logout",auth,async(req , res) => {
    try{
        res.clearCookie("jwt");
        console.log("Logout Sucessfull");
        req.user.tokens = []
        await req.user.save();
        res.render("login");
    }catch(error)
    {
        console.log(error);
    }
});

app.get("/register",(req , res) => {
    res.render("register");
});

app.post("/register", async(req , res) => {
    try{
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if(password === cpassword)
        {
            const registerEmployee = new Register({
                firstname : req.body.fname,          
                lastname : req.body.lname,        
                email : req.body.email,
                gender : req.body.gender,
                phone : req.body.phone,
                age : req.body.age,
                password : password
            });
            const token = await registerEmployee.generateAuthToken();
            console.log(token);
            res.cookie("jwt",token ,{
                expires: new Date(Date.now()+(1000*2592000)),
                httpOnly:true
            });
            const registered = await registerEmployee.save();
            res.status(201).render("index");
        }else
        {
            res.send("Password Are Not Same");
        }
    }catch(err)
    {
        console.log(err);
        res.status(400).send(err);
    }
})

app.get("/login",(req , res) => {
    res.render("login");
});

app.post("/login", async(req , res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;

        const userEmail = await Register.findOne({email:email});

        const compairepass = await bcrypt.compare(password , userEmail.password);

        const token = await userEmail.generateAuthToken();
        res.cookie("jwt",token ,{
            expires: new Date(Date.now()+(1000*2592000)),
            httpOnly:true
        });
        if(compairepass)
        {
            res.status(201).render("index");
        }else
        {
            res.send("NOT WORKING");
        }
    }catch(err){
        res.status(400).send(err);
        console.log(err);
    }
});

app.listen(port , () => {
    console.log(`Server is Running on localhost:${port}`);
});