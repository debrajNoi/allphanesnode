const mongoose = require('mongoose');

const userFriendsMap = new mongoose.Schema({
    referenceUserId : { type : mongoose.Schema.ObjectId, required : true, ref : 'user' },    
    acceptorId : { type : mongoose.Schema.ObjectId, required : true, ref : 'user' },    
    isAccepted : { type : Boolean, default : false }
},
{timestamps : true});

module.exports=mongoose.model('userFriendsMap',userFriendsMap);