const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");
// CREATE a new section
exports.createSection = async (req, res) => {
	try {
		// Extract the required properties from the request body
		const { sectionName, courseId } = req.body;

		// Validate the input
		if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}

		// Create a new section with the given name
		const newSection = await Section.create({ sectionName });

		// Add the new section to the course's content array
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// Return the updated course object in the response
		res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourse,
		});
	} catch (error) {
		// Handle errors
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

// UPDATE a section
exports.updateSection = async (req, res) => {
	try {
		const { sectionName, sectionId,courseId } = req.body;
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);

		const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection",
			},
		})
		.exec();

		res.status(200).json({
			success: true,
			message: section,
			data:course,
		});
	} catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// DELETE a section
exports.deleteSection = async (req, res) => {
	try {

		const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};   



// const Section = require("../models/Section");
// const Course = require("../models/Course");

// //createSection => HANDLER FUNCTION
// exports.createSection = async (req, res) => {
//     try{
//         //fetching.. data
//         const {courseId, sectionName} = req.body;

//         //data validation...
//         if(!courseId || !sectionName ){
//             return res.status(400).json({
//                 success : false,
//                 message : "all fields are REQUIRED !!",
//             })
//         }

//         //creating... section
//         const newSection = await Section.create({sectionName});

//         //updating.. course with section-object-id
//         const updatedCourseDetails = await Course.findByIdAndUpdate(
//                                             courseId, 
//                                             {
//                                                 $push:{
//                                                     courseContent:newSection._id,
//                                                 }
//                                             },
//                                             {
//                                                 new:true
//                                             },                                                  
//             ).populate({
// 				path: "courseContent",
// 				populate: {
// 					path: "subSection",
// 				},
// 			})
// 			.exec();
//             //NOTE:-- populate section/subsection

//         //sending.. final response
//         return res.status(200).json({
//             success : true,
//             message : "section created SUCCESSFULLY !!",
//             updatedCourseDetails
//         })

//     } catch(error){
//         return res.status(500).json({
//             success : false,
//             message : "error ocurred while creating SECTION !!",
//             erro:error.message,
//         })
//     }
// }


// //updateSection => HANDLER FUNCTION
// exports.updateSection = async (req, res) => {
//     try{
//         //fetching.... data
//         const {sectionId, sectionName} = req.body;

//         //data validation...
//         if(!sectionId || !sectionName ){
//             return res.status(400).json({
//                 success : false,
//                 message : "all fields are REQUIRED !!",
//             })
//         }

//         //updating... data
//         const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

//         //sending... response
//         return res.status(200).json({
//             success : true,
//             message : section,
//         })

//     } catch(error) {
//         return res.status(500).json({
//             success : false,
//             message : "error ocurred while updating. SECTION !!",
//             erro:error.message,
//         })
//     }
// }

// //deleteSection => handler function
// exports.deleteSection = async (req, res) => {
//     try{
//         //HW -> req.params -> test

//         //getting.. ID -: assuming we r sending id in params
//         const {sectionId, courseId} = req.body;

//         //finding.. id
//         await Section.findByIdAndDelete(sectionId);
//         // TODO: DO WE NEED TO DELETE IN COURSE-SCHEMA ALSO  ==== NO
//         await Course.findByIdAndUpdate(
//             courseId,
//             // {
//             //     courseContent: sectionDetails,
//             // },
//             {new : true}
//             );
//         //sending... response
//         return res.status(200).json({
//             success : true,
//             message : "section deleted SUCCESSFULLY !!",
//         })

//     } catch(error) {
//         return res.status(500).json({
//             success : false,
//             message : "error ocurred while deleting.. SECTION !!",
//             erro:error.message,
//         })
//     }
    
// }

