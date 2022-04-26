const express=require("express");
const User=require("../Model/users")
const Addfriend=require("../Model/userFriendsMap");
const postsModel=require("../Model/posts");
const { ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
const router = express.Router()

const MongoClient = require('mongodb').MongoClient
const url =  'mongodb://127.0.0.1:27017/myFirstDatabase'
// const url = 'mongodb+srv://allphanes:7031445611@allphanescluster.x5i5t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'



router.post("/comments",async(req,res)=>{
    try{
      const data=new comment({
        referenceUserId:req.body.referenceUserId,
        referencePostId:req.body.referencePostId,
        messageText:req.body.messageText, 
      });
     const item= await data.save();
     if(item){
         res.json({ack:1, status:200, message:"comment insert success"});
     }else{
         res.json({ack:0, status:400, message:"comment not insert"});
     }
    }catch(err){
        return res.json({ack:"0",status:500, message:"server error",error:err});
    }
})

router.get("/viewcomment",async(req,res)=>{
    try{
        
        const data=await comment.find().populate("referenceUserId"). then((response)=>{
            if(response){
                return res.json({ack:1, status:200, message:"comment view",view:response});
            }else{
                return res.json({ack:0, status:400, message:"not view"});
            }
        })
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})


router.get("/commentcount",async(req,res)=>{
    try{
        const id=ObjectId("62610436f705587d5070b176");
        const data=await comment.countDocuments({referencePostId:id});
         if(data){
             res.json({ack:1, status:200, message:"comment count",view:data});
         }else{
             res.json({ack:0, status:400, message:"could not count comment data"});
         }
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})

router.post("/replaycomments",async(req,res)=>{
    try{
     const data=new replaycomment({
        commentId:req.body.commentId,
        referenceUserId:req.body.referenceUserId,
        messageText:req.body.messageText
     });
     await data.save().then((response)=>{
         if(response){
             res.json({ack:1, status:200, message:"replaycomment insert success"});
         }else{
             res.json({ack:0, status:400, message:"replaycomment not insert"});
         }
     })
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})

router.get("/countreplycmd",async(req,res)=>{
    try{
        const id=ObjectId("62667240d7a2667583ad9a9e")
      const data=await replaycomment.countDocuments({commentId:id}).then(response=>{
          if(response){
              res.json({ack:1, status:200, message:"count replaycomment",view:response});
          }
      })
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})

router.get("/replaycmdview",async(req,res)=>{
    try{
     const item=await replaycomment.find().populate("commentId").populate("referenceUserId").then(response=>{
         if(response){
             res.json({ack:1, status:200, message:"replay comment view",view:response});
         }else{
             res.json({ack:0, status:400, message:"replay comment not view"});
         }
     })
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})

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
        const checkFriendExist1 = await Addfriend.find({
            referenceUserId: ObjectID(req.body.referenceUserId),
            acceptorId: ObjectID(req.body.acceptorId)
        })

        console.log(checkFriendExist1.length)
        if(checkFriendExist1.length > 0) return res.json({ack:"0", status:400, message:"Alredy sent request"})

        const checkFriendExist2 = await Addfriend.find({
            referenceUserId: ObjectID(req.body.acceptorId),
            acceptorId: ObjectID(req.body.referenceUserId)
        })

        if(checkFriendExist2.length > 0) return res.json({ack:"0", status:400, message:"Already have request"}) 

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
        const id = ObjectID(req.params.id)
        const data = await Addfriend.find({"acceptorId" :id, "isAccepted" : false}).populate("acceptorId")
        res.json({ack:"1", status:200, message:"postsModel data get successfully",responseData:data})
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err})
    }
})

router.get("/requests/:id",async(req,res)=>{
    try{
        const id = ObjectID(req.params.id)
        const data = await Addfriend.find({"referenceUserId" :id, "isAccepted" : false}).populate("acceptorId")
        res.json({ack:"1", status:200, message:"postsModel data get successfully",responseData:data})
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err})
    }
})

router.get("/friendslists/:id",async(req,res)=>{
    try{
        const id=ObjectID(req.params.id)
        const friendList1 = await Addfriend.find({"acceptorId" :id, "isAccepted" : true}).populate("referenceUserId")
        const friendList2 = await Addfriend.find({"referenceUserId" :id, "isAccepted" : true}).populate("acceptorId")
        res.json({ack:"1", status:200, message:"postsModel data get successfully",responseData1:friendList1,responseData2:friendList2})
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

router.get("/gellary/:id",async(req,res)=>{
    try{
       const gellary=await postsModel.find({referenceUserId:id});
       if(gellary){
           res.json({ack:1, status:200, message:"post image get",view:gellary});
       }
    }catch(err){
        res.json({ack:0, status:500, message:"server error"});
    }
})

router.get("/userprofile/:id",async(req,res)=>{
    try{
        MongoClient.connect(url, function (err, db) {
            if (err)
                throw err
            let dbo = db.db("myFirstDatabase")
            const id=ObjectId(req.params.id)
            dbo.collection('posts').aggregate([
            {
                $match:{"referenceUserId" :id}
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
        res.json({ack:0, status:500, message:"server error"});
    }
})



router.delete("/requests/:id", async (req, res) => {
    const data = await Addfriend.deleteOne({_id: req.params.id})
    data ? 
        res.json({ack:1, status:200, message:"succesfull"})
        : res.json({ack:0, status:400, message:"rejected"})
})

// router.patch("friends/:id", async(req, res) =>{
//     console.log(req.params)
//     console.log(req.body)
//     const id = ObjectID(req.params.id)
//     const data = req.body
//     const update = await Addfriend.findOneAndUpdate({_id: id},{$set: data})
//     update ? 
//         res.json({ack:1, status:200, message:"succesfull"})
//         : res.json({ack:0, status:400, message:"rejected"})
// })




module.exports = router