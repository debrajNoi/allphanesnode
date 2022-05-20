var jwt = require("jsonwebtoken");
var config=require("../config");
module.exports=(req,res,next)=>{
    console.log(req.headers);
    try{
        var token=req.headers.authorization.split(" ")[1];
        // console.log(token);
        const decode=jwt.verify(token,config.secret);
        console.log(decode);
        if(req.params.id){
            if(req.params.id != decode.id){
               return res.json({ack:0, status:500, message:"invalid token"});
            }
        }
      next();
    }catch(err){
        res.json({ack:0, status:500, message:"invalid token"});
    }
}