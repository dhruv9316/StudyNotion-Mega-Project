const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//resetPasswordTOKEN
exports.resetPasswordToken = async (req, res) => {
    try{
        //fetching.. email
        const email = req.body.email;

        //check user for email i.e. EMAIL-VALIDATION
        const user = await User.findOne({email: email});
            if(!user) {
                return res.json({success:false,
                message:'Your Email is not registered with us'});
            }

        //generating... token
        const token  = crypto.randomBytes(20).toString("hex");

        //updating... user by adding token and expirationTime
        const updatedDetails = await User.findOneAndUpdate(
                                            {email:email},
                                            {
                                                token:token,
                                                resetPasswordExpires: Date.now() + 5*60*1000,
                                            },
                                            {new:true}

        );

        //link generation...
        //create url
        // const url = `http://localhost:3000/update-password/${token}`;
        const url = `https://study-notion-mega-project-3602xqx0r-dhruv9316.vercel.app/update-password/${token}`;

        //sending... mail
        await mailSender(email, 
            " Reset Ur Password => ",
            `Password Reset Link: ${url}`);
            console.log("token ==>", token);

        //returning... final response
        return res.json({
            success:true,
            message:'Email sent successfully, please check email and change password',
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset PASSWORD mail'
        })

    }
    
}

//resetPassword\

exports.resetPassword = async (req, res) => {
    try {
        // fetching... data
        const {password, confirmPassword, token} = req.body;
        // const {token} = req.body.token || req.cookies.token;
        console.log("token---------------------->", token);
        //validation
        if(password !== confirmPassword) {
            return res.json({
                success:false,
                message:'Password does not MATCHED',
            });
        }
        //getting.. userdetails from db using token
        const userDetails = await User.findOne({token: token});
        //if no entry - invalid token
        if(!userDetails) {
            return res.json({
                success:false, 
                message:'Token is invalid',
            });
        }
        //token time check 
        if( userDetails.resetPasswordExpires < Date.now()  ) {
                return res.json({
                    success:false,
                    message:'Token is expired, please regenerate your token',
                });
        }
        //hashing... password
        const hashedPassword = await bcrypt.hash(password, 10);

        // updating password
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );
        //sending... final response
        return res.status(200).json({
            success:true,
            message:'Password reset successful',
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        })
    }
}