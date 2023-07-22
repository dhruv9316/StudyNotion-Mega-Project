const Tag = require("../models/Tag");

// CREATE-TAG => HANDLER-FUNCTION
exports.createTag = async (req, res) => {
    try{
        //FETCHING... data
        const {name, description} = req.body;

        //validating... 
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All Fields Are Mandatory"
         
            })
        }

        //creating... entry
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log("tagDeTAIls => ", tagDetails);

        //SENDING... FINAL RESPONSE
        return res.status(200).json({
            success:true,
            message:"tag created SUCCESSFULLY"
     
        })


    } catch(error){
        return res.status(500).json({
            sucess:false,
            message: res.message,
        })
    }
}


//getAllTags => handler-function
exports.showAllTags = async (req, res) => {
    try{
        //fetching.. data
        const allTags = await Tag.find({}, {name: true, description: true});

        return res.status(200).json({
            success:true,
            message:"all tags returned SUCCESSFULLY",
            allTags,
        })

    } catch(error) {
        return res.status(500).json({
            sucess:false,
            message: res.message,
        })
    }
}