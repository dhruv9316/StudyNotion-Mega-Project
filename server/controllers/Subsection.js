const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//createSubSection => handler function
exports.createSubSection = async (req, res) => {
    try{
        //fetching.. data
        // const {sectionId, title, timeDuration, description} = req.body;
        const {sectionId, title, description} = req.body;

        //extracting... file
        // const video = req.files.videoFile;
        const video = req.files.video

        //validation...
        // if(!sectionId || !title || !timeDuration || !description || !video){
        //     return res.status(400).json({
        //         success : false,
        //         message : "all fields are REQUIRED !!",
        //     })
        // }
        if(!sectionId || !title || !description || !video){
          return res.status(400).json({
              success : false,
              message : "all fields are REQUIRED !!",
          })
        }

        //uploading.. video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(
                      video, process.env.FOLDER_NAME);

        // creating ... a subsection
        const subSectionDetails = await SubSection.create({
            title:title,
            // timeDuration:timeDuration,
            timeDuration: `${uploadDetails.duration}`,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })

        //updating... section 
        const updatedSection = await Section.findByIdAndUpdate(
            {_id:sectionId}, 
            {
                $push:{
                    subSection:subSectionDetails._id,
                }
            },
            {
                new:true
            },                                                  
        ).populate("subSection");//TODO ---=> LOG UPDATED SECTION HERE AFTER POPULATE QUERY 

        //sending.. final response
        return res.status(200).json({
            success : true,
            message : "subSection created SUCCESSFULLY !!",
            data: updatedSection,
        })

    } catch(error){
        return res.status(500).json({
            success : false,
            message : "error ocurred while creating SUB-SECTION !!",
            error:error.message,
        })
    }
}

//HW    <=----=====        
//updateSubSection => handler function
exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, subSectionId, title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.videoFile !== undefined) {
        const video = req.files.videoFile;
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()

      const updatedSection = await Section.findById(sectionId).populate("subSection")
  
      return res.json({
        success: true,
        data:updatedSection,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }
  
  //deleteSubSection => handler function
  exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }

      const updatedSection = await Section.findById(sectionId).populate("subSection")
  
      return res.json({
        success: true,
        data: updatedSection,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }