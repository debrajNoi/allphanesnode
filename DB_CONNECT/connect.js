const mongoose=require("mongoose");
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myFirstDatabase' ;
mongoose.connect(uri,{
    useNewUrlParser: true,
    // useFindAndModify: true,
    // useFindAndModify: false,
    useUnifiedTopology: true
}).then(()=>{
    console.log("Database connection successfull");
}).catch((err)=>{
    console.log(err)
})

