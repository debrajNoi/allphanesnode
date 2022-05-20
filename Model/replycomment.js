const mongoose = require("mongoose");

const replycomment = new mongoose.Schema({
  referenceUserId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'users'
  },
  referencePostId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'posts'
  },
  referenceCommentId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'comments'
  },
  messageText: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: "true"
  }
}, {
  timestamps: true
});
module.exports = mongoose.model('replycomment', replycomment);