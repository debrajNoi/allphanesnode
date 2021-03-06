const express = require('express')
const globalfunction = require('../global')
const jwt = require('jsonwebtoken')
const config = require("../config")
const usersModel = require("../Model/users")
const router = express.Router()
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const {
    ObjectID
} = require('bson')
const users = require('../Model/users')
const {
    response
} = require('express')
const cloudinary = require("cloudinary").v2


cloudinary.config({
    cloud_name: "dsg7oitoj",
    api_key: "271391984486366",
    api_secret: "Ry6sFnb8FCX43-RxriPPyu4oOMI",
    secure: true
});

// "use strict" mail function ****************************** */

// async..await is not allowed in global scope, must use a wrapper
async function mail(info) {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        tls: {
            ciphers: "SSLv3",
            rejectUnauthorized: false,
        },
        auth: {
            user: process.env.AUTH_EMAIL, // generated ethereal user
            pass: process.env.AUTH_PASS, // generated ethereal password
        },
    })

    // send mail with defined transport object
    await transporter.sendMail(info)

}

// create users ********************************************* _*/
const create = async (req, res, next) => {
    try {
        const currentDate = new Date()
        let otpExp = new Date()
        otpExp.setTime(currentDate.getTime() + (10 * 60 * 1000))
        const email = req.body.email
        const phone = req.body.phone
        const salt = await bcrypt.genSalt(10)
        const hashPass = await bcrypt.hash(req.body.password, salt)
        const randotp = globalfunction.randNum(6)
        const hashOTP = await bcrypt.hash(randotp, salt)

        const checkUsr = await usersModel.findOne({
            $or: [{
                email: email
            }, {
                phone: phone
            }]
        })

        if (checkUsr)
            return res.json({
                ack: "0",
                status: 401,
                message: "Registration not succesfull, email or Phone Number alredy exist"
            })

        const item = new usersModel({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            password: hashPass,
            otp: hashOTP,
            otpExpTime: otpExp
        })

        // mail function
        let info = {
            from: '"noreply@Allphanes"' + process.env.AUTH_EMAIL, // sender address
            to: email, // list of receivers
            subject: "Allphanes email Verification", // Subject line
            html: "<h2>Please verify your Email</h2><h1>" + randotp + "</h1><p>(This code is valid for 10 minutes)</p>", // html body
        }
        const mailRespones = await mail(info)
        if (!mailRespones)
            res.json({
                ack: "0",
                status: 401,
                message: "Opps, precess error"
            })

        const saveUsr = await item.save()
        const picked = (({
            id,
            firstName,
            lastName,
            profilePhoto,
            coverPhoto
        }) => ({
            id,
            firstName,
            lastName,
            profilePhoto,
            coverPhoto
        }))(saveUsr)

        saveUsr ?
            res.json({
                ack: "1",
                status: 200,
                message: "AllphaneUser data  Insert SuccesFully",
                otp: randotp,
                id: item._id,
                responseData: picked
            }) :
            res.json({
                ack: "0",
                status: 401,
                message: "Opps, Some error occured, Please try again later"
            })


    } catch (err) {
        return res.json({
            ack: 0,
            status: 500,
            message: "server error"
        })
    }
}


// Retrive users ********************************************************************** /
router.get('/hola', async (req, res) => {
    try {
        const data = await usersModel.find()
        const response = data ?
            res.json({
                ack: "1",
                status: 200,
                message: "Request Successfull",
                responseData: data
            }) :
            res.json({
                ack: "0",
                status: 400,
                message: "Allphanuser data not get"
            })
        return response
    } catch (err) {
        res.json({
            ack: "0",
            status: 500,
            message: "server error",
            error: err
        })
    }
})
// get online users ********************************************* _*/
router.get('/online', async (req, res) => {
    try {
        const data = await usersModel.find({
            isActive: true
        })
        const response = data ?
            res.json({
                ack: "1",
                status: 200,
                message: "Request Successfull",
                responseData: data
            }) :
            res.json({
                ack: "0",
                status: 400,
                message: "Allphanuser data not get"
            })
        return response
    } catch (err) {
        res.json({
            ack: "0",
            status: 500,
            message: "server error",
            error: err
        })
    }
})

router.patch('/updateuser/:id', async (req, res) => {
    try {
        paramid = ObjectID(req.params.id)
        password = req.body.password
        const findUser = await usersModel.findOne({
            _id: paramid
        })

        const matchPassword = await bcrypt.compare(password, findUser.password)
        if (!matchPassword) return res.json({
            ack: "0",
            status: 400,
            message: "Invalid Credentials"
        })

        delete req.body.password

        const data = await usersModel.findOneAndUpdate({
            _id: paramid
        }, {
            $set: req.body
        })

        const response = await usersModel.findOne({
            _id: paramid
        })

        const picked = (({
            id,
            firstName,
            lastName,
            profilePhoto,
            coverPhoto,
            email
        }) => ({
            id,
            firstName,
            lastName,
            profilePhoto,
            coverPhoto,
            email
        }))(response)

        data ?
            res.json({
                ack: "1",
                status: 200,
                message: "Request Successfull",
                responseData: picked
            }) :
            res.json({
                ack: "0",
                status: 400,
                message: "Allphanuser data not get"
            })
    } catch (err) {
        res.json({
            ack: "0",
            status: 500,
            message: "server error",
            error: err
        })
    }
})

