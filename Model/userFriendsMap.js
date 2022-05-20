const mongoose = require('mongoose');

const userFriendsMap = new mongoose.Schema({
    referenceUserId : { type : mongoose.Schema.ObjectId, required : true, ref : 'users' },    
    acceptorId : { type : mongoose.Schema.ObjectId, required : true, ref : 'users' },    
    isAccepted : { type : Boolean, default : false }
},
{timestamps : true});

module.exports=mongoose.model('userFriendsMap',userFriendsMap);

