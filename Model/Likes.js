const mongoose=require("mongoose");

const likeSchema=new mongoose.Schema({
    referenceUserId:{type:mongoose.Schema.ObjectId, required:true, ref: 'users'},
    referencePostId : { type : mongoose.Schema.ObjectId, required : true, ref : 'posts' },
    dateTime:{type:Date, default:""},
    isLike:{type:Boolean, default:false},
    isShare:{type:Boolean, default:false},
    isComment:{type:Boolean, default:false},
    status:{type:Boolean, default:false}
},{timestamps:true})
module.exports = mongoose.model('likes', likeSchema);