router.patch('/:id', async (req, res) => {
    try {
        id = req.params.id
        const data = await usersModel.findOneAndUpdate({
            _id: ObjectID(id)
        }, {
            $set: req.body
        })
        const response = data ?
            res.json({
                ack: "1",
                status: 200,
                message: "Request Successfull"
            }) :
            res.json({
                ack: "0",
                status: 400,
                message: "Allphanuser data not get"
            })
        return response
    } catch (err) {
        res.json({
            ack: "0",
            status: 500,
            message: "server error",
            error: err
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        id = req.params.id
        const data = await usersModel.findOne({
            _id: ObjectID(req.params.id)
        }, {
            firstName: 1,
            lastName: 1,
            profilePhoto: 1,
            coverPhoto: 1,
            email: 1,
            phone: 1,
            isEmailVerified: 1,
            altPhoneNo: 1
        })
        const response = data ?
            res.json({
                ack: "1",
                status: 200,
                message: "Request Successfull",
                responseData: data
            }) :
            res.json({
                ack: "0",
                status: 400,
                message: "Allphanuser data not get"
            })
        return response
    } catch (err) {
        res.json({
            ack: "0",
            status: 500,
            message: "server error",
            error: err
        })
    }
})

router.get("storage/:id", async (req, res) => {
    try {
        paramId = ObjectID(req.params.id)
        const data = await usersModel.find({
            _id: paramId
        })

        const response = data ?
            res.json({
                ack: "1",
                status: 200,
                message: "Request Successfull",
                responseData: data
            }) :
            res.json({
                ack: "0",
                status: 400,
                message: "Allphanuser data not get"
            })
        return response
    } catch (err) {
        res.json({
            ack: "0",
            status: 500,
            message: "server error",
            error: err
        })
    }

})

router.post('/members', async (req, res) => {
    try {
        const data = await usersModel.find({
            _id: {
                $ne: req.body.id
            }
        }).select(["firstName", "lastName", "profilePhoto"])
        const response = data ?
            res.json({
                ack: "1",
                status: 200,
                message: "Request Successfull",
                data: data
            }) :
            res.json({
                ack: "0",
                status: 400,
                message: "Allphanuser data not get"
            })
        return response
    } catch (err) {
        res.json({
            ack: "0",
            status: 500,
            message: "server error",
            error: err
        })
    }
})
// delete users by id********************************************************************** /
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await usersModel.findByIdAndRemove({
            _id: req.params.id
        })
        if (deleted) res.json({
            ack: "1",
            status: 200,
            message: "Deleted Successfully"
        })
    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "server error",
            error: err
        })
    }
})

// login controller ********************************************************** /
router.post("/login", async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        // const randotp = globalfunction.randNum(6)
        // const salt = await bcrypt.genSalt(10)
        // const hashOTP = await bcrypt.hash(randotp, salt)
        // const currentDate = new Date()
        // let otpExT = new Date()
        // otpExT.setTime(currentDate.getTime() + (10 * 60 * 1000))

        const findUser = await usersModel.findOne({
            email: email
        })
        if (!findUser) return res.json({
            ack: "0",
            status: 400,
            message: "User Not Exist"
        })
        const matchPassword = await bcrypt.compare(password, findUser.password)
        if (!matchPassword) return res.json({
            ack: "0",
            status: 400,
            message: "Invalid Credentials"
        })
        const updateActive = await usersModel.findOneAndUpdate({
            email: findUser.email
        }, {
            $set: {
                "isActive": true
            }
        })

        const picked = (({
            id,
            firstName,
            lastName,
            profilePhoto,
            coverPhoto,
            email
        }) => ({
            id,
            firstName,
            lastName,
            profilePhoto,
            coverPhoto,
            email
        }))(findUser)

        updateActive ?
            res.json({
                ack: "1",
                status: 200,
                message: "Login Successfully",
                responseData: picked
            }) :
            res.json({
                ack: "0",
                status: 400,
                message: "invallid credential"
            })


    } catch (err) {
        res.json({
            ack: "0",
            status: 500,
            message: "Server Errors",
            error: err
        })
    }
})

// emailreset ********************************************************************** /
router.get("/resetemail", async (req, res) => {
    try {
        const findEmail = await usersModel.find({
            email: req.body.email
        })
        if (!findEmail) return res.json({
            ack: "0",
            status: 400,
            message: "email not matching"
        })
        const emailupdate = await usersModel.updateOne({
            email: req.body.email
        }, {
            $set: {
                email: req.body.conemail
            }
        }).then(user => {
            if (!user) return res.status(400).json({
                msg: "email not update"
            })
            return res.status(200).json({
                msg: "email update success"
            })
        })
    } catch (err) {
        res.json({
            ack: "0",
            status: 500,
            message: "Server Error",
            error: err
        })
    }
})

