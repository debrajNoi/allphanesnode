const express=require("express");
const User=require("../Model/users")
const Addfriend=require("../Model/userFriendsMap");
const { ObjectId } = require("mongodb");
const router = express.Router()
const MongoClient = require('mongodb').MongoClient
const url =  'mongodb://127.0.0.1:27017/myFirstDatabase'

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

router.get("/acceptrequest/:id",async(req,res)=>{
    try{
        MongoClient.connect(url, function (err, db) {
            if (err)
                throw err
            let dbo = db.db("myFirstDatabase")
            const id=ObjectId(req.params.id)
            dbo.collection('userfriendsmaps').aggregate([
            {
                $match:{"acceptorId" :id, "isAccepted" : false}
            },
            {
                $lookup: {
                    from: "users",
                    localField: "referenceUserId",
                    foreignField: "_id",
                    as: "user_info"
                }
            },
            { 
                $unwind: "$user_info" 
            },
            ]).toArray(function (err, response) {
                if (err)
                    throw err
                res.json({ack:"1", status:200, message:"postsModel data get successfully",view:response})
                db.close()
            })
        })
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err})
    }
})

router.get("/requests/:id",async(req,res)=>{
    try{
        MongoClient.connect(url, function (err, db) {
            if (err)
                throw err
            let dbo = db.db("myFirstDatabase")
            const id=ObjectId(req.params.id)
            dbo.collection('userfriendsmaps').aggregate([
            {
                $match:{"referenceUserId" :id, "isAccepted" : false}
            },
            {
                $lookup: {
                    from: "users",
                    localField: "acceptorId",
                    foreignField: "_id",
                    as: "user_info"
                }
            },
            { 
                $unwind: "$user_info" 
            },
            ]).toArray(function (err, response) {
                if (err)
                    throw err
                res.json({ack:"1", status:200, message:"postsModel data get successfully",view:response})
                db.close()
            })
        })
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err})
    }
})

router.get("/friendslist/:id",async(req,res)=>{
    try{
        MongoClient.connect(url, function (err, db) {
            if (err)
                throw err
            let dbo = db.db("myFirstDatabase")
            const id=ObjectId(req.params.id)
            dbo.collection('userfriendsmaps').aggregate([
            {
                $match:{"referenceUserId" :id, "isAccepted" : true}
            },
            {
                $lookup: {
                    from: "users",
                    localField: "acceptorId",
                    foreignField: "_id",
                    as: "user_info"
                }
            },
            { 
                $unwind: "$user_info" 
            },
            ]).toArray(function (err, response) {
                if (err)
                    throw err
                res.json({ack:"1", status:200, message:"postsModel data get successfully",view:response})
                db.close()
            })
        })
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err})
    }
})
router.get("/friendslista/:id",async(req,res)=>{
    try{
        MongoClient.connect(url, function (err, db) {
            if (err)
                throw err
            let dbo = db.db("myFirstDatabase")
            const id=ObjectId(req.params.id)
            dbo.collection('userfriendsmaps').aggregate([
            {
                $match:{"acceptorId" :id, "isAccepted" : true}
            },
            {
                $lookup: {
                    from: "users",
                    localField: "referenceUserId",
                    foreignField: "_id",
                    as: "user_info"
                }
            },
            { 
                $unwind: "$user_info" 
            },
            ]).toArray(function (err, response) {
                if (err)
                    throw err
                res.json({ack:"1", status:200, message:"postsModel data get successfully",view:response})
                db.close()
            })
        })
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err})
    }
})

router.post("/requestaccept",async(req,res)=>{
    try{
        const data=await Addfriend.updateOne({ _id: req.body.id }, { $set: { isAccepted: true } })
        data ?  
            res.json({ack:1, status:200, message:"accepted",view:data})
            : res.json({ack:0, status:400, message:"not accepted"});
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})

router.delete("/requests/:id", async (req, res) => {
    const data = await Addfriend.deleteOne({_id: req.params.id})
    data ? 
        res.json({ack:1, status:200, message:"succesfull"})
        : res.json({ack:0, status:400, message:"rejected"})
})

module.exports = router