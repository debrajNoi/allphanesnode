const express=require("express");
const User=require("../Model/users")
const Addfriend=require("../Model/userFriendsMap");
const router = express.Router()
const MongoClient = require('mongodb').MongoClient
const url =  'mongodb://127.0.0.1:27017/Allphanesdatabase'
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

router.get("/friendrequests",async(req,res)=>{
    try{
        await Addfriend.find({"acceptorId" : "62441d7985b630275b219b0e"})
        .then((response) =>{
            return res.json({ack:"0", status:400, message:"success", data: response});
        })
        MongoClient.connect(url, function (err, db) {
            if (err)
                throw err
            let dbo = db.db("Allphanesdatabase")
            dbo.collection('userfriendsmaps').aggregate([
            {
                $match:{"acceptorId" : "62441d7985b630275b219b0e"}
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
                // console.log(res[0])
                console.log(response);
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
        const data=await Addfriend.updateOne({ _id: req.body.id }, { $set: { isAccepted: true } }).then(response=>{
            if(response)return res.json({ack:1, status:200, message:"accepted",view:response.isAccepted});
            return res.json({ack:0, status:400, message:"not accepted"});
        })
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})

module.exports = router