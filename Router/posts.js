const express=require('express')
const globalfunction = require('../global')
const postsModel=require("../Model/posts")
const galleryModel=require("../Model/gallery")
const usersModel=require("../Model/users")
const notification=require("../Model/notification")
const router = express.Router()
const auth=require("../middleware/authcheck");
const cloudinary = require("cloudinary").v2;
const Comment=require("../Model/comment");
const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Allphanesdatabase' 


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET,
    secure: true
});

  
// create post************************************************************************************ */
router.post('/create',async(req,res)=>{
    try{
        const data = new postsModel(req.body)
        
        const item= await data.save().then(item=>{
           if(!item) return res.json({ack:0, status:400, message:"postsModel inssert not successfully"})
           return res.json({ack:1, status:200, message:"postsModel insert successFully",id:item._id})
       })   
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err})
    }
})

// /get all post  ************************************** /
router.get("/",async(req,res)=>{
    try{
        MongoClient.connect(url, function (err, db) {
                if (err)
                    throw err
                let dbo = db.db("Allphanesdatabase")
                dbo.collection('posts').aggregate([
                    {
                        $lookup: {
                            from: "users",
                            localField: "referenceUserId",
                            foreignField: "_id",
                            as: "user_info"
                        }
                    },  
                    {
                        $lookup: {
                            from: "galleries",
                            localField: "_id",
                            foreignField: "refPostId",
                            as: "gellary"
                        }
                    },
                    {
                        $match:{
                            $and:[{"isActive" : true}]
                        }
                    },
                    {$sort: {"createdAt": -1}},
                   
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
                    
                ]).toArray(function (err, response) {
                    if (err)
                        throw err
                        console.log(response);
                    // console.log(res[0])
                    res.json({ack:"1", status:200, message:"postsModel data get successfully",view:response})
                    db.close()
                })
            })
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err})
    }
})
// ************************************************************************************ */
router.post("/creategallery",async(req,res)=>{
    try{
        // const randvale = (Date.now())
        // let imagepath = ""
        // if (req.files != null) {
        //     if (req.files.postImagePath != null) {
        //        await req.files.postImagePath.mv("./gellary/image/" + randvale + '.jpg', function (err) {
        //             if (err) {
        //                 res.json({ "ack": 0, status: 401, message: "photo upload fail" })
        //             }
        //         })
        //         imagepath = "gellary/image" + randvale + '.jpg'
        //     }
        // }
        const file=req.files.postImagePath;
        // console.log(file);
        
        const allphanuserdata=await postsModel.find().sort({_id:-1}).limit(1)
        
         const refid=[]
        
        allphanuserdata.forEach(item=>{
           
            const val=item.id
           
            refid.push(val)
        })
        const refId=refid[0]
       
        await cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
        console.log(result);
        const item=new galleryModel({
            // refPostId:refId,
            refPostId:req.body.refPostId,
            postImagePath:result.url,
            isactive:true,
            isTrash:1,
            status:true
        })
         item.save().then(item=>{
            //  console.log(item);
            if(!item) return res.json({ack:"0", status:500, message:"Allphanusergellary not insert image"})
            return res.json({ack:"1", status:200, message:"Allphanusergellary image upload",view:item});
        })
    })
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err})
    }
})

router.post("/createnotifications",auth,async(req,res)=>{
    try{
        const allphanuserdata=await postsModel.find().sort({_id:-1}).limit(1)
        
        const refid=[]
       
       allphanuserdata.forEach(item=>{
          
           const val=item.id
          
           refid.push(val)
       })
       const refId=refid[0]
       console.log(refId);

      const notificationcheck=new notification({
        refrenceUId:1,
        postId:refId,
        notiMsg:req.body.notiMsg
      })
      await notificationcheck.save().then(response=>{
          if(response)return res.json({ack:1, status:200, message:"Notification successFully"});
          return res.json({ack:0, status:400, message:"notification Fails"})
      })
    }catch(err){
        res.json({ack:0, status:500, message:"Server error",error:err});
    }
});

