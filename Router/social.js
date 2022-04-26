const express=require("express")
const { ObjectId } = require("mongodb")
const router = express.Router()
const Like=require("../Model/Likes")

router.post("/like",async(req,res)=>{
    console.log("like")
    try{
        const referenceUserId=ObjectId(req.body.referenceUserId)
        const referencePostId=ObjectId(req.body.referencePostId)
        const item=await Like.findOne({referenceUserId:referenceUserId,referencePostId:referencePostId })
        console.log("item",item)
        if(item){
                console.log("entered here")
                const item1 = await Like.updateOne({_id: ObjectId(item._id)},{$set:{isLike:!item.isLike}},{upsert: true})
               
                if(item1){
                    res.json({ack:1, status:200, message:"unlike success",view:item})
                }
               
            }else{
            const data=new Like({
                    referenceUserId:req.body.referenceUserId,
                    referencePostId:req.body.referencePostId,
                    isLike:true
                  });
                   data.save().then(response=>{
                      if(response){
                          res.json({ack:1, status:200, message:"Like success",view:response});
                      }else{
                          res.json({ack:0, status:400, message:"like not success"});
                      }
                  })
        }
       
    }catch(err){
        console.log(err)
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})

router.get("/likecount",async(req,res)=>{
    try{
      const data=await Like.countDocuments().then(response=>{
          if(response){
              res.json({ack:1, status:200, message:"like count",view:response});
          }else{
              res.json({ack:0, status:400, message:"not count"})
          }
      })
    }catch(err){
        res.json({ack:0, message:"server error", status:500})
    }
})

router.get("/likeview",async(req,res)=>{
    try{
       const data=await Like.find().populate("referenceUserId").then(response=>{
           if(response){
               res.json({ack:1, status:200, message:"like view",view:response})
           }else{
            res.json({ack:1, status:200, message:"like not view"})
           }
       })
    }catch(err){
        res.json({ack:0, status:500, message:"server error"})
    }
})
module.exports = router