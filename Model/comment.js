const mongoose=require("mongoose");

const commentSchema=new mongoose.Schema({
    UserId:{type:String,required:true},
    RefPostId:{type:String,required:true},
    MsgText:{type:String, required:true},
    CreatedDate:{type:Date, default:""},
    Istarsh:{type:String, default:false},
    IsActive:{type:String, default:false},
    Status:{type:String, default:false},
},{timestamps : true});
module.exports=mongoose.model("comment",commentSchema);