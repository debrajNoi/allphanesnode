const express=require('express')
const globalfunction = require('../global')
const postsModel=require("../Model/posts")
const galleryModel=require("../Model/gallery")
const usersModel=require("../Model/users")
const { ObjectID } = require('bson')
const router = express.Router()

const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myFirstDatabase' 
// const url = 'mongodb+srv://allphanes:7031445611@allphanescluster.x5i5t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'


const cloudinary=require("cloudinary").v2 

cloudinary.config({ 
    cloud_name: "dsg7oitoj", 
    api_key: "271391984486366", 
    api_secret: "Ry6sFnb8FCX43-RxriPPyu4oOMI",
    secure: true
});

router.post("/creategallery",async(req,res)=>{
    try {
        const fileStr = req.files.image;
        const uploadResponse = await cloudinary.uploader.upload(fileStr.tempFilePath);
        if(uploadResponse.secure_url){
            const item=new postsModel({
                referenceUserId : req.body.referenceUserId,
                postTitle: req.body.title,
                postImage: uploadResponse.secure_url,
                postDescription : req.body.text || ''
            })
            const itex= await item.save().then(item=>{
                if(!item)
                    return res.json({ack:"0", status:500, message:"Allphanusergellary not insert image"})
                    
                return res.json({ack:"1", status:200, message:"Allphanusergellary image upload",view:item});
            })
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }

}) 

// router.post("/creategallery",async(req,res)=>{
//     try {
//         const fileStr = req.files.image;
//         const uploadResponse = await cloudinary.uploader.upload(fileStr.tempFilePath);
//         if(uploadResponse.secure_url){
//             const item=new postsModel({
//                 referenceUserId : req.body.referenceUserId,
//                 postTitle: req.body.title,
//                 // postImage: uploadResponse.secure_url,
//                 postDescription : req.body.text
//             })
//             const insertPost = await item.save()
//             if(insertPost){
//                 const dataG = new galleryModel({
//                     refPostId : item._id,    
//                     postImagePath : uploadResponse.secure_url
//                 })

//                 const insertG = dataG.save()
//                 if(dataG){
//                     res.status(200).json({ message: 'success' });
//                 }
//             }
//         }else{
//             res.status(500).json({ message: 'image not uploaded' });
//         }
        
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ err: 'Something went wrong' });
//     }

// })
  
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
                let dbo = db.db("myFirstDatabase")
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
                        $match:{
                            $and:[{"isActive" : true}]
                        }
                    },
                    {$sort: {"createdAt": -1}},
                    {
                        $lookup: {
                            from: "galleries",
                            localField: "_id",
                            foreignField: "refPostId",
                            as: "postInfo"
                        }
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

router.get("/:id",async(req,res)=>{
    try{
        console.log('id >>', req.params.id)
        const id = ObjectID(req.params.id)
        const data = await postsModel.find({referenceUserId:id})
        data ? 
            res.json({ack:"1", status:200, message:"success", responseData:data}) 
            : res.json({ack:"0", status:500, message:"fetch error or not found", error:err})
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err})
    }
})

module.exports = router
