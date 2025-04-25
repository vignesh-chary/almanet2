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

		// Record profile view if the viewer is not the profile owner
		if (req.user._id.toString() !== user._id.toString()) {
			user.interactions.push({
				interactionType: "PROFILE_VIEW",
				details: `Viewed by ${req.user.username}`,
			});
			await user.save();
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
	try {
		const { query } = req.query;

		if (!query) return res.status(400).json({ message: "Query is required" });

		const users = await User.find({
			$or: [
				{ username: { $regex: query, $options: "i" } },
			],
		}).limit(10).select("username profilePicture headline");

		// Record search appearances for each user found
		for (const foundUser of users) {
			if (foundUser._id.toString() !== req.user._id.toString()) {
				if (!foundUser.interactions) {
					foundUser.interactions = [];
				}
				foundUser.interactions.push({
					interactionType: "SEARCH_APPEARANCE",
					details: `Appeared in search: ${query}`,
					timestamp: new Date()
				});
				await foundUser.save();
			}
		}

		res.json(users);
	} catch (error) {
		console.error("Error in searchUsers:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const recordInteraction = async (req, res) => {
    try {
        const { targetUserId, interactionType, details } = req.body;
        
        if (!targetUserId || !interactionType) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found" });
        }

        // Add the interaction
        targetUser.interactions.push({
            interactionType,
            details: details || `${interactionType} by ${req.user.username}`,
        });

        await targetUser.save();
        res.json({ message: "Interaction recorded successfully" });
    } catch (error) {
        console.error("Error in recordInteraction:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId || req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Calculate date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Calculate date 14 days ago for trend comparison
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        // Get profile views
        const recentProfileViews = user.interactions.filter(
            interaction => 
                interaction.interactionType === "PROFILE_VIEW" && 
                interaction.date >= sevenDaysAgo
        ).length;

        const previousProfileViews = user.interactions.filter(
            interaction => 
                interaction.interactionType === "PROFILE_VIEW" && 
                interaction.date >= fourteenDaysAgo && 
                interaction.date < sevenDaysAgo
        ).length;

        // Get search appearances
        const recentSearchAppearances = user.interactions.filter(
            interaction => 
                interaction.interactionType === "SEARCH_APPEARANCE" && 
                interaction.date >= sevenDaysAgo
        ).length;

        const previousSearchAppearances = user.interactions.filter(
            interaction => 
                interaction.interactionType === "SEARCH_APPEARANCE" && 
                interaction.date >= fourteenDaysAgo && 
                interaction.date < sevenDaysAgo
        ).length;

        // Calculate trends (percentage change)
        const profileViewsTrend = previousProfileViews === 0 
            ? 100 
            : ((recentProfileViews - previousProfileViews) / previousProfileViews) * 100;

        const searchAppearancesTrend = previousSearchAppearances === 0 
            ? 100 
            : ((recentSearchAppearances - previousSearchAppearances) / previousSearchAppearances) * 100;

        res.json({
            profileViews: {
                total: user.interactions.filter(i => i.interactionType === "PROFILE_VIEW").length,
                recent: recentProfileViews,
                trend: Math.round(profileViewsTrend)
            },
            searchAppearances: {
                total: user.interactions.filter(i => i.interactionType === "SEARCH_APPEARANCE").length,
                recent: recentSearchAppearances,
                trend: Math.round(searchAppearancesTrend)
            },
            connections: user.connections.length
        });
    } catch (error) {
        console.error("Error in getUserStats:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getProfilePicture = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select("profilePicture");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ profilePicture: user.profilePicture });
    } catch (error) {
        console.error("Error in getProfilePicture controller:", error);
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

