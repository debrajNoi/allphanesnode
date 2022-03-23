const mongoose = require('mongoose');
// const { Schema } = mongoose;
const { required } = require('nodemon/lib/config');

const allphanuserimagegellaryScema=new mongoose.Schema({
    RefPostId:{
        type:String,
        required:true
    },    
    PaostImagePath:{
        type:String,
        required:true
    },
    IsActive:{
        type:String,
        default:false
    },
    IsTarsh:{
        type:Number,
        default:0
    },
    Status:{
        type:String,
        default:false
    }
},{timestamps:true});
module.exports=mongoose.model('Allphanuserimagegellary',allphanuserimagegellaryScema);