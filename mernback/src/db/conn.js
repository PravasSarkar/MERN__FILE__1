const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path:".env"});
const DB = process.env.DB;

mongoose.connect(DB,{useNewUrlParser: true,useUnifiedTopology: true}
).then(() => {
    console.log(`Conntion Success`);
}).catch((e) => {
    console.log(`${e}`);
})