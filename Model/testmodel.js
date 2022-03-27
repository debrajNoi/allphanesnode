const mongoose = require('mongoose');
const { Schema } = mongoose;

const personSchema = Schema({
    name:{
        type: String,
        required: true
     },
     email:{
        type: String,
        required: true
     },
     posts:[{
        type: Schema.Types.ObjectId, ref: "Post"
     }]
});



module.exports = mongoose.model('User', personSchema);