import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import Event from "../models/event.model.js";

export const getSuggestedConnections = async (req, res) => {
	try {
		
		const currentUser = await User.findById(req.user._id).select("connections");

		// find users who are not already connected, and also do not recommend our own profile!! right?
		const suggestedUser = await User.find({
			_id: {
				$ne: req.user._id,
				$nin: currentUser.connections,
			},
		})
			.select("name username profilePicture headline")
			.limit(3);

		res.json(suggestedUser);
	} catch (error) {
		console.error("Error in getSuggestedConnections controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getPublicProfile = async (req, res) => {
	try {
		const user = await User.findOne({ username: req.params.username }).select("-password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error("Error in getPublicProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const allowedFields = [
			"name",
			"username",
			"headline",
			"about",
			"location",
			"profilePicture",
			"bannerImg",
			"skills",
			"experience",
			"education",
		];

		const updatedData = {};

		for (const field of allowedFields) {
			if (req.body[field]) {
				updatedData[field] = req.body[field];
			}
		}

		if (req.body.profilePicture) {
			const result = await cloudinary.uploader.upload(req.body.profilePicture);
			updatedData.profilePicture = result.secure_url;
		}

		if (req.body.bannerImg) {
			const result = await cloudinary.uploader.upload(req.body.bannerImg);
			updatedData.bannerImg = result.secure_url;
		}

		const user = await User.findByIdAndUpdate(req.user._id, { $set: updatedData }, { new: true }).select(
			"-password"
		);

		res.json(user);
	} catch (error) {
		console.error("Error in updateProfile controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};





export const searchUsers = async (req, res) => {
	console.log("hello");
	try {
		
	  const { query } = req.query;
  
	  if (!query) return res.status(400).json({ message: "Query is required" });
	 
	  const users = await User.find({
		$or: [
		//   { name: { $regex: query, $options: "i" } },
		  { username: { $regex: query, $options: "i" } },
		],
	  }).limit(10).select("username profilePicture headline");
  
	  
	  res.json(users);
	} catch (error) {
		console.error("Error in searchUsers:", error); // Crucial for debugging
        

	  res.status(500).json({ message: "Server error" });
	}
  };



//recommendations-system

// import axios from "axios";

// export const getRecommendations = async (req, res) => {
//     try {
//         const userId = req.user._id; // Extract from the protectRoute middleware
//         const token = req.cookies["jwt-linkedin"]; // Get token from cookies

//         if (!token) {
//             return res.status(401).json({ message: "Unauthorized - No Token Found" });
//         }

//         // Send request to FastAPI with the token in headers
//         const response = await axios.get(`http://127.0.0.1:8000/recommend/${userId}`, {
//             headers: { Authorization: `Bearer ${token}` }  // Use Bearer token format
//         });

//         res.json(response.data);
//     } catch (error) {
//         console.error("Error fetching recommendations:", error?.response?.data || error.message);
//         res.status(500).json({ message: "Error fetching recommendations", error });
//     }
// };

