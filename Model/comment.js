const mongoose=require("mongoose");

const commentSchema=new mongoose.Schema({
    referenceUserId : { type : mongoose.Schema.ObjectId, required : true, ref : 'users' },
    referencePostId : { type : mongoose.Schema.ObjectId, required : true, ref : 'posts' },
    messageText: {type:String, required:true},
    replyCommentCount : { type : Number , default : 0 },
    replyLikeCount:{type : Number , default : 0},
    IsTrash: {type:Boolean, default:false},
    IsActive: {type:Boolean, default:true},
    Status:{type:Boolean, default:true}
},{timestamps : true})
module.exports = mongoose.model('comments', commentSchema);