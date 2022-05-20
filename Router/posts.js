const express = require('express')
const globalfunction = require('../global')
const postsModel = require("../Model/posts")
const galleryModel = require("../Model/gallery")
const usersModel = require("../Model/users")
const {
    ObjectID
} = require('bson')
const router = express.Router()

const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myFirstDatabase'

const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name: "dsg7oitoj",
    api_key: "271391984486366",
    api_secret: "Ry6sFnb8FCX43-RxriPPyu4oOMI",
    secure: true
})

router.post("/creategallery", async (req, res) => {
    try {
        const fileStr = req.files.image
        const uploadResponse = await cloudinary.uploader.upload(fileStr.tempFilePath)
        if (uploadResponse.secure_url) {
            const item = new postsModel({
                referenceUserId: req.body.referenceUserId,
                postTitle: req.body.title,
                postDescription: req.body.text
            })
            const insert = await item.save()
            if (insert) {
                const dataGallery = new galleryModel({
                    referenceUserId: req.body.referenceUserId,
                    referencePostId: insert._id,
                    postImagePath: uploadResponse.secure_url,
                })
                const insertG = await dataGallery.save()
                if (insertG)
                    res.status(200).json({
                        responseData: 'success'
                    })
            } else {
                res.status(400).json({
                    err: 'Something went wrong'
                })
            }
        }

    } catch (err) {
        res.status(500).json({
            err: 'Something went wrong'
        })
    }

})

