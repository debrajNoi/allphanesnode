const express = require('express')
const globalfunction = require('../global')
const jwt = require('jsonwebtoken')
const config = require("../config")

const {
    ObjectId
} = require("mongodb")
const router = express.Router()
const Like = require("../Model/Likes")
const replyLikeModel = require("../Model/replylike")
const replyCommentsModel = require("../Model/replycomment")
const commentModel = require("../Model/comment")

router.get("/viewallcomment", async (req, res) => {
    try {
        MongoClient.connect(url, function (err, db) {
            if (err)
                throw err

            let dbo = db.db("myFirstDatabase")
            // let refUserId = ObjectId(req.params.id)

            dbo.collection('posts').aggregate([

                    // {
                    //     $match:{_id:ObjectID("626959e75e0cbe5d5bdae58e")}
                    // },

                    {
                        $lookup: {
                            from: 'comments',
                            localField: '_id',
                            foreignField: 'referencePostId',
                            as: 'comment_info'
                        },
                    },

                    {
                        $lookup: {
                            from: 'relikes',
                            localField: '_id',
                            foreignField: 'referencePostId',
                            as: 'reply_likes'
                        },
                    },
                    {
                        $lookup: {
                            from: 'replycomments',
                            localField: '_id',
                            foreignField: 'referencePostId',
                            as: 'reply_comment'
                        },
                    },
                    {
                        $project: {
                            referenceUserId: 1,
                            postTitle: 1,
                            postDescription: 1,
                            postImage: 1,
                            isActive: 1,
                            isTrash: 1,
                            status: 1,
                            isLike: 1,
                            reply_comment: 1,
                            comment_info: 1,
                            countViews: 1,
                            user_likes: 1,
                            reply_likes: 1,
                            user_comment: 1,
                            totalLikes: {
                                $sum: {
                                    $map: {
                                        "input": '$reply_likes',
                                        'as': 'reply_likes',
                                        'in': {
                                            $cond: [{
                                                $eq: ["$$reply_likes.isLike", true]
                                            }, 1, 0]
                                        }
                                    }
                                }
                            },
                            replycomment: {
                                $sum: {
                                    $map: {
                                        "input": '$reply_comment',
                                        'as': 'reply_comment',
                                        'in': {
                                            $cond: [{
                                                $eq: ["$$reply_comment.status", false]
                                            }, 1, 0]
                                        }
                                    }
                                }
                            }
                        }
                    },

                    {
                        $addFields: {

                            isLiked: {

                                $filter: {
                                    input: '$reply_likes',
                                    as: 'reply_likes',
                                    cond: {
                                        $and: [{
                                                $eq: ['$$reply_likes.referenceUserId', ObjectID("625ed933aeec0fb743959c67")]
                                            },
                                            {
                                                $eq: ['$$reply_likes.isLike', true]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },

                    {
                        $addFields: {

                            isLiked: {

                                $filter: {
                                    input: '$reply_comment',
                                    as: 'reply_comment',
                                    cond: {
                                        $and: [{
                                                $eq: ['$$reply_comment.referenceUserId', ObjectID("625ed933aeec0fb743959c67")]
                                            },
                                            {
                                                $eq: ['$$reply_comment.isLike', true]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },

                    {
                        $lookup: {
                            from: 'users',
                            localField: 'referenceUserId',
                            foreignField: '_id',
                            as: 'user_info'
                        },

                    },

                    {
                        $sort: {
                            "createdAt": -1
                        }
                    },

                ])
                .toArray(function (err, response) {
                    if (err)
                        throw err
                    res.json({
                        ack: "1",
                        status: 200,
                        message: "postsModel data get successfully",
                        view: response
                    })
                    db.close()
                })
        })
    } catch (err) {
        res.json({
            ack: "0",
            status: 500,
            message: "server error",
            error: err
        })
    }
})


router.post("/comments", async (req, res) => {
    try {
        const data = new commentModel({
            referenceUserId: req.body.referenceUserId,
            referencePostId: req.body.referencePostId,
            messageText: req.body.messageText,
        })
        const item = await data.save()
        if (item) {
            res.json({
                ack: 1,
                status: 200,
                message: "comment insert success"
            })
        } else {
            res.json({
                ack: 0,
                status: 400,
                message: "comment not insert"
            })
        }
    } catch (err) {
        return res.json({
            ack: "0",
            status: 500,
            message: "server error",
            error: err
        })
    }
})

router.post("/like", async (req, res) => {
    try {
        const referenceUserId = ObjectId(req.body.referenceUserId)
        const referencePostId = ObjectId(req.body.referencePostId)
        const item = await Like.findOne({
            referenceUserId: referenceUserId,
            referencePostId: referencePostId
        })
        if (item) {
            const item1 = await Like.updateOne({
                _id: ObjectId(item._id)
            }, {
                $set: {
                    isLike: !item.isLike
                }
            }, {
                upsert: true
            })

            if (item1) {
                res.json({
                    ack: 1,
                    status: 200,
                    message: "toggle success",
                    responseData: item
                })
            }

        } else {
            const data = new Like({
                referenceUserId: req.body.referenceUserId,
                referencePostId: req.body.referencePostId,
                isLike: true
            })
            data.save().then(response => {
                if (response) {
                    res.json({
                        ack: 1,
                        status: 200,
                        message: "Like success",
                        view: response
                    })
                } else {
                    res.json({
                        ack: 0,
                        status: 400,
                        message: "like not success"
                    })
                }
            })
        }

    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "server error",
            error: err
        })
    }
})

router.get("/likecount", async (req, res) => {
    try {
        const referenceUserId = ObjectId(req.body.referenceUserId)
        const referencePostId = ObjectId(req.body.referencePostId)

        const data = await Like.countDocuments({
            referenceUserId: referenceUserId,
            referencePostId: referencePostId
        })
        if (data) {
            res.json({
                ack: 1,
                status: 200,
                message: "like count",
                view: data
            })
        } else {
            res.json({
                ack: 0,
                status: 400,
                message: "not count"
            })
        }
    } catch (err) {
        res.json({
            ack: 0,
            message: "server error",
            status: 500
        })
    }
})

router.get("/likeview", async (req, res) => {
    try {
        const data = await Like.find().populate("referenceUserId")
        if (data) {
            res.json({
                ack: 1,
                status: 200,
                message: "like view",
                view: data
            })
        } else {
            res.json({
                ack: 1,
                status: 200,
                message: "like not view"
            })
        }
    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "server error"
        })
    }
})

router.get("/comments/:id", async (req, res) => {
    try {
        const paramId = ObjectId(req.params.id)

        const data = await commentModel.find({
                referencePostId: paramId
            })
            .limit(3)
            .sort('-createdAt')
            .populate("referenceUserId", {
                firstName: 1,
                lastName: 1,
                profilePhoto: 1
            })
        if (data) {
            res.json({
                ack: 1,
                status: 200,
                message: "like view",
                view: data
            })
        } else {
            res.json({
                ack: 1,
                status: 200,
                message: "like not view"
            })
        }
    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "server error"
        })
    }
})

// get reply comments 
router.get("/replycomments/:id", async (req, res) => {
    try {
        const paramId = ObjectId(req.params.id)

        const data = await replyCommentsModel.find({
                referenceCommentId: paramId
            })
            .limit(3)
            .sort('-createdAt')
            .populate("referenceUserId", {
                firstName: 1,
                lastName: 1,
                profilePhoto: 1
            })
        if (data) {
            res.json({
                ack: 1,
                status: 200,
                message: "like view",
                view: data
            })
        } else {
            res.json({
                ack: 1,
                status: 200,
                message: "like not view"
            })
        }
    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "server error"
        })
    }
})


router.post("/replycomments", async (req, res) => {
    try {


        const data = new replyCommentsModel({
            referencePostId: req.body.referencePostId,
            referenceUserId: req.body.referenceUserId,
            referenceCommentId: req.body.referenceCommentId,
            messageText: req.body.messageText
        });
        const item = await data.save();
        if (item) {
            const itx = await commentModel.findByIdAndUpdate({
                _id: ObjectId(req.body.referenceCommentId)
            }, {
                $inc: {
                    replyCommentCount: 1
                }
            })
            res.json({
                ack: 1,
                status: 200,
                message: "replycomment insert success"
            });
        } else {
            res.json({
                ack: 0,
                status: 400,
                message: "replycomment not insert"
            });
        }

    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "server error",
            error: err
        });
    }
})


router.post("/replylike", async (req, res) => {
    try {
        const referenceUserId = ObjectId(req.body.referenceUserId)
        const referencePostId = ObjectId(req.body.referencePostId)
        const referenceCommentId = ObjectId(req.body.referenceCommentId)
        const item = await replyLikeModel.findOne({
            referenceUserId: referenceUserId,
            referencePostId: referencePostId,
            referenceCommentId: referenceCommentId,
        })
        if (item) {
            const item1 = await replyLikeModel.updateOne({
                _id: ObjectId(item._id)
            }, {
                $set: {
                    isLike: !item.isLike
                }
            }, {
                upsert: true
            })

            if (item.isLike) {
                const itx = await commentModel.findByIdAndUpdate({
                    _id: ObjectId(req.body.referenceCommentId)
                }, {
                    $inc: {
                        replyLikeCount: -1
                    }
                })
            } else {
                const itx = await commentModel.findByIdAndUpdate({
                    _id: ObjectId(req.body.referenceCommentId)
                }, {
                    $inc: {
                        replyLikeCount: 1
                    }
                })
            }



            if (item1) {
                res.json({
                    ack: 1,
                    status: 200,
                    message: "toggle success",
                    responseData: item
                })
            }

        } else {
            const data = new replyLikeModel({
                referenceUserId: req.body.referenceUserId,
                referencePostId: req.body.referencePostId,
                referenceCommentId: req.body.referenceCommentId,
                isLike: true
            })
            const insertLike = await data.save()

            const itx = await commentModel.findByIdAndUpdate({
                _id: ObjectId(req.body.referenceCommentId)
            }, {
                $inc: {
                    replyLikeCount: 1
                }
            })
            insertLike ?
                res.json({
                    ack: 1,
                    status: 200,
                    message: "Like success",
                    view: insertLike
                })

                :
                res.json({
                    ack: 0,
                    status: 400,
                    message: "like not success"
                })

        }

    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "server error",
            error: err
        })
    }
})

module.exports = router