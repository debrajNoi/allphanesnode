const mongoose = require('mongoose');

const gallery = new mongoose.Schema({
    referenceUserId:{type : mongoose.Schema.ObjectId, required : true, ref : 'users'},
    referencePostId : { type : mongoose.Schema.ObjectId, required : true, ref : 'posts' },    
    postImagePath : { type : String, required : true },
    isActive : { type : Boolean, default : false },
    isTrash : { type : Number, default : false },
    status : { type : Boolean, default : false }
},
{timestamps : true});

module.exports=mongoose.model('gallery',gallery);