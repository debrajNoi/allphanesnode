const mongoose=require("mongoose");

const commentSchema=new mongoose.Schema({
    referenceUserId : { type : mongoose.Schema.ObjectId, required : true, ref : 'users' },
    referencePostId : { type : mongoose.Schema.ObjectId, required : true, ref : 'posts' },
    messageText: {type:String, required:true},
    createdDate: {type:Date, default: ''},
    Istarsh: {type:String, default:false},
    IsActive: {type:String, default:false},
    Status:{type:String, default:false}
},{timestamps : true})
module.exports = mongoose.model('comments', commentSchema);