router.get("/gellary/:id", async (req, res) => {
    try {
        const id = ObjectID(req.params.id)
        const gellary = await galleryModel.find({
            referenceUserId: id
        })
        if (gellary) {
            res.json({
                ack: 1,
                status: 200,
                message: "post image get",
                responseData: gellary
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

// create post************************************************************************************ */
router.post("/create", async (req, res) => {
    try {
        const item = new postsModel({
            referenceUserId: req.body.referenceUserId,
            postTitle: req.body.title,
            postDescription: req.body.text
        })

        if (req.body.isFile) {
            const fileStr = req.files.image
            const uploadResponse = await cloudinary.uploader.upload(fileStr.tempFilePath)

            if (!uploadResponse) return res.status(400).json({
                err: 'Something went wrong'
            })

            const insert = await item.save()

            if (!insert) return res.status(400).json({
                err: 'Something went wrong'
            })

            const dataGallery = new galleryModel({
                referenceUserId: req.body.referenceUserId,
                referencePostId: insert._id,
                postImagePath: uploadResponse.secure_url,
            })
            const insertG = await dataGallery.save()
            insert && insertG ?
                res.status(200).json({
                    responseData: 'success'
                }) :
                res.status(400).json({
                    err: 'Something went wrong'
                })
        } else {

            const insert = await item.save()
            insert ?
                res.status(200).json({
                    responseData: 'success'
                }) :
                res.status(400).json({
                    err: 'Something went wrong'
                })
        }

    } catch (err) {
        res.status(500).json({
            err: 'Something went wrong'
        })
    }

})

// /get all post  ************************************** /

router.get("/dd/:id", async (req, res) => {
    try {
        const ParamId = ObjectID(req.params.id)
        MongoClient.connect(url, function (err, db) {
            if (err)
                throw err
            let dbo = db.db("myFirstDatabase")

            dbo.collection('posts').aggregate([

                    // {
                    //     $match:{referenceUserId:ParamId}
                    // },
                    {
                        $lookup: {
                            from: 'likes',
                            localField: '_id',
                            foreignField: 'referencePostId',
                            as: 'user_likes'
                        },
                    }, {
                        $project: {
                            referenceUserId: 1,
                            postTitle: 1,
                            postDescription: 1,
                            postImage: 1,
                            isActive: 1,
                            isTrash: 1,
                            countViews: 1,
                            user_likes: 1,
                            totalLikes: {
                                $sum: {
                                    $map: {
                                        "input": '$user_likes',
                                        'as': 'user_likes1',
                                        'in': {
                                            $cond: [{
                                                $eq: ["$$user_likes1.isLike", true]
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
                                    input: '$user_likes',
                                    as: 'user_likes',
                                    cond: {
                                        $and: [{
                                                $eq: ['$$user_likes.referenceUserId', ParamId]
                                            },
                                            {
                                                $eq: ['$$user_likes.isLike', true]
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
                        $lookup: {
                            from: "galleries",
                            localField: "_id",
                            foreignField: "referencePostId",
                            as: "postInfo"
                        }
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
                        responseData: response
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

router.get("/myspace/:id", async (req, res) => {
    try {
        MongoClient.connect(url, function (err, db) {
            if (err)
                throw err
            let dbo = db.db("myFirstDatabase")
            let ParamId = ObjectID(req.params.id)
            dbo.collection('posts').aggregate([{
                        $match: {
                            referenceUserId: ParamId
                        }
                    },
                    {
                        $lookup: {
                            from: 'likes',
                            localField: '_id',
                            foreignField: 'referencePostId',
                            as: 'user_likes'
                        },
                    },
                    {
                        $lookup: {
                            from: 'comments',
                            localField: '_id',
                            foreignField: 'referencePostId',
                            as: 'user_comment'
                        },

                    }, {
                        $project: {
                            referenceUserId: 1,
                            postDescription: 1,
                            IsActive: 1,
                            isTrash: 1,
                            createdAt: 1,
                            countViews: 1,
                            user_comment: 1,
                            user_likes: 1,
                            totalComment: {
                                $sum: {
                                    $map: {
                                        "input": '$user_comment',
                                        'as': 'user_comment',
                                        'in': {
                                            $cond: [{
                                                $eq: ["$$user_comment.IsActive", true]
                                            }, 1, 0]
                                        }
                                    }
                                }
                            },
                            totalLikes: {
                                $sum: {
                                    $map: {
                                        "input": '$user_likes',
                                        'as': 'user_likes1',
                                        'in': {
                                            $cond: [{
                                                $eq: ["$$user_likes1.isLike", true]
                                            }, 1, 0]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {

                            IsCommented: {

                                $filter: {
                                    input: '$user_comment',
                                    as: 'user_comment',
                                    cond: {
                                        $and: [{
                                                $eq: ['$$user_comment.referenceUserId', ParamId]
                                            },
                                            {
                                                $eq: ['$$user_comment.IsActive', true]
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
                                    input: '$user_likes',
                                    as: 'user_likes',
                                    cond: {
                                        $and: [{
                                                $eq: ['$$user_likes.referenceUserId', ParamId]
                                            },
                                            {
                                                $eq: ['$$user_likes.isLike', true]
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
                        $lookup: {
                            from: "galleries",
                            localField: "_id",
                            foreignField: "referencePostId",
                            as: "postInfo"
                        }
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
                        responseData: response
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

router.get("/userspace/:id/:paramid", async (req, res) => {
    try {
        MongoClient.connect(url, function (err, db) {
            if (err)
                throw err
            let dbo = db.db("myFirstDatabase")

            let ParamId = ObjectID(req.params.paramid)
            let refUserId = ObjectID(req.params.id)

            dbo.collection('posts').aggregate([{
                        $match: {
                            referenceUserId: ParamId
                        }
                    },
                    {
                        $lookup: {
                            from: 'likes',
                            localField: '_id',
                            foreignField: 'referencePostId',
                            as: 'user_likes'
                        },
                    },
                    {
                        $lookup: {
                            from: 'comments',
                            localField: '_id',
                            foreignField: 'referencePostId',
                            as: 'user_comment'
                        },

                    }, {
                        $project: {
                            referenceUserId: 1,
                            postDescription: 1,
                            IsActive: 1,
                            isTrash: 1,
                            createdAt: 1,
                            countViews: 1,
                            user_comment: 1,
                            user_likes: 1,
                            totalComment: {
                                $sum: {
                                    $map: {
                                        "input": '$user_comment',
                                        'as': 'user_comment',
                                        'in': {
                                            $cond: [{
                                                $eq: ["$$user_comment.IsActive", true]
                                            }, 1, 0]
                                        }
                                    }
                                }
                            },
                            totalLikes: {
                                $sum: {
                                    $map: {
                                        "input": '$user_likes',
                                        'as': 'user_likes1',
                                        'in': {
                                            $cond: [{
                                                $eq: ["$$user_likes1.isLike", true]
                                            }, 1, 0]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {

                            IsCommented: {

                                $filter: {
                                    input: '$user_comment',
                                    as: 'user_comment',
                                    cond: {
                                        $and: [{
                                                $eq: ['$$user_comment.referenceUserId', refUserId]
                                            },
                                            {
                                                $eq: ['$$user_comment.IsActive', true]
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
                                    input: '$user_likes',
                                    as: 'user_likes',
                                    cond: {
                                        $and: [{
                                                $eq: ['$$user_likes.referenceUserId', refUserId]
                                            },
                                            {
                                                $eq: ['$$user_likes.isLike', true]
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
                        $lookup: {
                            from: "galleries",
                            localField: "_id",
                            foreignField: "referencePostId",
                            as: "postInfo"
                        }
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
                        responseData: response
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

router.get("/:id", async (req, res) => {
    try {
        MongoClient.connect(url, function (err, db) {
            if (err)
                throw err
            let dbo = db.db("myFirstDatabase")
            let ParamId = ObjectID(req.params.id)
            dbo.collection('posts').aggregate([{
                        $lookup: {
                            from: 'likes',
                            localField: '_id',
                            foreignField: 'referencePostId',
                            as: 'user_likes'
                        },
                    },
                    {
                        $lookup: {
                            from: 'comments',
                            localField: '_id',
                            foreignField: 'referencePostId',
                            as: 'user_comment'
                        },

                    }, {
                        $project: {
                            referenceUserId: 1,
                            postDescription: 1,
                            IsActive: 1,
                            isTrash: 1,
                            createdAt: 1,
                            countViews: 1,
                            user_comment: 1,
                            user_likes: 1,
                            totalComment: {
                                $sum: {
                                    $map: {
                                        "input": '$user_comment',
                                        'as': 'user_comment',
                                        'in': {
                                            $cond: [{
                                                $eq: ["$$user_comment.IsActive", true]
                                            }, 1, 0]
                                        }
                                    }
                                }
                            },
                            totalLikes: {
                                $sum: {
                                    $map: {
                                        "input": '$user_likes',
                                        'as': 'user_likes1',
                                        'in': {
                                            $cond: [{
                                                $eq: ["$$user_likes1.isLike", true]
                                            }, 1, 0]
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $addFields: {

                            IsCommented: {

                                $filter: {
                                    input: '$user_comment',
                                    as: 'user_comment',
                                    cond: {
                                        $and: [{
                                                $eq: ['$$user_comment.referenceUserId', ParamId]
                                            },
                                            {
                                                $eq: ['$$user_comment.IsActive', true]
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
                                    input: '$user_likes',
                                    as: 'user_likes',
                                    cond: {
                                        $and: [{
                                                $eq: ['$$user_likes.referenceUserId', ParamId]
                                            },
                                            {
                                                $eq: ['$$user_likes.isLike', true]
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
                        $lookup: {
                            from: "galleries",
                            localField: "_id",
                            foreignField: "referencePostId",
                            as: "postInfo"
                        }
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
                        responseData: response
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

module.exports = router