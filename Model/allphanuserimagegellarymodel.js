const mongoose = require('mongoose');
// const { Schema } = mongoose;
const { required } = require('nodemon/lib/config');

const allphanuserimagegellaryScema=new mongoose.Schema({
    RefPostId:{
        type:String,
        required:true
    },    
    PaostImagePath:{
        type:String,
        required:true
    },
    IsActive:{
        type:String,
        default:false
    },
    IsTarsh:{
        type:Number,
        default:0
    },
    Status:{
        type:String,
        default:false
    }
},{timestamps:true});
module.exports=mongoose.model('Allphanuserimagegellary',allphanuserimagegellaryScema);





<!DOCTYPE html>
	<html>
	  <head>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta charset="utf-8">
		<title>Application Error</title>
		<style media="screen">
		  html,body,iframe {
			margin: 0;
			padding: 0;
		  }
		  html,body {
			height: 100%;
			overflow: hidden;
		  }
		  iframe {
			width: 100%;
			height: 100%;
			border: 0;
		  }
		</style>
	  </head>
	  <body>
		<iframe src="//www.herokucdn.com/error-pages/application-error.html"></iframe>
	  </body>
	</html>