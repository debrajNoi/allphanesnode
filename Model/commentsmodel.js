const mongoose=require("mongoose");

const commentSchema=new mongoose.Schema({
    RefuserId:{
        type:String,
        required:true
    },
    comment:{
        type:String,
        required:true
    }
});
module.exports = mongoose.model('comment', commentSchema);