router.post("/notification",async(req,res)=>{
    try{
         const notifind=await notification.find().then(response=>{
             if(response)return res.json({ack:0, status:200, message:"notification success",view:response});
             return res.json({ack:0, status:400, message:"not success"});
         })
    }catch(err){
        return res.json({ack:0, status:500, message:"server error",error:err});
    }
})


// router.get("/statusdelete/:id",async(req,res)=>{
//     try{
//     const statuscheck=await Allphanuserpost.findByIdAndDelete(req.params.id).then(item=>{
//         if(!item)return res.json({ack:0, status:400, message:"Allphanesuser post not Delete"});
//         return res.json({ack:1, status:200, message:"Allphanesuser post delete"});
//     })

//     }catch(err){
//         res.json({ack:0, status:500, message:"server error",error:err});
//     }
// })

// router.post("/likes",async(req,res)=>{
//     try{
//       const likesvalue=new Like({
//         RefuserId:1,
//         Lik:1
//       })
//       await likesvalue.save().then(item=>{
//           if(!item)return res.json({ack:0, status:400, message:"Like value not insert"});
//           return res.json({ack:1, status:200, message:"Like value insert success",id:likesvalue._id});
//       })
//     }catch(err){
//         res.json({ack:0, status:500, message:"server error", error:err});
//     }
// });

// router.get("/likescount",async(req,res)=>{
//     try{
//       const count=await Like.countDocuments({Lik:"1"}).then(item=>{
//           if(!item)return res.json({ack:0, status:400, message:"nulll"});
//           return res.json({ack:1, status:200, message:"count success",count:item});
//       })
      
//     }catch(err){
//         res.json({ack:0, status:500, message:"server error",error:err});
//     }
// })

// router.post("/dislike/:id",async(req,res)=>{
//     try{
//       const dislikecheck=await Like.findByIdAndUpdate(req.params.id,{
//         Lik:0
//       });
//       await dislikecheck.save().then(item=>{
//           if(item)return res.json({ack:1, status:200, message:"Dislike successFully"});
//           return res.json({ack:1, status:400, message:"dislike id not insert"});
//       })
//     }catch(err){
//         res.json({ack:0, status:500, message:"server error",error:err});
//     }
// });

// router.get("/dislikecount",async(req,res)=>{
//     try{
//     const discount=await Like.countDocuments({Lik:"0"}).then(item=>{
//         if(!item)return res.json({ack:0, status:400, message:"null"});
//         return res.json({ack:1, status:200, message:"countss",coun:item});
        
//     })
//     console.log(discount);
//     }catch(err){
//         res.json({ack:0, status:500, message:"server error",error:err});
//     }
// })

// router.post("/comment",async(req,res)=>{
//     try{
//         const cmd=new Comment({
//             RefuserId:1,
//             comment:req.body.comment
//         });
//         await cmd.save().then(item=>{
//             if(!item)return res.json({ack:0, status:400, message:"comment not insert"});
//             return res.json({ack:1, status:200, message:"comment insert success"});
//         })
//     }catch(err){
//         return res.json({ack:0, status:500, message:"server error",error:err});
//     }
// })

router.get("/commentdelete/:id",async(req,res)=>{
    try{
    const cmddelete=await Comment.findByIdAndDelete(req.params.id).then(err=>{
        if(err)return res.json({ack:0, status:400, message:"Delete not success"})
        return res.json({ack:1, status:200, message:"Deleted success"});
    })
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
})

// router.get("/commentget",async(req,res)=>{
//     try{
//      const item=await Comment.find().then(item=>{
//          if(!item)return res.json({ack:0, status:400, message:"nulll"});
//          return res.json({ack:1, status:200, message:"comment get",view:item});
//      })
//     }catch(err){
//         res.json({ack:0, status:500, message:"server error",error:err});
//     }
// })

// router.get("/commcount",async(req,res)=>{
//     try{
//         const comcount=await Comment.countDocuments().then(item=>{
//             if(!item)return res.json({ack:0, status:400, message:"null count"});
//             return res.json({ack:1, status:200, message:"view count",count:item});
//         })
//     }catch(err){
//         res.json({ack:0, status:500, message:"server error",error:err});
//     }
// })

module.exports = router