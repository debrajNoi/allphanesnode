const mongoose=require("mongoose");

const replaycomment=new mongoose.Schema({
  commentId:{type : mongoose.Schema.ObjectId, required : true, ref : 'comments'},
  referenceUserId:{type: mongoose.Schema.ObjectId, required: true, ref: 'users'},
  messageText:{type: String},
  status:{type:String, default:"false"}
},{timestamps : true});
module.exports = mongoose.model('replaycomments', replaycomment);