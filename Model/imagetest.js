const mongoose=require("mongoose");

const imgSchema=new mongoose.Schema({
    productimage:{
        type:String,
        required:true
    }
});
module.exports=mongoose.model("img",imgSchema);