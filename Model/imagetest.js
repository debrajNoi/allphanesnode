const mongoose = require('mongoose');
const { Schema } = mongoose;


const storySchema = Schema({
    title: String,
    desc: String,
    User:  Schema.Types.ObjectId
  
});

module.exports = mongoose.model('Post', storySchema);