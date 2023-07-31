const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");

//otp verification by SENDING OTP
exports.sendotp = async (req, res) => {
    try{
        //1st STEP => fetching... eamil from req.body
        const {email} = req.body;

        //check if user already present..
        const checkUserPresent = await User.findOne({email});
        //if user is already present
        if(checkUserPresent){
            return res.status(401).json({
                sucess:false,
                message:"User Already Exists",
            })
        } 

        //genearating... otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP GENERATED => ",otp);

        //checking... uniqueness of the oTP
        // let result = await OTP.findOne({otp: otp});

        // while(result){
        //     otp = otpGenerator.generate(6, { //CHECK THIS IF ERROR OCURR 
        //         upperCaseAlphabets:false,
        //         lowerCaseAlphabets:false,
        //         specialChars:false,
        //     });

        //     result = await OTP.findOne({otp: otp});
        // }

        const result = await OTP.findOne({ otp: otp });
		// console.log("Result is Generate OTP Func");
		console.log("--------------OTP-------------", otp);
		console.log("Result", result);
		while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
			});
		}

        //creating... otpPayload
        const otpPayload = {email, otp};
        //creating... an entry in Database for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log("otpBODY -> ", otpBody);

        //sending...final response
        res.status(200).json({
            success:true,
            message:"OTP Sended SUCCESSFULLY !!",
        })

    } catch(error){
        console.log(error.message);
        return  res.status(500).json({
            success:false,
            message:error.message,
        })
    }
 
}


//signup
// exports.signup = async (req, res) => {
//     try{
//         //fetching... data from req,body
//         const {
//             firstName,
//             lastName,
//             email,
//             password,
//             confirmPassword,
//             accountType,
//             contactNumber,
//             otp,
//         } = req.body;
//         console.log("otp => ", otp);

//         //validaing... data
//         if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
//             return res.status(403).json({
//                 success:false,
//                 message:"ALL FIELDS ARE REQUIRED",
//             });
//         }

//         //matching... 2-PASSWORDS
//         if(password !== confirmPassword){
//             return res.status(400).json({
//                 success:false,
//                 message:"password and confirmPassword does not matched",
//             });
//         }

//         //checking.. user existence if present already
//         const existingUser = await User.findOne({email});
//             //if user is already present
//             if(existingUser){
//                 return res.status(400).json({
//                     sucess:false,
//                     message:"User Already Exists",
//                 });
//             } 

//         //finding... most recent otp 
//         const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);
//         console.log("recentOTP => ", recentOTP);

//         //validating... OTP  
//         if(recentOTP.length === 0){
//             //otp not founded
//             return res.status(400).json({
//                 sucess:false,
//                 message:"otp not founded",
//             });
//         } else if(otp !== recentOTP[0].otp){
//             //WRONG OTP
//             return res.status(400).json({
//                 sucess:false,
//                 message:"otp doesn't matched",
//             });
//         }

//         //hasing... password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         //creating... entry
//         //but first creating additional details i.e. PROFILE for userSchema
//         const profileDetails = await Profile.create({
//             gender:null,
//             dateOfBirth:null,
//             about:null,
//             contactNumber:null,
//         })
//         const user = await User.create({
//             firstName,
//             lastName,
//             email,
//             contactNumber,
//             password:hashedPassword,
//             accountType,
//             additionalDetails:profileDetails._id,
//             image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
//         })

//         //sending...final response
//         return res.status(200).json({
//             success:true,
//             message:"user registered SUCCESSFULLY !!",
//             user,
//         });


//     } catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:"user cannot be REGISTERED, try again ",
//         }) 
//     }

// }
exports.signup = async (req, res) => {
	try {
		// Destructure fields from the request body
		const {
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
			accountType,
			contactNumber,
			otp,
		} = req.body;
		// Check if All Details are there or not
		if (
			!firstName ||
			!lastName ||
			!email ||
			!password ||
			!confirmPassword ||
			!otp
		) {
			return res.status(403).send({
				success: false,
				message: "All Fields are required",
			});
		}
		// Check if password and confirm password match
		if (password !== confirmPassword) {
			return res.status(400).json({
				success: false,
				message:
					"Password and Confirm Password do not match. Please try again.",
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists. Please sign in to continue.",
			});
		}

		// Find the most recent OTP for the email
		const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        // const response = await OTP.find({ email }).sort({ createdAt: -1 });
		console.log(response);
		if (response.length === 0) {
			// OTP not found for the email
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		} else if (otp !== response[0].otp) {
			// Invalid OTP
			return res.status(400).json({
				success: false,
				message: "The OTP you entered is wrong !!",
			});
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

		// Create the Additional Profile For User
		const profileDetails = await Profile.create({
			gender: null,
			dateOfBirth: null,
			about: null,
			contactNumber: null,
		});
		const user = await User.create({
			firstName,
			lastName,
			email,
			contactNumber,
			password: hashedPassword,
			accountType: accountType,
			approved: approved,
			additionalDetails: profileDetails._id,
			image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
		});

		return res.status(200).json({
			success: true,
			user,
			message: "User registered successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "User cannot be registered. Please try again.",
		});
	}
};

//login
exports.login = async (req, res) => {
    try{
        //fetching... data
        const{
            email,
            password,
        } = req.body;

        //validating... data
        if( !email || !password ){
            return res.status(403).json({
                success:false,
                message:"ALL FIELDS ARE REQUIRED",
            });
        }

        //checking... user existence
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"user is not registered !!",
            });
        }

        //matching... password && //generating... JWT token
        if(await bcrypt.compare(password, user.password)) {
            //creating.. payload
            const payload = {
                email: user.email,
                id: user._id,
                accountType:user.accountType,
            }
            //generating... jwt token
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                // expiresIn:"24h",
                // expiresIn:"365d" 
            });
            user.token = token;
            user.password = undefined;

            //creating... cookie && //sending...  final RESPONSE 
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"LOGGED IN SUCCESSFULLY",
            });
        
        }
        else{
            return res.status(401).json({
                success:false,
                message:"password doesnt matched !!",
            });
        }

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"user cannot LOGGED in, try again ",
        }) 
    }
} 


//changing.. password
//TODO: HOMEWORK
exports.changePassword = async (req, res) => {
    try{
        //get data from req body
        const userDetails = await User.findById(req.user.id);

        //get oldPassword, newPassword, confirmNewPassowrd
        const {oldPassword, newPassword, confirmNewPassword} = req.body;

        //validation of oldPass
        const isPasswordMatch = await bcrypt.compare(
            oldPassword, 
            userDetails.password,
        )
        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res
            .status(401)
            .json({
                success: false,
                message: "The password is incorrect" 
                });
        }
 
        // Match new password and confirm new password
        // if (newPassword !== confirmNewPassword) {
		// 	// If new password and confirm new password do not match, return a 400 (Bad Request) error
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: "The password and confirm password does not match",
		// 	});
		// }

        //update pwd in DB
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            {password: encryptedPassword},
            {new : true},
        )

        //send mail - Password updated
        try{
            const emailResponse = await mailSender(
				updatedUserDetails.email,
                `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
				passwordUpdated(
					updatedUserDetails.email,
					`${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
        } catch(error){
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});

        }

        //return final response
        return res
			.status(200)
			.json({ success: true,
                 message: "Password updated successfully"
                });

    } catch(error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
    }
    
};