const mongoose=require("mongoose");

const likeSchema=new mongoose.Schema({
    RefuserId:{
        type:String,
        required:true
    },
    Lik:{
        type:String,
        required:true,
       
    }
});
module.exports = mongoose.model('Like', likeSchema);