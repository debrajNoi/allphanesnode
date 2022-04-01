const mongoose=require("mongoose");

const notificationSchema=new mongoose.Schema({
    refrenceUId:{type:String, required:true},
    postId:{type:String, required:true},
    notiMsg:{type:String, required:true}
},{timestamps : true})
module.exports = mongoose.model('notification', notificationSchema);