const express=require("express");
const User=require("../Model/users")
const Addfriend=require("../Model/addfriend");
const router = express.Router()
const MongoClient = require('mongodb').MongoClient
const url =  'mongodb://127.0.0.1:27017/Allphanesdatabase'
const mongoose=require("mongoose");
router.get("/",async(req,res)=>{
    try{
        const data=await User.find().then(item=>{
            if(item)return res.json({ack:"1", status:200, message:"user get",view:item});
            return res.json({ack:0, status:400, message:"not view"});
        })
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})



router.post("/addfriend",async(req,res)=>{
    try{
          const data=new Addfriend({
            referenceUserId:req.body.referenceUserId,
            acceptorId:req.body.acceptorId
          })
          await data.save().then(item=>{
              if(item)return res.json({ack:1, status:200, message:"Addfriend success"});
              return res.json({ack:"0", status:400, message:"not insert"});
          })
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})

router.post("/friendrequests",async(req,res)=>{
    try{
        MongoClient.connect(url, function (err, db) {
                if (err)
                    throw err
                let dbo = db.db("Allphanesdatabase")
                // console.log(dbo)
                mongoose.model('users').aggregate([
                    // { "$match": { "referenceUserId": "62474ec277e3f337473aed46" } },
                    {
                        $lookup: {
                            from: "userfriendsmaps",
                            localField: "_id",
                            foreignField: "referenceUserId",
                            as: "user_info"
                        }
                    },
                    { $unwind: "$user_info" },
                    // { "$match": { "acceptorId": "62474ec277e3f337473aed46" } },
                    // define some conditions here 
                   
                    // {
                    //     $lookup: {
                    //         from: "userInfo",
                    //         localField: "userId",
                    //         foreignField: "userId",
                    //         as: "userInfo"
                    //     }
                    // },
                    // { $lookup:
                    //   {
                    //     from: 'users',
                    //     localField: 'referenceUserId',
                    //     foreignField: '_id',
                    //     as: 'details'
                    //   }
                    // }
                    // {
                    //     $project: {
                    //         "posts._id": 1,
                    //         "postTitle": 1,
                    //         "postDescription" : 1,
                    //         "createdAt" : 1,
                    //         "user_info.firstName": 1,
                    //         "user_info.lastName": 1,
                    //         // "userInfo._id":0
                    //     }
                    // }
                    
                ]).exec(function (err, response) {
                    if (err)
                        throw err
                    // console.log(res[0])
                    // console.log(response[0]._id);
                    const data=response;
                    // console.log(data);
                    res.json({ack:"1", status:200, message:"postsModel data get successfully",view:response})
                    // db.close()
                })
            })
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err})
    }
})

router.get("/demo",async(req,res)=>{
    try{
        
        mongoose.model('users').aggregate([
            { "$match": { "name": "foo" } },
            { "$unwind": "$projects" },
            { "$unwind": "$projects.tags" },
            {
                $lookup: {
                    from: "userfriendsmaps",
                    localField: "_id",
                    foreignField: "referenceUserId",
                    as: "user_info"
                }
            },
            { $unwind: "$user_info" },
            { "$unwind": "$resultingTagsArray" },
            {
                "$group": {
                    "_id": null,
                    "allTags": { "$addToSet": "$resultingTagsArray" },
                    "count": { "$sum": 1 }
                }
            }
         ]).exec(function(err, results){
            console.log(results);
         })

    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err})
    }
})


router.post("/requestaccept",async(req,res)=>{
    try{
        const data=await Addfriend.updateOne({ _id: req.body.id }, { $set: { isAccepted: true } }).then(response=>{
            if(response)return res.json({ack:1, status:200, message:"accepted",view:response.isAccepted});
            return res.json({ack:0, status:400, message:"not accepted"});
        })
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})

module.exports = router