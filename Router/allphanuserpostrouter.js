const express=require('express');
const globalfunction = require('../global');
const Allphanuserpost=require("../Model/allphanuserpostmodel");
const Allphanuserimagegellary=require("../Model/allphanuserimagegellarymodel");
const multer=require("multer");
const imagetest=require("../Model/imagetest");


const router = express.Router()



router.post('/allphanuserposttitle',async(req,res)=>{
    try{
        const randotp = globalfunction.randNum(6);
       const data=new Allphanuserpost({

        RefrenceUId:randotp,
        PostTitle:req.body.PostTitle,
        PostDescription:req.body.PostDescription,
        PostDateTime:Date.now(),
        Isactive:true,
        Istarsh:true,
        ModifiedDateTime:Date.now(),
        CountViews:1
       })

      const item= await data.save().then(item=>{
           if(!item)return res.json({ack:0, status:400, message:"Allphanuserpost inssert not successfully"});
           
           console.log(item);
           return res.json({ack:1, status:200, message:"Allphanuserpost insert successFully",id:item._id});
           
       })
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err});
    }
});


router.post('/allphanestest',async(req,res)=>{
    try{
        const randotp = globalfunction.randNum(6);
       const data=new Allphanuserpost({

        RefrenceUId:randotp,
        PostTitle:req.body.PostTitle,
        PostDescription:req.body.PostDescription,
        PostDateTime:Date.now(),
        Isactive:true,
        Istarsh:true,
        ModifiedDateTime:Date.now(),
        CountViews:1
       })

      const item= await data.save().then(item=>{
           if(!item)return res.json({ack:0, status:400, message:"Allphanuserpost inssert not successfully"});
           
        //    console.log(item);
        //    return res.json({ack:1, status:200, message:"Allphanuserpost insert successFully",id:item._id});


        const randvale = (Date.now());
        let imagepath = ""
        if (req.files != null) {
            if (req.files.PaostImagePath != null) {
                req.files.PaostImagePath.mv("./gellary/image/" + randvale + '.jpg', function (err) {
                    if (err) {
                        res.json({ "ack": 0, status: 401, message: "phto upload fail" });
                    }
                })
                imagepath = "gellary/image" + randvale + '.jpg';
            }
        }
        
        const allphanuserdata= Allphanuserpost.find().sort({_id:-1}).limit(1);
        // console.log(allphanuserdata)
         const refid=[];
        
        allphanuserdata.forEach(item=>{
            // console.log('',item.id + item.createdAt);
            const val=item.id;
            // console.log(val);
            refid.push(val);
        });
        const refarenid=refid[0];
        
//    console.log(new mongoose.Types.ObjectId());
        const ite=new Allphanuserimagegellary({
            RefPostId:refarenid,
            PaostImagePath:imagepath,
            IsActive:true,
            IsTarsh:1,
            Status:true
        });
        ite.save().then(ite=>{
           if(!ite)return res.json({ack:"0", status:500, message:"Allphanusergellary not insert image"});
           console.log(ite);
           return res.json({ack:"1", status:200, message:"Allphanusergellary image upload"});
       })

           
       })
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err});
    }
});




router.post("/allphanuserimagegellary",async(req,res)=>{
    try{
        const randvale = (Date.now());
        let imagepath = ""
        if (req.files != null) {
            if (req.files.PaostImagePath != null) {
               await req.files.PaostImagePath.mv("./gellary/image/" + randvale + '.jpg', function (err) {
                    if (err) {
                        res.json({ "ack": 0, status: 401, message: "phto upload fail" });
                    }
                })
                imagepath = "gellary/image" + randvale + '.jpg';
            }
        }
        
        const allphanuserdata=await Allphanuserpost.find().sort({_id:-1}).limit(1);
        console.log(allphanuserdata)
         const refid=[];
        
        allphanuserdata.forEach(item=>{
            // console.log('',item.id + item.createdAt);
            const val=item.id;
            // console.log(val);
            refid.push(val);
        });
        const refarenid=refid[0];
        
        
//    console.log(new mongoose.Types.ObjectId());
        const item=new Allphanuserimagegellary({
            RefPostId:refarenid,
            PaostImagePath:imagepath,
            IsActive:true,
            IsTarsh:1,
            Status:true
        });
       await item.save().then(item=>{
           if(!item)return res.json({ack:"0", status:500, message:"Allphanusergellary not insert image"});
           return res.json({ack:"1", status:200, message:"Allphanusergellary image upload"});
       })
    }catch(err){
        res.json({ack:0, status:500, message:"server error",error:err});
    }
});

router.get("/allphanpostandgellaey",async(req,res)=>{
    try{
        const newpromise = new Promise(async (resolve, reject) => {
            await Allphanuserpost.find()
                .exec(function (err, data) {
                    if (err) return res.json({ "ack": 0, status: 406, error: err });
                    console.log(data);
                    resolve({ first: data });
                });


        }).catch((err) => console.log(err))

        newpromise.then(async (element) => {
            await Allphanuserimagegellary.find()
                .exec(function (err, data) {
                    // console.log(data);
                   
                    if (err) return res.json({ "ack": 0, status: 406, error: err });
                    res.json({ ...element, second: data })
                });

        })
   

    }catch(err){
        res.json({ack:"0", status:500, message:"server error",error:err});
    }
})

router.get("/posts",async(req,res)=>{
    try{
       const item=await Allphanuserpost.find().then(item=>{
        if(!item)return res.json({ack:0, message:"not get"});
        res.json({ack:"1", status:200, message:"Allphanuserpost data get successfully",view:item});
       })
    }catch(err){
        res.json({ack:"0", status:500, message:"server error", error:err});
    }
})

router.get('/bl',async(req,res)=>{
    try{
        const data=await Allphanuserimagegellary.find()
        const response = data ?
            res.json({ack:1, status:1, message:"Allphanusers data get",view:data}):
            res.json({ack:"0", status:400, message:"Allphanuser data not get"})
        return response
    }catch(err){
       res.json({ack:"0", status:500, message:"server error",error:err})
    }
})

module.exports = router;