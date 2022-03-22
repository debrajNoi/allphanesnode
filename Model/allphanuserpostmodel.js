const mongoose = require('mongoose');
const { Schema } = mongoose;

const allphanuserpostSchema=Schema({
    // _id: Schema.Types.ObjectId,
    // _id: Schema.Types.ObjectId,
    stories: [{ type: Schema.Types.ObjectId, ref: 'Allphanuserimagegellary' }],
    RefrenceUId:{
        type:String,
        required:true
    },
    PostTitle:{
        type:String,
        required:true
    },
    PostDescription:{
        type:String,
        required:true
    },
    PostDateTime:{
        type:Date,
        default:Date.now
    },
    Isactive:{
        type:String,
        default:false
    },
    Istarsh:{
        type:String,
        default:false
    },
    ModifiedDateTime:{
        type:Date,
        default:Date.now
    },
    CountViews:{
        type:String,
        default:0
    }
},{timestamps:true});
module.exports = mongoose.model('Allphanesuserpost', allphanuserpostSchema);