// Forgot password ********************************************************************** /
router.get("/forgetpassword", async (req, res) => {
    try {
        const randotp = globalfunction.randNum(6)
        const findEmail = await usersModel.findOne({
            email: req.body.email
        }).then(user => {
            if (!user) return res.json({
                ack: "0",
                status: 400,
                message: "email not matching"
            })
            //  return res.json({ack:"1", status:200, message:"email matching success",randotp})
            const token = jwt.sign({
                id: usersModel.id
            }, config.secret, {
                expiresIn: 86400
            })
        })
    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "server Error",
            error: err
        })
    }
})

//otp verification 
router.post("/otpverification", async (req, res) => {
    try {
        const id = req.body.id
        const verifyOTP = req.body.otp
        const currentTime = new Date()
        await usersModel.findOne({
                _id: id
            })
            .then(user => {
                if (!user) return res.json({
                    ack: "0",
                    status: 400,
                    message: "Cannot find user"
                })
                if (currentTime > user.otpExpTime) return res.json({
                    ack: "0",
                    status: 400,
                    message: "OTP Expired, Please resend OTP to try again"
                })
                bcrypt.compare(verifyOTP, user.otp, (err, data) => {
                    //if error than throw error
                    if (err) throw err
                    //if both match than you can do anything
                    if (!data) return res.json({
                        ack: "0",
                        status: 400,
                        message: "OTP not matched, Please enter valid OTP"
                    })
                    //updating user data   
                    usersModel.updateOne({
                        _id: id
                    }, {
                        $set: {
                            isEmailVerified: true
                        }
                    }, function (err) {
                        if (err) return res.json({
                            "ack": 0,
                            status: 401,
                            message: err
                        })
                        return res.json({
                            ack: "1",
                            status: 200,
                            message: "OTP matched succesfully"
                        })
                    })
                })
            })
    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "server Error",
            error: err
        })
    }
})
// resend OTP ********************************************* _*/
router.post("/resendotp", async (req, res) => {
    try {
        const id = req.body.id
        const randotp = globalfunction.randNum(6)
        const hashOTP = await bcrypt.hash(randotp, 10)

        const currentDate = new Date()
        let otpExp = new Date()
        otpExp.setTime(currentDate.getTime() + (10 * 60 * 1000))

        await usersModel.findOne({
                _id: id
            })
            .then(user => {
                if (!user) return res.json({
                    ack: "0",
                    status: 400,
                    message: "Cannot find user"
                })

                // mail function 
                let info = {
                    from: '"noreply@Allphanes"' + process.env.AUTH_EMAIL, // sender address
                    to: user.email, // list of receivers
                    subject: "Allphanes email Verification", // Subject line
                    html: "<h2>Please verify your Email</h2><h1>" + randotp + "</h1><p>(This code is valid for 10 minutes)</p>", // html body
                }
                mail(info).catch(console.error)

                usersModel.findOneAndUpdate({
                    _id: id
                }, {
                    $set: {
                        otp: hashOTP,
                        otpExpTime: otpExp
                    }
                }, function (err) {
                    if (err) return res.json({
                        "ack": 0,
                        status: 401,
                        message: err
                    })
                    return res.json({
                        ack: "1",
                        status: 200,
                        message: "OTP send Successfully",
                        otp: randotp
                    })
                })
            })
    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "server Error",
            error: err
        })
    }
})

// get ********************************************* _*/
router.post("/profilephoto", async (req, res) => {
    try {
        const files = req.files.profilePhoto
        // const coverPhoto=req.files.coverPhoto;
        const uploadResponse = await cloudinary.uploader.upload(files.tempFilePath);
        // const uploadCoverPhoto = await cloudinary.uploader.upload(coverPhoto.tempFilePath);
        let response = {}
        if (req.body.isProfile === '1') {
            response = await usersModel.findOneAndUpdate({
                _id: req.body.id
            }, {
                $set: {
                    profilePhoto: uploadResponse.secure_url
                }
            })
        }
        if (req.body.isProfile === '0') {
            response = await usersModel.findOneAndUpdate({
                _id: req.body.id
            }, {
                $set: {
                    coverPhoto: uploadResponse.secure_url
                }
            })
        }

        response ?
            res.json({
                ack: "1",
                status: 200,
                message: "profile photo Update Successfully",
            }) :
            res.json({
                "ack": 0,
                status: 401,
                message: err
            })

    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "Server error",
            error: err
        })
    }
})

router.post("/coverphoto", async (req, res) => {
    try {
        const files = req.files.coverPhoto
        const uploadResponse = await cloudinary.uploader.upload(files.tempFilePath);
        const response = await usersModel.findOneAndUpdate({
            _id: req.body.id
        }, {
            $set: {
                coverPhoto: uploadResponse.secure_url
            }
        })
        response ?
            res.json({
                ack: "1",
                status: 200,
                message: "cover photo Update Successfully"
            }) :
            res.json({
                "ack": 0,
                status: 401,
                message: err
            })

    } catch (err) {
        res.json({
            ack: 0,
            status: 500,
            message: "Server error",
            error: err
        })
    }
})

// all Roueters ********************************************* _*/
router.post('/create', create)

module.exports = router