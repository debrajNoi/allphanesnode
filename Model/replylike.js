const mongoose = require("mongoose");

const relikeSchema = new mongoose.Schema({
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
    isLike: {
        type: Boolean,
        default: false
    },
    isComment: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('relikes', relikeSchema);